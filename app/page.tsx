import Link from "next/link";
import ArtworkCard from "@/components/ArtworkCard";
import ArtistCard from "@/components/ArtistCard";
import { getArtists, getArtworks } from "@/lib/queries";
import { buttonClasses } from "@/lib/ui";

export default async function HomePage() {
  const [artists, artworks] = await Promise.all([getArtists(), getArtworks()]);
  const newWorks = artworks.slice(0, 4);

  return (
    <div>
      <section className="border-b border-line">
        <video
          src="/videos/home-hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="block h-auto w-full"
        />
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-patina">
            Gallery Lumora
          </p>
          <h1 className="mb-4 max-w-xl text-3xl leading-tight font-display text-balance md:text-5xl">
            다음 작품을,
            <br />그 작가와 함께 짓다
          </h1>
          <p className="mb-8 max-w-md text-sm text-ink-soft md:text-base">
            완성작을 소장하거나, 마음에 든 화풍으로 나만의 한 점을 의뢰하세요.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/works" className={buttonClasses("ghost")}>
              작품 둘러보기
            </Link>
            <Link href="/artists" className={buttonClasses("primary")}>
              커미션 시작하기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-xl">이 주의 작가</h2>
          <Link href="/artists" className="text-xs text-ink-soft hover:text-ink">
            전체 보기 →
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {artists.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} compact />
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-xl">신작</h2>
            <Link href="/works" className="text-xs text-ink-soft hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {newWorks.map((artwork) => (
              <ArtworkCard key={artwork.slug} artwork={artwork} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
