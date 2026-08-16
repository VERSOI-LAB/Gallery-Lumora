"use client";

import { useState } from "react";
import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { formatKRW } from "@/lib/format";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import { adminUpdateMerchProductActive } from "@/lib/adminActions";
import type { MerchProduct } from "@/lib/types";

export default function AdminMerchList({ products: initial }: { products: MerchProduct[] }) {
  const [products, setProducts] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleActive(product: MerchProduct) {
    const next = !product.active;
    setPendingId(product.id);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: next } : p)));
    try {
      await adminUpdateMerchProductActive(product.id, next);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: !next } : p)));
    } finally {
      setPendingId(null);
    }
  }

  if (products.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 굿즈 상품이 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {products.map((product) => (
        <div key={product.id} className="flex items-center gap-4 py-4">
          <div className="h-16 w-16 flex-none overflow-hidden">
            <PlaceholderArt
              hue={product.hue}
              variant={product.variant}
              seed={product.slug}
              className="h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-ink">{product.title}</span>
              {product.fulfillment === "edition" && (
                <span className="flex-none border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                  한정 {product.editionSize}
                </span>
              )}
            </div>
            <div className="text-xs text-ink-soft">
              {getMerchCategoryLabel(product.category)} · {product.artistName} · {formatKRW(product.price)}
            </div>
          </div>

          <div className="flex flex-none items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={product.active}
              aria-label="판매중"
              disabled={pendingId === product.id}
              onClick={() => toggleActive(product)}
              className={`relative h-6 w-10 flex-none rounded-full transition-colors disabled:opacity-50 ${
                product.active ? "bg-patina" : "bg-line-strong"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform ${
                  product.active ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <Link href={`/admin/merch/${product.id}/edit`} className="text-xs text-ink-soft hover:text-ink hover:underline">
              수정
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
