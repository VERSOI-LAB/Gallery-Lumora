import { notFound } from "next/navigation";
import EditArtworkForm from "@/components/EditArtworkForm";
import { getArtworkById } from "@/lib/queries";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioEditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getCurrentArtist();
  const artwork = await getArtworkById(id);
  if (!artwork || artwork.artistId !== artist.id) notFound();

  return <EditArtworkForm artwork={artwork} artistId={artist.id} />;
}
