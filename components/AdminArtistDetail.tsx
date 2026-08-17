import Link from "next/link";
import ArtistAvatar from "./ArtistAvatar";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { getMediumTypeLabel } from "@/lib/mediumTaxonomy";
import type { Artist, Artwork } from "@/lib/types";

export default function AdminArtistDetail({ artist, artworks }: { artist: Artist; artworks: Artwork[] }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-none overflow-hidden border border-line">
            <ArtistAvatar avatarUrl={artist.avatarUrl} hue={artist.hue} seed={artist.slug} className="h-full w-full" />
          </div>
          <div>
            <h1 className="font-display text-2xl">{artist.name}</h1>
            <p className="text-sm text-ink-soft">{artist.tagline}</p>
          </div>
        </div>
        <Link href={`/admin/artists/${artist.id}/edit`} className={buttonClasses("ghost", "sm")}>
          정보 수정
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">정산 비율</p>
          <p className="mt-1 text-lg font-semibold">
            작가 {Math.round(artist.artistSplitRate * 100)}% / 갤러리{" "}
            {Math.round((1 - artist.artistSplitRate) * 100)}%
          </p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">커미션 접수 상태</p>
          <p className={`mt-1 text-lg font-semibold ${artist.commission.accepting ? "text-patina" : "text-ink-faint"}`}>
            {artist.commission.accepting ? "접수중" : "접수 중단"}
          </p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">등록 작품 수</p>
          <p className="mt-1 text-lg font-semibold">{artworks.length}점</p>
        </div>
      </div>

      <div className="mb-8 border-t border-line pt-5">
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">작가 소개</p>
        <p className="text-sm leading-relaxed whitespace-pre-line text-ink-soft">{artist.bio || "소개가 등록되지 않았습니다."}</p>
        {artist.styleTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {artist.styleTags.map((tag) => (
              <span key={tag} className="border border-line px-2 py-1 text-[11px] text-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 border-t border-line pt-5">
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">커미션 설정</p>
        {artist.commission.media.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {artist.commission.media.map((code) => (
              <span key={code} className="border border-line px-2 py-1 text-[11px] text-ink-soft">
                {getMediumTypeLabel(code)}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-sm text-ink-faint">등록된 가능 매체가 없습니다.</p>
        )}
        <div className="grid grid-cols-1 gap-4 text-sm text-ink-soft sm:grid-cols-2">
          <p>예상 소요 기간: {artist.commission.leadTime || "미입력"}</p>
          <p>가격대: {artist.commission.priceRange || "미입력"}</p>
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">등록 작품</p>
        {artworks.length === 0 ? (
          <p className="text-sm text-ink-faint">등록된 작품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {artworks.map((artwork) => (
              <Link key={artwork.id} href={`/admin/artworks/${artwork.id}/edit`} className="block">
                <div className="relative aspect-square overflow-hidden border border-line">
                  <ArtworkThumbnail
                    imageUrls={artwork.imageUrls}
                    hue={artwork.hue}
                    variant={artwork.variant}
                    seed={artwork.slug}
                    className="h-full w-full"
                  />
                  {artwork.sold && (
                    <span className="absolute top-2 left-2 bg-ink px-2 py-0.5 text-[10px] font-semibold text-paper">
                      SOLD
                    </span>
                  )}
                </div>
                <p className="mt-1.5 truncate text-xs font-medium text-ink">{artwork.title}</p>
                <p className="text-[11px] text-ink-faint">{formatKRW(artwork.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
