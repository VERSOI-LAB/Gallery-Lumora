"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { purchaseMerch } from "@/lib/queries";
import { useCart } from "@/components/CartContext";
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
  const [paymentMethod, setPaymentMethod] = useState("신용/체크카드");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; amount: number } | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;
  // Cart checkout re-runs purchaseMerch per line item (see /shop/cart), which
  // doesn't model editions' one-at-a-time draw well across multiple cart
  // sessions, and cart items don't carry a per-item artwork selection — so
  // only plain made-to-order, non-template items support "add to cart";
  // editions/variants/template products stay direct-purchase-only.
  const cartEligible = product.fulfillment === "made_to_order" && !product.hasVariants && !requiresArtworkSelection;

  const MADE_TO_ORDER_MAX_QUANTITY = 10;

  const maxQuantity = useMemo(() => {
    if (product.fulfillment === "edition") return 1;
    return MADE_TO_ORDER_MAX_QUANTITY;
  }, [product]);

  const soldOut = product.fulfillment === "edition" ? (editionsRemaining ?? 0) <= 0 : false;

  const unitPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const total = unitPrice * quantity;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const designImageUrl = requiresArtworkSelection && exportDesignImage ? await exportDesignImage() : null;
      const result = await purchaseMerch({
        productId: product.id,
        variantId: product.hasVariants ? variantId : null,
        artworkId: selectedArtworkId,
        designImageUrl,
        quantity,
        shippingAddress,
        phone,
        name,
        email,
        paymentMethod,
        marketingOptIn,
      });
      setReceipt(result);
    } catch {
      setError("결제에 실패했습니다. 품절되었거나 일시적인 오류일 수 있습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="border border-patina p-6 text-center">
        <p className="mb-2 text-xs font-semibold tracking-wide text-patina uppercase">결제 완료</p>
        <p className="mb-1 text-sm font-semibold">
          주문번호 {receipt.orderNumber}
        </p>
        <p className="mb-5 text-sm text-ink-soft">{formatKRW(receipt.amount)} 결제가 완료되었습니다.</p>
        <Link href="/shop" className={buttonClasses("ghost", "sm")}>
          Shop으로 돌아가기
        </Link>
      </div>
    );
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
        <textarea
          required
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="받으실 주소를 입력해주세요"
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
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={() => setMarketingOptIn((v) => !v)}
          className="accent-patina"
        />
        신작 소식 등 마케팅 이메일 수신에 동의합니다
      </label>

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
            submitting || (product.hasVariants && !variantId) || (requiresArtworkSelection && !selectedArtworkId)
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
