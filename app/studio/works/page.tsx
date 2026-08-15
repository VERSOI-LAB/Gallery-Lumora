import Link from "next/link";
import { notFound } from "next/navigation";
import ArtworkManageList from "@/components/ArtworkManageList";
import { buttonClasses } from "@/lib/ui";
import { getArtist, getArtworksByArtistId } from "@/lib/queries";
import { CURRENT_ARTIST_SLUG } from "@/lib/constants";

export default async function StudioWorksPage() {
  const artist = await getArtist(CURRENT_ARTIST_SLUG);
  if (!artist) notFound();
  const artworks = await getArtworksByArtistId(artist.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl">작품 관리</h1>
        <Link href="/studio/works/new" className={buttonClasses("primary", "sm")}>
          새 작품 등록
        </Link>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        작품별로 굿즈(프린트·생활용품) 제작 허용 여부를 설정할 수 있습니다. 허용한 작품만 Shop에
        상품으로 등록됩니다.
      </p>
      <ArtworkManageList artworks={artworks} />
    </div>
  );
}
