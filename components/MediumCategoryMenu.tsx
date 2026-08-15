"use client";

import { useState } from "react";
import { MEDIUM_CATEGORIES, getMediumTypeLabel } from "@/lib/mediumTaxonomy";

export default function MediumCategoryMenu({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="border border-board-line bg-board" onMouseLeave={() => setOpenCategory(null)}>
      <div className="border-b border-board-line px-4 py-3 text-xs tracking-wide text-board-ink-faint uppercase">
        매체
      </div>

      <div>
        {MEDIUM_CATEGORIES.map((category) => {
          const isOpen = openCategory === category.code;
          const activeCount = category.types.filter((t) => selected.includes(t.code)).length;

          return (
            <div
              key={category.code}
              className="relative"
              onMouseEnter={() => setOpenCategory(category.code)}
            >
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : category.code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors ${
                  isOpen
                    ? "bg-board-accent-soft text-board-ink"
                    : "text-board-ink-soft hover:bg-board-raised hover:text-board-ink"
                }`}
              >
                <span>
                  {category.number}. {category.nameKo}
                  {activeCount > 0 && <span className="ml-1.5 text-board-accent">({activeCount})</span>}
                </span>
                <span className="text-board-ink-faint">›</span>
              </button>

              {isOpen && (
                <div className="border-board-line bg-board-raised md:absolute md:top-0 md:left-full md:z-20 md:w-56 md:border">
                  {category.types.map((type) => {
                    const checked = selected.includes(type.code);
                    return (
                      <button
                        key={type.code}
                        type="button"
                        onClick={() => onToggle(type.code)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors ${
                          checked
                            ? "text-board-accent"
                            : "text-board-ink-soft hover:text-board-ink"
                        }`}
                      >
                        <span>{type.nameKo}</span>
                        {checked && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-board-line p-3">
          {selected.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onToggle(code)}
              className="flex items-center gap-1 text-[11px] text-board-accent hover:underline"
            >
              {getMediumTypeLabel(code)}
              <span aria-hidden>✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
