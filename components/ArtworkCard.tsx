import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import type { Artwork } from "@/lib/types";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link href={`/works/${artwork.slug}`} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden">
        <PlaceholderArt
          hue={artwork.hue}
          variant={artwork.variant}
          seed={artwork.slug}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {artwork.sold && (
          <span className="absolute left-2 top-2 bg-ink px-2 py-1 text-[10px] font-semibold tracking-wide text-paper">
            SOLD
          </span>
        )}
      </div>
      <div className="pt-3">
        <div className="text-sm font-semibold text-ink">{artwork.artistName}</div>
        <div className="text-sm text-ink">{artwork.title}</div>
        {artwork.description && (
          <div className="mt-0.5 text-xs text-ink-soft">{artwork.description}</div>
        )}
        <div className="mt-0.5 text-xs text-ink-faint">{artwork.year}</div>
      </div>
    </Link>
  );
}
