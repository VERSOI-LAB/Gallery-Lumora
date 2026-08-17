"use client";

import { useState } from "react";
import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { formatKRW } from "@/lib/format";
import { getMediumType } from "@/lib/mediumTaxonomy";
import { updateArtworkMerchEnabled } from "@/lib/queries";
import type { Artwork } from "@/lib/types";

export default function ArtworkManageList({ artworks: initial }: { artworks: Artwork[] }) {
  const [artworks, setArtworks] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

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

  if (artworks.length === 0) {
    return <p className="text-sm text-ink-faint">아직 등록한 작품이 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="flex items-center gap-4 py-4">
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

      {errorId && (
        <p className="py-3 text-xs text-red-600">변경 사항을 저장하지 못했습니다. 다시 시도해주세요.</p>
      )}
    </div>
  );
}
