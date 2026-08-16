"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { purchaseMerch } from "@/lib/queries";
import type { MerchProduct, MerchVariant } from "@/lib/types";

export default function MerchPurchaseForm({
  product,
  variants,
  editionsRemaining,
}: {
  product: MerchProduct;
  variants: MerchVariant[];
  editionsRemaining: number | null;
}) {
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("신용/체크카드");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; amount: number } | null>(null);

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;

  const maxQuantity = useMemo(() => {
    if (product.fulfillment === "edition") return 1;
    if (product.hasVariants) return selectedVariant?.stockQuantity ?? 0;
    return product.stockQuantity ?? 0;
  }, [product, selectedVariant]);

  const soldOut =
    product.fulfillment === "edition"
      ? (editionsRemaining ?? 0) <= 0
      : product.hasVariants
        ? variants.every((v) => v.stockQuantity <= 0)
        : (product.stockQuantity ?? 0) <= 0;

  const unitPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const total = unitPrice * quantity;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await purchaseMerch({
        productId: product.id,
        variantId: product.hasVariants ? variantId : null,
        quantity,
        shippingAddress,
        phone,
        name,
        email,
        paymentMethod,
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
            {variants.map((v) => {
              const disabled = v.stockQuantity <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setVariantId(v.id)}
                  className={`border px-3 py-2 text-xs ${
                    variantId === v.id
                      ? "border-patina font-semibold text-patina"
                      : "border-line-strong text-ink-soft"
                  } ${disabled ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                >
                  {v.label}
                  {v.priceDelta > 0 ? ` (+${formatKRW(v.priceDelta)})` : ""}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {product.fulfillment === "stock" && (
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
            <span className="text-xs text-ink-faint">{maxQuantity}개 남음</span>
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

      <button
        type="submit"
        disabled={submitting || (product.hasVariants && !variantId)}
        className={`w-full ${buttonClasses("primary")}`}
      >
        {submitting ? "결제 처리 중..." : `${formatKRW(total)} 결제하기`}
      </button>
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
