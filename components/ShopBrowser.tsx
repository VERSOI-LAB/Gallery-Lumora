"use client";

import { useMemo, useState } from "react";
import MerchProductCard from "@/components/MerchProductCard";
import { tabClasses } from "@/lib/ui";
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
      <div className="mb-8 flex flex-wrap gap-6 border-b border-line">
        <button type="button" onClick={() => setCategory(null)} className={tabClasses(category === null, "sm")}>
          전체
        </button>
        {MERCH_CATEGORIES.map((c) => (
          <button key={c.code} type="button" onClick={() => setCategory(c.code)} className={tabClasses(category === c.code, "sm")}>
            {c.nameKo}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">
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
