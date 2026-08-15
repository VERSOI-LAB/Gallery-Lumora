import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import type { Artist } from "@/lib/types";

export default function ArtistCard({
  artist,
  compact = false,
}: {
  artist: Artist;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className={`group block text-center ${compact ? "w-28 flex-none" : ""}`}
    >
      <div
        className={`mx-auto overflow-hidden rounded-full border border-line ${
          compact ? "h-28 w-28" : "h-32 w-32"
        }`}
      >
        <PlaceholderArt
          hue={artist.hue}
          seed={artist.slug}
          kind="portrait"
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-2 text-sm font-medium text-ink">{artist.name}</div>
      <div className="text-[11px] text-ink-faint">{artist.styleTags[0]}</div>
    </Link>
  );
}
