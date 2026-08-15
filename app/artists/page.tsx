import ArtistCard from "@/components/ArtistCard";
import { getArtists } from "@/lib/queries";
import { buttonClasses } from "@/lib/ui";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gold uppercase">Artists</p>
      <h1 className="font-editorial mb-4 text-2xl leading-snug md:text-3xl">
        자신만의 깊은 세계로 시대를 밝히는 루모라의 작가들.
      </h1>
      <p className="mb-8 max-w-lg text-sm leading-7 text-ink-soft">
        루모라는 작가가 지닌 묵묵한 고뇌와 무한한 가능성을 신뢰합니다.
      </p>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.slug} artist={artist} />
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-12 text-center">
        <h2 className="font-editorial mb-3 text-xl leading-snug md:text-2xl">
          당신의 예술이 마땅히 받아야 할 빛과 가치를 만납니다.
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-7 text-ink-soft">
          시대를 잇는 무대에서 당신의 작품을 선보이세요. 결코 루모라는 진정성 있는 작가님의
          동반자가 되어 드립니다.
        </p>
        <a href="mailto:artists@lumora.gallery" className={buttonClasses("primary", "sm")}>
          루모라 입점/작가 지원하기
        </a>
      </div>
    </div>
  );
}
