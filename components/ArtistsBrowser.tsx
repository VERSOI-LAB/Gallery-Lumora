"use client";

import { useMemo, useState } from "react";
import ArtistCard from "@/components/ArtistCard";
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
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="작가명으로 검색"
        className="mb-8 h-10 w-full max-w-sm border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
      />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">
          {filtered.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} layout="square" />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-ink-faint">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
