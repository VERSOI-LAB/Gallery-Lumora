import Link from "next/link";
import FeaturedCarousel from "./FeaturedCarousel";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import type { Artwork } from "@/lib/types";

/** Spotlights a single artwork — admin-picked via "전시 메인으로 설정" in
 * 작품 관리, or the most recent artwork when none is picked yet. Always
 * shows that artwork's own photo, never a separate background image. */
export default function FeaturedArtworks({ artwork }: { artwork: Artwork }) {
  const slides = [
    {
      key: artwork.slug,
      image: (
        <ArtworkThumbnail
          imageUrls={artwork.imageUrls}
          hue={artwork.hue}
          variant={artwork.variant}
          seed={artwork.slug}
          className="h-full w-full"
          fit="contain"
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
    },
  ];

  return <FeaturedCarousel slides={slides} />;
}
