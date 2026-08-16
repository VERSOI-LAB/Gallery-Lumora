import ArtistsBrowser from "@/components/ArtistsBrowser";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import { getArtists } from "@/lib/queries";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div>
      <FadeInOnScroll className="mx-auto max-w-2xl px-5 pt-14 pb-10 text-center md:px-8 md:pt-20 md:pb-14">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-patina uppercase">
          Directory
        </p>
        <h1 className="font-editorial mb-4 text-2xl tracking-wide text-ink md:text-3xl">Artists</h1>
        <p className="text-sm leading-7 text-ink-soft">
          시대를 탐구하며 자신만의 세계를 구축해가는 Lumora의 작가들을 만나보세요.
        </p>
      </FadeInOnScroll>

      <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <ArtistsBrowser artists={artists} />
      </div>
    </div>
  );
}
