import ArtistCard from "@/components/ArtistCard";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-base tracking-wide text-ink-soft">Artists</h1>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
      </div>
    </div>
  );
}
