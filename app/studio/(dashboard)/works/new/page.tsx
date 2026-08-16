import NewArtworkForm from "@/components/NewArtworkForm";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioNewWorkPage() {
  const artist = await getCurrentArtist();

  return <NewArtworkForm artistId={artist.id} artistHue={artist.hue} />;
}
