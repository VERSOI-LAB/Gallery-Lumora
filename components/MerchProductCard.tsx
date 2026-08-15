import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { formatKRW } from "@/lib/format";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import type { MerchProduct } from "@/lib/types";

export default function MerchProductCard({ product }: { product: MerchProduct }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden border border-line">
        <PlaceholderArt
          hue={product.hue}
          variant={product.variant}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.fulfillment === "edition" && (
          <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-[10px] font-semibold tracking-wide text-paper">
            한정 {product.editionSize}
          </span>
        )}
      </div>
      <div className="pt-2.5">
        <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
          {getMerchCategoryLabel(product.category)}
        </span>
        <h3 className="mt-1 text-sm leading-snug font-semibold text-ink">{product.title}</h3>
        <div className="mt-0.5 text-xs text-ink-faint">
          {product.artistName}의 «{product.artworkTitle}»
        </div>
        <div className="mt-1 text-xs font-semibold text-ink">{formatKRW(product.price)}</div>
      </div>
    </Link>
  );
}
