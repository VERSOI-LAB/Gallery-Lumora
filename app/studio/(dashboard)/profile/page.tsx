import ArtistProfileEditForm from "@/components/ArtistProfileEditForm";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioProfilePage() {
  const artist = await getCurrentArtist();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">프로필</h1>
      <ArtistProfileEditForm artist={artist} />
    </div>
  );
}
