"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { updateArtistCommissionSettings } from "@/lib/queries";
import type { Artist } from "@/lib/types";

export default function CommissionAvailabilityForm({ artist }: { artist: Artist }) {
  const [accepting, setAccepting] = useState(artist.commission.accepting);
  const [priceRange, setPriceRange] = useState(artist.commission.priceRange);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    setError(null);
    try {
      await updateArtistCommissionSettings(artist.id, {
        commissionAccepting: accepting,
        commissionPriceRange: priceRange,
      });
      setSaved(true);
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 border border-line p-5">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={accepting}
          onChange={(e) => setAccepting(e.target.checked)}
          className="accent-patina"
        />
        커미션 접수 (1:1 주문 제작 의뢰 가능 여부)
      </label>

      {accepting && (
        <label className="mt-4 block max-w-xs">
          <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">커미션 비용 범위</span>
          <input
            type="text"
            placeholder="예: 50만원~200만원"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </label>
      )}

      <button type="submit" disabled={submitting} className={`${buttonClasses("primary", "sm")} mt-4`}>
        {submitting ? "저장 중..." : "저장"}
      </button>
      {saved && <p className="mt-2 text-xs text-patina">저장되었습니다.</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}
