import ArtistCard from "@/components/ArtistCard";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-2 font-display text-2xl">작가</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        화풍과 이력을 살펴보고, 마음에 든 작가에게 완성작을 구매하거나 1:1 커미션을
        의뢰해보세요.
      </p>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
      </div>
    </div>
  );
}
