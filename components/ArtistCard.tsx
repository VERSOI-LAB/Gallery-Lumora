import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import type { Artist } from "@/lib/types";

export default function ArtistCard({
  artist,
  compact = false,
  layout = "circle",
}: {
  artist: Artist;
  compact?: boolean;
  layout?: "circle" | "square";
}) {
  if (layout === "square") {
    return (
      <Link href={`/artists/${artist.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden border border-line transition-colors duration-300 group-hover:border-line-strong">
          <PlaceholderArt
            hue={artist.hue}
            seed={artist.slug}
            kind="portrait"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to top, rgba(13,17,23,0.78), rgba(13,17,23,0.15) 55%, transparent)",
            }}
          >
            <p className="line-clamp-2 text-xs leading-5 text-white/90">{artist.tagline}</p>
            {artist.styleTags.length > 0 && (
              <p className="mt-1.5 text-[10px] tracking-wide text-[#e8c988] uppercase">
                {artist.styleTags.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-ink">{artist.name}</span>
          <span className="truncate text-[11px] text-ink-faint">{artist.styleTags[0]}</span>
        </div>
      </Link>
    );
  }

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
