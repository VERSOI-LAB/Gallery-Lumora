import ArtistsBrowser from "@/components/ArtistsBrowser";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-xl tracking-wide text-ink-soft">Artists</h1>
      <ArtistsBrowser artists={artists} />
    </div>
  );
}
