"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import {
  adminCreateMerchVariant,
  adminDeleteMerchVariant,
  adminUpdateMerchVariant,
} from "@/lib/adminActions";
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
  const [priceDelta, setPriceDelta] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    try {
      const id = await adminCreateMerchVariant(productId, { label, priceDelta });
      setVariants((prev) => [...prev, { id, productId, label, priceDelta }]);
      setLabel("");
      setPriceDelta(0);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 옵션을 삭제하시겠습니까? 이 옵션으로 주문된 이력이 있으면 삭제할 수 없습니다.")) return;
    setPendingId(id);
    setErrorId(null);
    try {
      await adminDeleteMerchVariant(id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch {
      setErrorId(id);
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
            <div key={v.id} className="py-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex-1 font-medium text-ink">{v.label}</span>
                {v.priceDelta !== 0 && (
                  <span className="text-xs text-ink-faint">
                    {v.priceDelta > 0 ? "+" : ""}
                    {formatKRW(v.priceDelta)}
                  </span>
                )}
                <button
                  type="button"
                  disabled={pendingId === v.id}
                  onClick={() => handleDelete(v.id)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
              {errorId === v.id && (
                <p className="mt-1 text-xs text-red-600">
                  삭제하지 못했습니다. 이 옵션으로 주문된 이력이 있습니다.
                </p>
              )}
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
