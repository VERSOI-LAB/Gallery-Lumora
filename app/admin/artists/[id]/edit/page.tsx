import { notFound } from "next/navigation";
import AdminArtistForm from "@/components/AdminArtistForm";
import { getArtistById } from "@/lib/queries";

export default async function AdminEditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작가 정보 수정</h1>
      <AdminArtistForm artist={artist} />
    </div>
  );
}
