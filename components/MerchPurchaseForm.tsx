"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { getMyProfile } from "@/lib/queries";
import { useCart } from "@/components/CartContext";
import ShippingNotice from "@/components/ShippingNotice";
import { newTossOrderId, useTossPaymentWidget } from "@/components/useTossPaymentWidget";
import {
  MERCH_MAX_QUANTITY,
  TOSS_MERCH_ORDER_PREFIX,
  TOSS_MERCH_ORDER_STORAGE_PREFIX,
  type PendingMerchOrder,
} from "@/lib/tosspayments";
import type { MerchProduct, MerchVariant } from "@/lib/types";

export default function MerchPurchaseForm({
  product,
  variants,
  editionsRemaining,
  selectedArtworkId = null,
  requiresArtworkSelection = false,
  exportDesignImage,
}: {
  product: MerchProduct;
  variants: MerchVariant[];
  editionsRemaining: number | null;
  /** Template products only — the artwork the customer picked via
   * MerchArtworkPicker, forwarded to purchase_merch. */
  selectedArtworkId?: string | null;
  requiresArtworkSelection?: boolean;
  /** Rasterizes the MerchCanvasEditor design and uploads it, returning the
   * stored URL — called right before purchase for template products. */
  exportDesignImage?: () => Promise<string | null>;
}) {
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [profileAddress, setProfileAddress] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (!profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setProfileAddress(profile.address);
      })
      .catch(() => {});
  }, []);

  function toggleUseProfileAddress() {
    setUseProfileAddress((prev) => {
      const next = !prev;
      setShippingAddress(next ? profileAddress : "");
      return next;
    });
  }

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;
  // Cart checkout runs purchase_merch per line item (see /shop/cart), which
  // doesn't model editions' one-at-a-time draw well across multiple cart
  // sessions, and cart items don't carry a per-item artwork selection — so
  // only plain made-to-order, non-template items support "add to cart";
  // editions/variants/template products stay direct-purchase-only.
  const cartEligible = product.fulfillment === "made_to_order" && !product.hasVariants && !requiresArtworkSelection;

  const maxQuantity = useMemo(() => {
    if (product.fulfillment === "edition") return 1;
    return MERCH_MAX_QUANTITY;
  }, [product]);

  const soldOut = product.fulfillment === "edition" ? (editionsRemaining ?? 0) <= 0 : false;

  const unitPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const total = unitPrice * quantity;

  const toss = useTossPaymentWidget({
    amount: total,
    methodsId: "toss-merch-payment-methods",
    agreementId: "toss-merch-agreement",
    enabled: !soldOut,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const widget = toss.widgetRef.current;
    if (!widget) {
      setError("결제창이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const orderId = newTossOrderId(TOSS_MERCH_ORDER_PREFIX);
    const storageKey = `${TOSS_MERCH_ORDER_STORAGE_PREFIX}${orderId}`;
    try {
      const designImageUrl = requiresArtworkSelection && exportDesignImage ? await exportDesignImage() : null;
      // TossPayments 결제창에는 orderId/orderName/고객정보만 넘어가므로, 나머지 주문 정보는
      // 결제 완료 페이지에서 이어받을 수 있도록 세션에 잠시 보관합니다.
      const pending: PendingMerchOrder = {
        items: [
          {
            productId: product.id,
            variantId: product.hasVariants ? variantId : null,
            quantity,
            artworkId: selectedArtworkId,
            designImageUrl,
          },
        ],
        shippingAddress,
        phone,
        name,
        email,
        marketingOptIn,
        fromCart: false,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(pending));

      await widget.requestPayment({
        orderId,
        orderName: product.title,
        customerName: name,
        customerEmail: email,
        successUrl: `${window.location.origin}/shop/checkout/success`,
        failUrl: `${window.location.origin}/shop/checkout/fail?from=${encodeURIComponent(window.location.pathname)}`,
      });
      // 정상 흐름에서는 TossPayments 결제창이 successUrl/failUrl로 이동시키므로 여기까지 오지 않습니다.
    } catch {
      sessionStorage.removeItem(storageKey);
      setError("결제가 취소되었거나 실패했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  if (soldOut) {
    return (
      <div className="border border-line p-5 text-center text-sm text-ink-faint">
        일시 품절되었습니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {product.hasVariants && (
        <Field label="옵션">
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`border px-3 py-2 text-xs ${
                  variantId === v.id ? "border-patina font-semibold text-patina" : "border-line-strong text-ink-soft"
                }`}
              >
                {v.label}
                {v.priceDelta > 0 ? ` (+${formatKRW(v.priceDelta)})` : ""}
              </button>
            ))}
          </div>
        </Field>
      )}

      {product.fulfillment === "made_to_order" && (
        <Field label="수량">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-9 w-9 border border-line-strong text-sm"
            >
              −
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="h-9 w-9 border border-line-strong text-sm"
            >
              +
            </button>
          </div>
        </Field>
      )}

      {product.fulfillment === "edition" && (
        <p className="text-xs text-ink-faint">한정 {product.editionSize}점 중 {editionsRemaining}점 남음</p>
      )}

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
        {profileAddress && (
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={useProfileAddress}
              onChange={toggleUseProfileAddress}
              className="accent-patina"
            />
            등록된 주소와 동일
          </label>
        )}
        <textarea
          required
          disabled={useProfileAddress}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="받으실 주소를 입력해주세요"
          className="h-20 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina disabled:text-ink-faint"
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
      <Field label="결제 수단 (TossPayments)">
        <div id="toss-merch-payment-methods" />
        <div id="toss-merch-agreement" className="mt-2" />
        {!toss.ready && !toss.loadError && <p className="mt-2 text-xs text-ink-faint">결제창을 불러오는 중...</p>}
        {toss.loadError && (
          <p className="mt-2 text-xs text-red-600">결제창을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</p>
        )}
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={() => setMarketingOptIn((v) => !v)}
          className="accent-patina"
        />
        신작 소식 등 마케팅 이메일 수신에 동의합니다
      </label>

      <ShippingNotice kind="standard" />

      <div className="flex gap-3">
        {cartEligible && (
          <button
            type="button"
            onClick={() => {
              addItem(product.id, null, quantity);
              setAddedToCart(true);
            }}
            className={`flex-1 ${buttonClasses("ghost")}`}
          >
            {addedToCart ? "담았습니다" : "장바구니에 담기"}
          </button>
        )}
        <button
          type="submit"
          disabled={
            submitting ||
            !toss.ready ||
            (product.hasVariants && !variantId) ||
            (requiresArtworkSelection && !selectedArtworkId)
          }
          className={`flex-1 ${buttonClasses("primary")} disabled:opacity-40`}
        >
          {submitting
            ? "결제 처리 중..."
            : requiresArtworkSelection && !selectedArtworkId
              ? "먼저 작품을 선택해주세요"
              : `${formatKRW(total)} 결제하기`}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
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
