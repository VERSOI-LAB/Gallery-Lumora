"use client";

import { useMemo, useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import MediumCategoryMenu from "@/components/MediumCategoryMenu";
import { PRICE_STEPS, formatPriceStep } from "@/lib/priceSteps";
import type { Artwork } from "@/lib/types";

type Sort = "new" | "priceAsc" | "priceDesc";

export default function WorksBrowser({ artworks }: { artworks: Artwork[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_STEPS.length - 1]);
  const [showSold, setShowSold] = useState(true);
  const [sort, setSort] = useState<Sort>("new");

  const filtered = useMemo(() => {
    const minPrice = PRICE_STEPS[priceRange[0]];
    const maxPrice = PRICE_STEPS[priceRange[1]];
    const list = artworks.filter((w) => {
      if (selectedTypes.length && !selectedTypes.includes(w.mediumTypeCode)) return false;
      if (!showSold && w.sold) return false;
      if (w.price < minPrice) return false;
      if (maxPrice !== Infinity && w.price > maxPrice) return false;
      return true;
    });
    if (sort === "priceAsc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [artworks, selectedTypes, priceRange, showSold, sort]);

  function toggleType(code: string) {
    setSelectedTypes((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  return (
    <div>
      <MediumCategoryMenu selected={selectedTypes} onToggle={toggleType} />

      <div className="mt-6 mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xs flex-1">
          <div className="mb-2 text-xs tracking-wide text-ink-faint uppercase">가격대</div>
          <PriceRangeSlider
            steps={PRICE_STEPS}
            labelFor={formatPriceStep}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>

        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={showSold}
            onChange={() => setShowSold((v) => !v)}
            className="accent-patina"
          />
          Sold 포함 보기
        </label>
      </div>

      <div className="mb-6 flex items-center justify-between text-xs text-ink-soft">
        <span>총 {filtered.length}점</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-line bg-paper px-2 py-1.5"
        >
          <option value="new">신작순</option>
          <option value="priceAsc">낮은 가격순</option>
          <option value="priceDesc">높은 가격순</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
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
