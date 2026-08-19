"use client";

import { useState } from "react";
import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { formatKRW } from "@/lib/format";
import { getMediumType } from "@/lib/mediumTaxonomy";
import { updateArtworkMerchEnabled, updateArtworkTaxStatus, updateArtworksTaxStatus } from "@/lib/queries";
import type { Artwork } from "@/lib/types";

export default function ArtworkManageList({ artworks: initial }: { artworks: Artwork[] }) {
  const [artworks, setArtworks] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState(false);

  async function toggleMerch(artwork: Artwork) {
    const next = !artwork.merchEnabled;
    setPendingId(artwork.id);
    setErrorId(null);
    setArtworks((prev) => prev.map((a) => (a.id === artwork.id ? { ...a, merchEnabled: next } : a)));
    try {
      await updateArtworkMerchEnabled(artwork.id, next);
    } catch {
      setArtworks((prev) => prev.map((a) => (a.id === artwork.id ? { ...a, merchEnabled: !next } : a)));
      setErrorId(artwork.id);
    } finally {
      setPendingId(null);
    }
  }

  async function changeTaxStatus(artwork: Artwork, next: "taxable" | "exempt") {
    const prevStatus = artwork.taxStatus;
    setPendingId(artwork.id);
    setErrorId(null);
    setArtworks((prev) => prev.map((a) => (a.id === artwork.id ? { ...a, taxStatus: next } : a)));
    try {
      await updateArtworkTaxStatus(artwork.id, next);
    } catch {
      setArtworks((prev) => prev.map((a) => (a.id === artwork.id ? { ...a, taxStatus: prevStatus } : a)));
      setErrorId(artwork.id);
    } finally {
      setPendingId(null);
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.length === artworks.length ? [] : artworks.map((a) => a.id)));
  }

  async function applyBulkTaxStatus(next: "taxable" | "exempt") {
    if (selectedIds.length === 0) return;
    const prevArtworks = artworks;
    setBulkPending(true);
    setBulkError(false);
    setArtworks((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, taxStatus: next } : a)));
    try {
      await updateArtworksTaxStatus(selectedIds, next);
    } catch {
      setArtworks(prevArtworks);
      setBulkError(true);
    } finally {
      setBulkPending(false);
    }
  }

  if (artworks.length === 0) {
    return <p className="text-sm text-ink-faint">아직 등록한 작품이 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 border border-line bg-paper-raised px-4 py-3 text-xs">
        <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
          <input
            type="checkbox"
            checked={selectedIds.length > 0 && selectedIds.length === artworks.length}
            onChange={toggleSelectAll}
            className="accent-patina"
          />
          전체 선택
        </label>
        <span className="text-ink-faint">{selectedIds.length}개 선택됨</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={selectedIds.length === 0 || bulkPending}
            onClick={() => applyBulkTaxStatus("taxable")}
            className="border border-line-strong px-3 py-1.5 text-ink-soft hover:text-ink disabled:opacity-40"
          >
            선택 항목 과세로 설정
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || bulkPending}
            onClick={() => applyBulkTaxStatus("exempt")}
            className="border border-line-strong px-3 py-1.5 text-ink-soft hover:text-ink disabled:opacity-40"
          >
            선택 항목 면세로 설정
          </button>
        </div>
      </div>
      {bulkError && (
        <p className="mb-3 text-xs text-red-600">일부 항목을 변경하지 못했습니다. 다시 시도해주세요.</p>
      )}

      <div className="divide-y divide-line border-y border-line">
        {artworks.map((artwork) => (
        <div key={artwork.id} className="flex items-center gap-4 py-4">
          <input
            type="checkbox"
            aria-label={`${artwork.title} 선택`}
            checked={selectedIds.includes(artwork.id)}
            onChange={() => toggleSelected(artwork.id)}
            className="flex-none accent-patina"
          />

          <div className="h-16 w-[52px] flex-none overflow-hidden">
            <ArtworkThumbnail
              imageUrls={artwork.imageUrls}
              hue={artwork.hue}
              variant={artwork.variant}
              seed={artwork.slug}
              className="h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-ink">{artwork.title}</span>
              {artwork.sold && (
                <span className="flex-none bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                  SOLD
                </span>
              )}
            </div>
            <div className="text-xs text-ink-soft">
              {getMediumType(artwork.mediumTypeCode)?.nameKo ?? artwork.mediumTypeCode} ·{" "}
              {formatKRW(artwork.price)} · 조회 {artwork.viewCount}
            </div>
          </div>

          <label className="flex-none text-xs text-ink-soft">
            <span className="mb-1 block text-[10px] text-ink-faint uppercase">부가세</span>
            <select
              value={artwork.taxStatus}
              disabled={pendingId === artwork.id}
              onChange={(e) => changeTaxStatus(artwork, e.target.value as "taxable" | "exempt")}
              className="h-8 border border-line-strong bg-paper-raised px-2 text-xs outline-patina disabled:opacity-50"
            >
              <option value="taxable">과세</option>
              <option value="exempt">면세</option>
            </select>
          </label>

          <div className="flex flex-none flex-col items-end gap-1">
            <button
              type="button"
              role="switch"
              aria-checked={artwork.merchEnabled}
              aria-label="굿즈 허용"
              disabled={pendingId === artwork.id}
              onClick={() => toggleMerch(artwork)}
              className={`relative h-6 w-10 flex-none rounded-full transition-colors disabled:opacity-50 ${
                artwork.merchEnabled ? "bg-patina" : "bg-line-strong"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform ${
                  artwork.merchEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[10px] text-ink-faint">
              {artwork.merchEnabled ? "굿즈 허용됨" : "굿즈 비허용"}
            </span>
          </div>

          <Link
            href={`/studio/works/${artwork.id}/edit`}
            className="flex-none text-xs text-ink-soft hover:text-ink hover:underline"
          >
            수정
          </Link>
        </div>
        ))}
      </div>

      {errorId && (
        <p className="mt-3 text-xs text-red-600">변경 사항을 저장하지 못했습니다. 다시 시도해주세요.</p>
      )}
    </div>
  );
}
