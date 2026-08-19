"use client";

import { useEffect, useState } from "react";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { searchArtworksByTitle } from "@/lib/queries";
import type { Artwork } from "@/lib/types";

const DEBOUNCE_MS = 300;

/** Template-product ("고객이 작품을 직접 선택" 굿즈) 상세페이지에서 쓰는 작품
 * 검색·선택 UI. 선택된 작품이 바뀔 때마다 부모(MerchPurchaseForm)로 알려줘
 * 대표 이미지·구매 가능 여부를 갱신하게 한다. */
export default function MerchArtworkPicker({
  selected,
  onSelect,
}: {
  selected: Artwork | null;
  onSelect: (artwork: Artwork | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) return;
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      searchArtworksByTitle(query)
        .then((data) => {
          if (active) setResults(data);
        })
        .catch(() => {
          if (active) setError("작품을 검색하지 못했습니다. 잠시 후 다시 시도해주세요.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, trimmedQuery]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 border border-patina bg-patina-soft p-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden">
          <ArtworkThumbnail
            imageUrls={selected.imageUrls}
            hue={selected.hue}
            variant={selected.variant}
            seed={selected.slug}
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{selected.title}</p>
          <p className="text-xs text-ink-soft">{selected.artistName}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery("");
          }}
          className="shrink-0 text-xs text-ink-soft hover:underline"
        >
          다시 선택
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="작품명으로 검색해서 디자인할 작품을 선택해주세요"
        className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
      />
      {loading && <p className="mt-2 text-xs text-ink-faint">검색 중...</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!loading && trimmedQuery && results.length === 0 && !error && (
        <p className="mt-2 text-xs text-ink-faint">검색 결과가 없습니다.</p>
      )}
      {trimmedQuery && results.length > 0 && (
        <ul className="mt-2 divide-y divide-line border border-line">
          {results.map((artwork) => (
            <li key={artwork.id}>
              <button
                type="button"
                disabled={!artwork.merchEnabled}
                onClick={() => {
                  onSelect(artwork);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-paper-raised disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                  <ArtworkThumbnail
                    imageUrls={artwork.imageUrls}
                    hue={artwork.hue}
                    variant={artwork.variant}
                    seed={artwork.slug}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{artwork.title}</p>
                  <p className="text-xs text-ink-soft">{artwork.artistName}</p>
                </div>
                {!artwork.merchEnabled && (
                  <span className="shrink-0 text-[11px] font-medium text-red-600">굿즈제작불가</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
