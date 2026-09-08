"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MerchThumbnail from "./MerchThumbnail";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { useCart, type CartLineItem } from "./CartContext";
import { getMerchProductsByIds, getMyProfile, purchaseMerch } from "@/lib/queries";
import { TOSS_CLIENT_KEY } from "@/lib/toss";
import type { MerchProduct } from "@/lib/types";

const MADE_TO_ORDER_MAX_QUANTITY = 10;

interface PendingCartCheckout {
  items: CartLineItem[];
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
}

function pendingKey(orderId: string) {
  return `toss-pending-cart-${orderId}`;
}

export default function CartBrowser() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const [products, setProducts] = useState<Record<string, MerchProduct>>({});
  const [loaded, setLoaded] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("신용/체크카드");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<{ orderNumber: string; amount: number }[] | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ids = Array.from(new Set(items.map((i) => i.productId)));
    if (ids.length === 0) {
      setProducts({});
      setLoaded(true);
      return;
    }
    getMerchProductsByIds(ids)
      .then((list) => {
        setProducts(Object.fromEntries(list.map((p) => [p.id, p])));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    // Re-fetch whenever the cart's product set changes (items added/removed).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.productId).join(",")]);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (!profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
      })
      .catch(() => {});
  }, []);

  const total = items.reduce((sum, i) => {
    const product = products[i.productId];
    return product ? sum + product.price * i.quantity : sum;
  }, 0);

  // Returning from the Toss Payments redirect (successUrl/failUrl both point
  // back at this same page) — confirm the payment server-side, then finalize
  // each cart line with the checkout details we stashed before leaving the page.
  useEffect(() => {
    const failCode = searchParams.get("code");
    if (failCode) {
      // Reacting to Toss's redirect query params, not to local render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(`결제가 취소되었거나 실패했습니다. (${searchParams.get("message") ?? failCode})`);
      router.replace(pathname);
      return;
    }

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    if (!paymentKey || !orderId || !amount) return;

    const raw = sessionStorage.getItem(pendingKey(orderId));
    if (!raw) {
      setError("결제 정보를 확인할 수 없습니다. 다시 시도해 주세요.");
      router.replace(pathname);
      return;
    }

    const pending = JSON.parse(raw) as PendingCartCheckout;
    setSubmitting(true);
    (async () => {
      try {
        const confirmRes = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        if (!confirmRes.ok) throw new Error("confirm_failed");

        const results: { orderNumber: string; amount: number }[] = [];
        for (const item of pending.items) {
          const result = await purchaseMerch({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            shippingAddress: pending.shippingAddress,
            phone: pending.phone,
            name: pending.name,
            email: pending.email,
            paymentMethod: pending.paymentMethod,
          });
          results.push(result);
        }
        sessionStorage.removeItem(pendingKey(orderId));
        setReceipts(results);
        clear();
      } catch {
        setError("결제 승인 또는 주문 처리에 실패했습니다. 품절되었거나 일시적인 오류일 수 있습니다.");
      } finally {
        setSubmitting(false);
        router.replace(pathname);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const orderId = crypto.randomUUID();
    const pending: PendingCartCheckout = {
      items,
      shippingAddress,
      phone,
      name,
      email,
      paymentMethod,
    };
    const firstTitle = products[items[0]?.productId]?.title ?? "상품";
    const orderName = items.length > 1 ? `${firstTitle} 외 ${items.length - 1}건` : firstTitle;

    try {
      sessionStorage.setItem(pendingKey(orderId), JSON.stringify(pending));
      const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      const returnUrl = `${window.location.origin}${pathname}`;
      // Redirects the browser to Toss's hosted card payment window; on
      // success/failure Toss sends the browser back to returnUrl, where the
      // effect above picks the flow back up and finalizes the order.
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: total },
        orderId,
        orderName,
        customerName: name,
        customerEmail: email,
        successUrl: returnUrl,
        failUrl: returnUrl,
      });
    } catch {
      sessionStorage.removeItem(pendingKey(orderId));
      setError("결제가 취소되었거나 결제창을 여는 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  if (receipts) {
    const grandTotal = receipts.reduce((s, r) => s + r.amount, 0);
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">결제 완료</p>
        <h1 className="mb-4 font-display text-2xl">주문이 완료되었습니다</h1>
        <p className="mb-8 text-sm text-ink-soft">
          {receipts.length}건 · {formatKRW(grandTotal)} 결제가 완료되었습니다.
        </p>
        <Link href="/shop" className={buttonClasses("ghost")}>
          Shop으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!loaded) return <p className="text-sm text-ink-faint">불러오는 중...</p>;

  if (items.length === 0) {
    return (
      <div>
        <p className="text-sm text-ink-faint">장바구니가 비어 있습니다.</p>
        <Link href="/shop" className={`mt-4 inline-block ${buttonClasses("ghost", "sm")}`}>
          Shop 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;
          return (
            <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-4 py-4">
              <div className="h-20 w-20 flex-none overflow-hidden">
                <MerchThumbnail
                  imageUrls={product.imageUrls}
                  hue={product.hue}
                  variant={product.variant}
                  seed={product.slug}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/shop/${product.slug}`} className="text-sm font-semibold hover:underline">
                  {product.title}
                </Link>
                <div className="mt-1 text-sm text-ink-soft">{formatKRW(product.price)}</div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                    className="h-8 w-8 border border-line-strong text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        Math.min(MADE_TO_ORDER_MAX_QUANTITY, item.quantity + 1)
                      )
                    }
                    className="h-8 w-8 border border-line-strong text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="ml-2 text-xs text-ink-faint hover:text-ink hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold">{formatKRW(product.price * item.quantity)}</div>
            </div>
          );
        })}
      </div>

      <aside className="h-fit border border-line p-5">
        <div className="mb-4 flex justify-between text-sm font-semibold">
          <span>총 결제금액</span>
          <span>{formatKRW(total)}</span>
        </div>
        <form onSubmit={handleCheckout} className="space-y-4">
          <Field label="이름">
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="이메일">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="배송지">
            <textarea
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="h-20 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
            />
          </Field>
          <Field label="연락처">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="결제 수단">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            >
              <option>신용/체크카드</option>
              <option>계좌이체</option>
              <option>간편결제</option>
            </select>
          </Field>
          <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
            {submitting ? "결제 처리 중..." : `${formatKRW(total)} 결제하기`}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}
