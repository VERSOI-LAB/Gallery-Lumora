import WorksBrowser from "@/components/WorksBrowser";
import { getArtworks } from "@/lib/queries";

export default async function WorksPage() {
  const artworks = await getArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gold uppercase">Exhibition</p>
      <h1 className="font-editorial mb-4 text-2xl leading-snug md:text-3xl">
        시간을 견뎌낼 가치, 미래의 유산이 될 컬렉션.
      </h1>
      <p className="mb-8 max-w-lg text-sm leading-7 text-ink-soft">
        미술사의 맥락 속에서 엄선된 작가들의 고유한 세계관을 만납니다.
      </p>
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
