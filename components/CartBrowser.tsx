"use client";

import { useEffect, useState, type FormEvent } from "react";
import PhoneInput from "./PhoneInput";
import Link from "next/link";
import MerchThumbnail from "./MerchThumbnail";
import ShippingNotice from "./ShippingNotice";
import AddressSearchField from "./AddressSearchField";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { useCart } from "./CartContext";
import { newTossOrderId, tossErrorMessage, useTossPaymentWidget } from "./useTossPaymentWidget";
import { getMerchProductsByIds, getMyProfile } from "@/lib/queries";
import {
  MERCH_MAX_QUANTITY,
  TOSS_MERCH_ORDER_PREFIX,
  TOSS_MERCH_ORDER_STORAGE_PREFIX,
  type PendingMerchOrder,
} from "@/lib/tosspayments";
import type { MerchProduct } from "@/lib/types";

export default function CartBrowser() {
  const { items, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, MerchProduct>>({});
  const [loaded, setLoaded] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 장바구니 상품 정보를 다 불러온 뒤에만 결제위젯을 그립니다(금액이 확정된 뒤).
  const purchasableItems = items.filter((i) => products[i.productId]);
  const toss = useTossPaymentWidget({
    amount: total,
    methodsId: "toss-cart-payment-methods",
    agreementId: "toss-cart-agreement",
    enabled: loaded && purchasableItems.length > 0,
  });

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError("주소 찾기로 배송지를 입력해주세요.");
      return;
    }
    const widget = toss.widgetRef.current;
    if (!widget) {
      setError("결제창이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const orderId = newTossOrderId(TOSS_MERCH_ORDER_PREFIX);
    const storageKey = `${TOSS_MERCH_ORDER_STORAGE_PREFIX}${orderId}`;
    // TossPayments 결제창에는 orderId/orderName/고객정보만 넘어가므로, 나머지 주문 정보는
    // 결제 완료 페이지에서 이어받을 수 있도록 세션에 잠시 보관합니다.
    const pending: PendingMerchOrder = {
      items: purchasableItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        artworkId: null,
        designImageUrl: null,
      })),
      shippingAddress,
      phone,
      name,
      email,
      marketingOptIn: true,
      fromCart: true,
    };
    sessionStorage.setItem(storageKey, JSON.stringify(pending));

    const firstTitle = products[purchasableItems[0].productId].title;
    try {
      await widget.requestPayment({
        orderId,
        orderName: purchasableItems.length > 1 ? `${firstTitle} 외 ${purchasableItems.length - 1}건` : firstTitle,
        customerName: name,
        customerEmail: email,
        successUrl: `${window.location.origin}/shop/checkout/success`,
        failUrl: `${window.location.origin}/shop/checkout/fail?from=${encodeURIComponent("/shop/cart")}`,
      });
      // 정상 흐름에서는 TossPayments 결제창이 successUrl/failUrl로 이동시키므로 여기까지 오지 않습니다.
    } catch (err) {
      sessionStorage.removeItem(storageKey);
      setError(tossErrorMessage(err));
      setSubmitting(false);
    }
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
                        Math.min(MERCH_MAX_QUANTITY, item.quantity + 1)
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
            <AddressSearchField onChange={setShippingAddress} />
          </Field>
          <Field label="연락처">
            <PhoneInput
              required
              value={phone}
              onChange={setPhone}
            />
          </Field>
          <Field label="결제 수단 (TossPayments)">
            <div id="toss-cart-payment-methods" />
            <div id="toss-cart-agreement" className="mt-2" />
            {!toss.ready && !toss.loadError && (
              <p className="mt-2 text-xs text-ink-faint">결제창을 불러오는 중...</p>
            )}
            {toss.loadError && (
              <p className="mt-2 text-xs text-red-600">결제창을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</p>
            )}
          </Field>
          <ShippingNotice kind="standard" />
          <button type="submit" disabled={submitting || !toss.ready} className={`w-full ${buttonClasses("primary")}`}>
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
