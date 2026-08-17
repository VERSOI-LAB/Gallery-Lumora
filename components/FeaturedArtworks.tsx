"use client";

import Link from "next/link";
import Image from "next/image";
import FeaturedCarousel from "./FeaturedCarousel";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import type { Artwork } from "@/lib/types";

export default function FeaturedArtworks({
  artworks,
  mainImageUrl,
}: {
  artworks: Artwork[];
  mainImageUrl?: string | null;
}) {
  const slides = artworks.map((artwork) => ({
    key: artwork.slug,
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
      <ArtworkThumbnail
        imageUrls={artwork.imageUrls}
        hue={artwork.hue}
        variant={artwork.variant}
        seed={artwork.slug}
        className="h-full w-full"
      />
    ),
    caption: (
      <>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">Now Showing</p>
        <h2 className="font-editorial mt-3 text-2xl tracking-wide text-ink md:text-3xl">
          {artwork.artistName}
        </h2>
        <p className="font-editorial mt-1 text-base text-ink-soft italic">{artwork.title}</p>
        <div className="mt-4 border-t border-line pt-4 text-xs text-ink-faint">
          {artwork.year} · {artwork.size}
        </div>
        <Link
          href={`/works/${artwork.slug}`}
          className={`${buttonClasses("ghost", "sm")} mt-4 w-fit`}
        >
          자세히 보기
        </Link>
      </>
    ),
  }));

  return <FeaturedCarousel slides={slides} />;
}
