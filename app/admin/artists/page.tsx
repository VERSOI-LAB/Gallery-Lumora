import Link from "next/link";
import AdminArtistList from "@/components/AdminArtistList";
import { buttonClasses } from "@/lib/ui";
import { getArtists } from "@/lib/queries";

export default async function AdminArtistsPage() {
  const artists = await getArtists();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl">작가 관리</h1>
        <Link href="/admin/artists/new" className={buttonClasses("primary", "sm")}>
          새 작가 등록
        </Link>
      </div>
      <AdminArtistList artists={artists} />
    </div>
  );
}
