import { notFound } from "next/navigation";
import AdminArtistDetail from "@/components/AdminArtistDetail";
import { getArtistById, getArtworksByArtistId } from "@/lib/queries";

export default async function AdminArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) notFound();
  const artworks = await getArtworksByArtistId(artist.id);

  return <AdminArtistDetail artist={artist} artworks={artworks} />;
}
