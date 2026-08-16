import AdminArtworkList from "@/components/AdminArtworkList";
import { getArtworks } from "@/lib/queries";

export default async function AdminArtworksPage() {
  const artworks = await getArtworks();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작품 관리</h1>
      <AdminArtworkList artworks={artworks} />
    </div>
  );
}
