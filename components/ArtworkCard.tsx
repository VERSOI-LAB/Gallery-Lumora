import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { formatKRW } from "@/lib/format";
import type { Artwork } from "@/lib/types";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link href={`/works/${artwork.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden">
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
        <div className="text-sm font-medium text-ink">{artwork.title}</div>
        <div className="text-xs text-ink-soft">{artwork.artistName}</div>
        <div className="mt-0.5 text-xs font-semibold text-ink">
          {formatKRW(artwork.price)}
        </div>
      </div>
    </Link>
  );
}
