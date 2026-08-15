"use client";

import { useState } from "react";
import { MEDIUM_CATEGORIES, getMediumTypeLabel } from "@/lib/mediumTaxonomy";
import { tabClasses } from "@/lib/ui";

export default function MediumCategoryMenu({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div onMouseLeave={() => setOpenCategory(null)}>
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
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
                className={tabClasses(isOpen || activeCount > 0, "sm")}
              >
                {category.number}. {category.nameKo}
                {activeCount > 0 && <span className="ml-1 text-patina">({activeCount})</span>}
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 z-20 w-56 border border-board-line bg-board-raised">
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
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-3">
          {selected.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onToggle(code)}
              className="flex items-center gap-1 text-[11px] text-patina hover:underline"
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
