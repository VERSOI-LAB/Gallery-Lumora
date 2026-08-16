"use client";

import { useState } from "react";
import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { formatKRW } from "@/lib/format";
import { getMediumType } from "@/lib/mediumTaxonomy";
import { deleteArtwork } from "@/lib/queries";
import type { Artwork } from "@/lib/types";

export default function AdminArtworkList({ artworks: initial }: { artworks: Artwork[] }) {
  const [artworks, setArtworks] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("이 작품을 삭제하시겠습니까? 연결된 주문·굿즈 상품이 있으면 삭제할 수 없습니다.")) return;
    setPendingId(id);
    setErrorId(null);
    try {
      await deleteArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setErrorId(id);
    } finally {
      setPendingId(null);
    }
  }

  if (artworks.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 작품이 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {artworks.map((artwork) => (
        <div key={artwork.id}>
          <div className="flex items-center gap-4 py-4">
            <div className="h-16 w-[52px] flex-none overflow-hidden">
              <PlaceholderArt
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
                {artwork.artistName} · {getMediumType(artwork.mediumTypeCode)?.nameKo ?? artwork.mediumTypeCode} ·{" "}
                {formatKRW(artwork.price)}
              </div>
            </div>

            <div className="flex flex-none items-center gap-4">
              <Link
                href={`/admin/artworks/${artwork.id}/edit`}
                className="text-xs text-ink-soft hover:text-ink hover:underline"
              >
                수정
              </Link>
              <button
                type="button"
                disabled={pendingId === artwork.id}
                onClick={() => remove(artwork.id)}
                className="text-xs text-red-600 hover:underline disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
          {errorId === artwork.id && (
            <p className="pb-3 text-xs text-red-600">
              삭제하지 못했습니다. 이 작품에 연결된 주문 또는 굿즈 상품이 있는지 확인해주세요.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
