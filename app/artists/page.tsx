import ArtistCard from "@/components/ArtistCard";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-2 text-2xl">Artists</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        각자의 화풍으로 세상을 그리는 작가들.
        <br />
        그 손끝에서 태어날 다음 이야기의 주인공은,
        <br />
        어쩌면 당신일지도 모릅니다.
      </p>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
      </div>
    </div>
  );
}
