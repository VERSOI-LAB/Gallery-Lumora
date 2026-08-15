import { notFound } from "next/navigation";
import NewArtworkForm from "@/components/NewArtworkForm";
import { getArtist } from "@/lib/queries";
import { CURRENT_ARTIST_SLUG } from "@/lib/constants";

export default async function StudioNewWorkPage() {
  const artist = await getArtist(CURRENT_ARTIST_SLUG);
  if (!artist) notFound();

  return <NewArtworkForm artistId={artist.id} artistHue={artist.hue} />;
}
