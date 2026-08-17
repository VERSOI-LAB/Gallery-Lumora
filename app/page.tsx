import Link from "next/link";
import ArtworkCard from "@/components/ArtworkCard";
import ArtistCard from "@/components/ArtistCard";
import ArticleCard from "@/components/ArticleCard";
import MerchProductCard from "@/components/MerchProductCard";
import HeroVideo from "@/components/HeroVideo";
import { getArtists, getArtworks, getJournalPosts, getMerchProducts, getSiteAsset } from "@/lib/queries";
import { buttonClasses } from "@/lib/ui";

export default async function HomePage() {
  const [artists, artworks, journalPosts, merchProducts, heroVideo] = await Promise.all([
    getArtists(),
    getArtworks(),
    getJournalPosts(),
    getMerchProducts(),
    getSiteAsset("home_hero_video"),
  ]);
  const newWorks = artworks.slice(0, 4);
  const latestPosts = journalPosts.slice(0, 3);
  const featuredProducts = merchProducts.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    name: "Gallery Lumora",
    description:
      "작가의 화풍을 살펴보고 완성작을 소장하거나, 그 작가에게 나만의 작품을 1:1로 의뢰하세요.",
    url: "/",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-line">
        <HeroVideo src={heroVideo || "/videos/home-hero.mp4"} className="block h-auto w-full" />
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-patina">
            Gallery Lumora
          </p>
          <h1 className="font-editorial mb-4 max-w-xl text-3xl leading-tight md:text-5xl">
            나만을 위해 시작되는, 세상에 없던 단 하나의 예술
          </h1>
          <p className="mb-8 max-w-md text-sm text-ink-soft md:text-base">
            마음에 닿은 완성작을 소장하거나, 당신의 스토리를 담아 세상에 없던 온기를 작가에게 1:1로
            의뢰해보세요.
            <br />
            한 점의 예술이 당신의 삶에 물드는 모든 순간을 함께합니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/works" className={buttonClasses("ghost")}>
              작품 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-editorial text-xl">지금, 이 순간의 작가들</h2>
          <Link href="/artists" className="text-xs text-ink-soft hover:text-ink">
            전체 보기 →
          </Link>
        </div>
        {artists.length > 0 ? (
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-2">
              {artists.map((artist) => (
                <ArtistCard key={artist.slug} artist={artist} compact />
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent"
            />
          </div>
        ) : (
          <p className="text-sm text-ink-faint">곧 새로운 작가를 소개해드립니다.</p>
        )}
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-editorial text-xl">새로 태어난 작품들</h2>
            <Link href="/works" className="text-xs text-ink-soft hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          {newWorks.length > 0 ? (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {newWorks.map((artwork) => (
                <ArtworkCard key={artwork.slug} artwork={artwork} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">곧 새로운 작품을 선보입니다.</p>
          )}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-editorial text-xl">Shop, 작품이 스민 오브제</h2>
              <Link href="/shop" className="text-xs text-ink-soft hover:text-ink">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {featuredProducts.map((product) => (
                <MerchProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-20">
          <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-gold-soft uppercase">
            Commission
          </p>
          <h2 className="font-editorial mb-4 text-2xl leading-snug md:text-3xl">
            아직 태어나지 않은 한 점을,
            <br />
            당신과 함께 기다립니다
          </h2>
          <p className="mb-8 text-sm text-paper/70 md:text-base">
            좋아하는 작가에게 나만의 이야기를 담은 작품을 1:1로 의뢰해보세요.
          </p>
          <Link href="/commission" className={buttonClasses("primary")}>
            커미션 의뢰하기
          </Link>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-editorial text-xl">Journal, 예술을 읽는 시간</h2>
              <Link href="/journal" className="text-xs text-ink-soft hover:text-ink">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">
              {latestPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
