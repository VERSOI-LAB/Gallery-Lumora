"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { getMediumType } from "@/lib/mediumTaxonomy";
import { downloadCsv } from "@/lib/csv";
import { adminDeleteArtwork, adminSetExhibitionFeaturedArtwork } from "@/lib/adminActions";
import type { Artwork } from "@/lib/types";

export default function AdminArtworkList({ artworks: initial }: { artworks: Artwork[] }) {
  const [artworks, setArtworks] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [featurePendingId, setFeaturePendingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const term = keyword.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return artworks;
    return artworks.filter(
      (a) => a.title.toLowerCase().includes(term) || a.artistName.toLowerCase().includes(term)
    );
  }, [artworks, term]);

  async function toggleExhibitionFeatured(id: string, currentlyFeatured: boolean) {
    setFeaturePendingId(id);
    try {
      const nextId = currentlyFeatured ? null : id;
      await adminSetExhibitionFeaturedArtwork(nextId);
      setArtworks((prev) => prev.map((a) => ({ ...a, isExhibitionFeatured: a.id === nextId })));
    } catch {
      setErrorId(id);
    } finally {
      setFeaturePendingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("이 작품을 삭제하시겠습니까? 연결된 주문·굿즈 상품이 있으면 삭제할 수 없습니다.")) return;
    setPendingId(id);
    setErrorId(null);
    try {
      await adminDeleteArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setErrorId(id);
    } finally {
      setPendingId(null);
    }
  }

  function exportCsv() {
    downloadCsv(
      `lumora-artworks-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((a) => ({
        작품명: a.title,
        작가: a.artistName,
        매체: getMediumType(a.mediumTypeCode)?.nameKo ?? a.mediumTypeCode,
        가격: a.price,
        판매여부: a.sold ? "판매완료" : "판매중",
        조회수: a.viewCount,
      }))
    );
  }

  if (artworks.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 작품이 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="작품명, 작가명으로 검색"
          className="h-10 flex-1 min-w-[200px] border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className={`${buttonClasses("ghost", "sm")} disabled:opacity-40`}
        >
          CSV 내보내기
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((artwork) => (
        <div key={artwork.id}>
          <div className="flex items-center gap-4 py-4">
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
                {artwork.isExhibitionFeatured && (
                  <span className="flex-none border border-patina px-1.5 py-0.5 text-[10px] font-semibold text-patina">
                    전시 메인
                  </span>
                )}
              </div>
              <div className="text-xs text-ink-soft">
                {artwork.artistName} · {getMediumType(artwork.mediumTypeCode)?.nameKo ?? artwork.mediumTypeCode} ·{" "}
                {formatKRW(artwork.price)}
              </div>
            </div>

            <div className="flex flex-none items-center gap-4">
              <button
                type="button"
                disabled={featurePendingId === artwork.id}
                onClick={() => toggleExhibitionFeatured(artwork.id, artwork.isExhibitionFeatured)}
                className="text-xs text-ink-soft hover:text-ink hover:underline disabled:opacity-40"
              >
                {artwork.isExhibitionFeatured ? "전시 메인 해제" : "전시 메인으로 설정"}
              </button>
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
      )}
    </div>
  );
}
