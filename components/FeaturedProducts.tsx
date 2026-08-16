"use client";

import Link from "next/link";
import Image from "next/image";
import FeaturedCarousel from "./FeaturedCarousel";
import PlaceholderArt from "./PlaceholderArt";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import type { MerchProduct } from "@/lib/types";

export default function FeaturedProducts({
  products,
  mainImageUrl,
}: {
  products: MerchProduct[];
  mainImageUrl?: string | null;
}) {
  const slides = products.map((product) => ({
    key: product.slug,
    image: mainImageUrl ? (
      <Image
        src={mainImageUrl}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover"
      />
    ) : (
      <PlaceholderArt
        hue={product.hue}
        variant={product.variant}
        seed={product.slug}
        className="h-full w-full"
      />
    ),
    caption: (
      <>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">지금 인기 있는 상품</p>
        <h2 className="font-editorial mt-3 text-2xl tracking-wide text-ink md:text-3xl">
          {product.title}
        </h2>
        <p className="font-editorial mt-1 text-base text-ink-soft italic">
          {product.artistName}의 «{product.artworkTitle}»
        </p>
        <div className="mt-4 border-t border-line pt-4 text-xs text-ink-faint">
          {formatKRW(product.price)}
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className={`${buttonClasses("ghost", "sm")} mt-4 w-fit`}
        >
          자세히 보기
        </Link>
      </>
    ),
  }));

  return <FeaturedCarousel slides={slides} />;
}
