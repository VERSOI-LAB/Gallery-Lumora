import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import WishlistButton from "./WishlistButton";
import type { Artwork } from "@/lib/types";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link href={`/works/${artwork.slug}`} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden">
        <ArtworkThumbnail
          imageUrls={artwork.imageUrls}
          hue={artwork.hue}
          variant={artwork.variant}
          seed={artwork.slug}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <WishlistButton kind="artwork" itemId={artwork.id} className="absolute top-2 right-2" />
        {artwork.sold && (
          <span className="absolute left-2 top-2 bg-ink px-2 py-1 text-[10px] font-semibold tracking-wide text-paper">
            SOLD
          </span>
        )}
      </div>
      <div className="pt-4">
        <div className="font-editorial text-lg text-ink">{artwork.artistName}</div>
        <div className="font-editorial text-lg text-ink italic">{artwork.title}</div>
        {artwork.description && (
          <div className="mt-1 text-sm text-ink-soft">{artwork.description}</div>
        )}
        <div className="mt-1 text-sm text-ink-faint">{artwork.year}</div>
      </div>
    </Link>
  );
}
