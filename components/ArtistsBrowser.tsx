"use client";

import { useMemo, useState } from "react";
import ArtistCard from "@/components/ArtistCard";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import type { Artist } from "@/lib/types";

export default function ArtistsBrowser({ artists }: { artists: Artist[] }) {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    if (!term) return artists;
    return artists.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.nameEn.toLowerCase().includes(term) ||
        a.tagline.toLowerCase().includes(term) ||
        a.styleTags.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [artists, keyword]);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-3 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              d="M13.5 13.5 17 17M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            />
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="작가명, 스타일로 검색"
            className="h-11 w-full border border-line-strong bg-paper pr-3 pl-9 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-patina focus:ring-2 focus:ring-patina/15"
          />
        </div>
        <p className="text-xs text-ink-faint">총 {filtered.length}명의 작가</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {filtered.map((artist, i) => (
            <FadeInOnScroll key={artist.slug} delay={(i % 6) * 80}>
              <ArtistCard artist={artist} layout="square" />
            </FadeInOnScroll>
          ))}
        </div>
      ) : (
        <p className="py-24 text-center text-sm text-ink-faint">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
