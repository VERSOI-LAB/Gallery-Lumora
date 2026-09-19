"use client";

import { useMemo, useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import WorksFilterPanel from "@/components/WorksFilterPanel";
import type { Artwork } from "@/lib/types";

type Sort = "random" | "recommended" | "new" | "priceAsc" | "priceDesc";

// mulberry32 — tiny seeded PRNG so the shuffle is identical on server and
// client for a given seed (no hydration mismatch).
function seededRandom(seed: number) {
  let t = Math.floor(seed * 2 ** 32) >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 2 ** 32;
  };
}

function shuffled<T>(list: T[], seed: number): T[] {
  const rand = seededRandom(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function WorksBrowser({ artworks, initialSeed }: { artworks: Artwork[]; initialSeed: number }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showSold, setShowSold] = useState(true);
  const [sort, setSort] = useState<Sort>("random");
  const [seed, setSeed] = useState(initialSeed);
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
    // Sold-out works always sink to the bottom; within each group, apply the
    // chosen sort. Server order is newest first ("new"); "random" shuffles
    // with a seed first, then the stable sort keeps that order within groups.
    const base = sort === "random" ? shuffled(list, seed) : [...list];
    return base.sort((a, b) => {
      if (a.sold !== b.sold) return a.sold ? 1 : -1;
      if (sort === "recommended") return b.viewCount - a.viewCount;
      if (sort === "priceAsc") return a.price - b.price;
      if (sort === "priceDesc") return b.price - a.price;
      return 0;
    });
  }, [artworks, selectedTypes, showSold, sort, keyword, seed]);

  // Picking "랜덤" again should reshuffle, not replay the same order.
  function changeSort(next: Sort) {
    if (next === "random") setSeed(Math.random());
    setSort(next);
  }

  function toggleType(code: string) {
    setSelectedTypes((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  function clearFilters() {
    setSelectedTypes([]);
    setShowSold(true);
    setSort("random");
    setSeed(Math.random());
    setKeyword("");
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between text-xs text-ink-soft">
        <span>총 {filtered.length}점</span>
        <WorksFilterPanel
          artworks={artworks}
          selected={selectedTypes}
          onToggle={toggleType}
          showSold={showSold}
          onToggleSold={() => setShowSold((v) => !v)}
          sort={sort}
          onSortChange={changeSort}
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
