"use client";

import { useState } from "react";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import { buttonClasses } from "@/lib/ui";

type Sort = "new" | "priceAsc" | "priceDesc";

export default function WorksFilterPanel({
  selected,
  onToggle,
  showSold,
  onToggleSold,
  sort,
  onSortChange,
  keyword,
  onKeywordChange,
  onClear,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  showSold: boolean;
  onToggleSold: () => void;
  sort: Sort;
  onSortChange: (sort: Sort) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-line-strong px-3 py-2 text-sm text-ink-soft hover:text-ink"
      >
        <span className="text-base leading-none">☰</span>
        Filter
        {selected.length > 0 && <span className="text-patina">({selected.length})</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-board-line bg-board px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-editorial text-xl text-board-ink">Filter</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="필터 닫기"
                className="text-xl leading-none text-board-ink-soft hover:text-board-ink"
              >
                ✕
              </button>
            </div>

            <label className="block pb-4">
              <span className="mb-2 block text-[11px] tracking-wide text-board-ink-soft uppercase">
                Keyword
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                placeholder="작가명, 작품명으로 검색"
                className="h-10 w-full border border-board-line bg-board-raised px-3 text-sm text-board-ink outline-board-accent"
              />
            </label>

            <div className="flex-1 divide-y divide-board-line border-t border-b border-board-line">
              {MEDIUM_CATEGORIES.map((category) => {
                const isOpen = openCategory === category.code;
                const count = category.types.filter((t) => selected.includes(t.code)).length;
                return (
                  <div key={category.code}>
                    <button
                      type="button"
                      onClick={() => setOpenCategory(isOpen ? null : category.code)}
                      className="flex w-full items-center justify-between py-4 text-left text-sm text-board-ink"
                    >
                      <span>
                        {category.number}. {category.nameKo}{" "}
                        <span className="text-board-ink-faint">({count})</span>
                      </span>
                      <span className={`text-board-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        ⌄
                      </span>
                    </button>
                    {isOpen && (
                      <div className="flex flex-wrap gap-2 pb-4">
                        {category.types.map((type) => {
                          const checked = selected.includes(type.code);
                          return (
                            <button
                              key={type.code}
                              type="button"
                              onClick={() => onToggle(type.code)}
                              className={`border px-3 py-1.5 text-xs transition-colors ${
                                checked
                                  ? "border-board-accent bg-board-accent text-paper"
                                  : "border-board-line text-board-ink-soft hover:text-board-ink"
                              }`}
                            >
                              {type.nameKo}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between py-4 text-sm text-board-ink">
                <span>정렬</span>
                <select
                  value={sort}
                  onChange={(e) => onSortChange(e.target.value as Sort)}
                  className="border border-board-line bg-board-raised px-2 py-1.5 text-xs"
                >
                  <option value="new">신작순</option>
                  <option value="priceAsc">낮은 가격순</option>
                  <option value="priceDesc">높은 가격순</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center justify-between py-4 text-sm text-board-ink">
                <span>Sold 포함 보기</span>
                <input
                  type="checkbox"
                  checked={showSold}
                  onChange={onToggleSold}
                  className="accent-board-accent"
                />
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`w-full ${buttonClasses("primary")}`}
              >
                Search
              </button>
              <button
                type="button"
                onClick={onClear}
                className="flex w-full items-center justify-center gap-1 text-xs text-board-ink-soft hover:text-board-ink"
              >
                <span aria-hidden>✕</span> Clear filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
