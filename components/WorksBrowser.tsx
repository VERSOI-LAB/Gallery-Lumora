"use client";

import { useMemo, useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import WorksFilterPanel from "@/components/WorksFilterPanel";
import type { Artwork } from "@/lib/types";

type Sort = "new" | "priceAsc" | "priceDesc";

export default function WorksBrowser({ artworks }: { artworks: Artwork[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showSold, setShowSold] = useState(true);
  const [sort, setSort] = useState<Sort>("new");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    const list = artworks.filter((w) => {
      if (selectedTypes.length && !selectedTypes.includes(w.mediumTypeCode)) return false;
      if (!showSold && w.sold) return false;
      if (
        term &&
        !w.title.toLowerCase().includes(term) &&
        !w.artistName.toLowerCase().includes(term) &&
        !w.description.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
    if (sort === "priceAsc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [artworks, selectedTypes, showSold, sort, keyword]);

  function toggleType(code: string) {
    setSelectedTypes((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  function clearFilters() {
    setSelectedTypes([]);
    setShowSold(true);
    setSort("new");
    setKeyword("");
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between text-xs text-ink-soft">
        <span>총 {filtered.length}점</span>
        <WorksFilterPanel
          selected={selectedTypes}
          onToggle={toggleType}
          showSold={showSold}
          onToggleSold={() => setShowSold((v) => !v)}
          sort={sort}
          onSortChange={setSort}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onClear={clearFilters}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((artwork) => (
            <ArtworkCard key={artwork.slug} artwork={artwork} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-ink-faint">조건에 맞는 작품이 없습니다.</p>
      )}
    </div>
  );
}
