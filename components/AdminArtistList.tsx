import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import type { Artist } from "@/lib/types";

export default function AdminArtistList({ artists }: { artists: Artist[] }) {
  if (artists.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 작가가 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {artists.map((artist) => (
        <div key={artist.id} className="flex items-center gap-4 py-4">
          <div className="h-14 w-14 flex-none overflow-hidden border border-line">
            <PlaceholderArt hue={artist.hue} seed={artist.slug} kind="portrait" className="h-full w-full" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-ink">{artist.name}</span>
              {artist.commission.accepting && (
                <span className="flex-none border border-patina px-1.5 py-0.5 text-[10px] text-patina">
                  커미션 접수중
                </span>
              )}
            </div>
            <div className="text-xs text-ink-soft">{artist.tagline}</div>
          </div>

          <Link
            href={`/admin/artists/${artist.id}/edit`}
            className="flex-none text-xs text-ink-soft hover:text-ink hover:underline"
          >
            수정
          </Link>
        </div>
      ))}
    </div>
  );
}
