"use client";

import { useMemo, useState } from "react";
import MerchProductCard from "@/components/MerchProductCard";
import { MERCH_CATEGORIES } from "@/lib/merchTaxonomy";
import type { MerchProduct } from "@/lib/types";

export default function ShopBrowser({ products }: { products: MerchProduct[] }) {
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`border px-3 py-1.5 text-xs ${
            category === null ? "border-patina text-patina font-semibold" : "border-line text-ink-soft"
          }`}
        >
          전체
        </button>
        {MERCH_CATEGORIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setCategory(c.code)}
            className={`border px-3 py-1.5 text-xs ${
              category === c.code ? "border-patina text-patina font-semibold" : "border-line text-ink-soft"
            }`}
          >
            {c.nameKo}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {filtered.map((product) => (
            <MerchProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-ink-faint">아직 이 카테고리의 굿즈가 없습니다.</p>
      )}
    </div>
  );
}
