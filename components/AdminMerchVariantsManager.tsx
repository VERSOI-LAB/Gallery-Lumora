"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { createMerchVariant, deleteMerchVariant, updateMerchVariant } from "@/lib/queries";
import type { MerchVariant } from "@/lib/types";

export default function AdminMerchVariantsManager({
  productId,
  variants: initial,
}: {
  productId: string;
  variants: MerchVariant[];
}) {
  const [variants, setVariants] = useState(initial);
  const [label, setLabel] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [priceDelta, setPriceDelta] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    try {
      const id = await createMerchVariant(productId, { label, stockQuantity, priceDelta });
      setVariants((prev) => [...prev, { id, productId, label, stockQuantity, priceDelta }]);
      setLabel("");
      setStockQuantity(0);
      setPriceDelta(0);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStockChange(variant: MerchVariant, nextStock: number) {
    setPendingId(variant.id);
    setVariants((prev) => prev.map((v) => (v.id === variant.id ? { ...v, stockQuantity: nextStock } : v)));
    try {
      await updateMerchVariant(variant.id, {
        label: variant.label,
        stockQuantity: nextStock,
        priceDelta: variant.priceDelta,
      });
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 옵션을 삭제하시겠습니까?")) return;
    setPendingId(id);
    try {
      await deleteMerchVariant(id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="border-t border-line pt-5">
      <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">옵션 관리</p>

      {variants.length > 0 && (
        <div className="mb-5 divide-y divide-line border-y border-line">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="flex-1 font-medium text-ink">{v.label}</span>
              {v.priceDelta !== 0 && (
                <span className="text-xs text-ink-faint">
                  {v.priceDelta > 0 ? "+" : ""}
                  {formatKRW(v.priceDelta)}
                </span>
              )}
              <input
                type="number"
                min={0}
                value={v.stockQuantity}
                disabled={pendingId === v.id}
                onChange={(e) => handleStockChange(v, Number(e.target.value))}
                className="h-8 w-20 border border-line-strong bg-paper-raised px-2 text-xs outline-patina"
              />
              <span className="text-xs text-ink-faint">재고</span>
              <button
                type="button"
                disabled={pendingId === v.id}
                onClick={() => handleDelete(v.id)}
                className="text-xs text-red-600 hover:underline disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-soft uppercase">옵션명</span>
          <input
            required
            type="text"
            placeholder="예: 블랙"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-9 w-32 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-soft uppercase">재고</span>
          <input
            type="number"
            min={0}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            className="h-9 w-24 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-soft uppercase">추가금액</span>
          <input
            type="number"
            step={1000}
            value={priceDelta}
            onChange={(e) => setPriceDelta(Number(e.target.value))}
            className="h-9 w-28 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
          />
        </label>
        <button type="submit" disabled={submitting} className={buttonClasses("ghost", "sm")}>
          옵션 추가
        </button>
      </form>
    </div>
  );
}
