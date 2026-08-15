import Link from "next/link";
import { notFound } from "next/navigation";
import PlaceholderArt from "@/components/PlaceholderArt";
import { getArtistById, getArtwork, getArtworkSlugs } from "@/lib/queries";
import { formatKRW } from "@/lib/format";
import { buttonClasses } from "@/lib/ui";
import { getMediumType } from "@/lib/mediumTaxonomy";

export async function generateStaticParams() {
  const slugs = await getArtworkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) notFound();
  const artist = await getArtistById(artwork.artistId);
  if (!artist) notFound();
  const mediumType = getMediumType(artwork.mediumTypeCode);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-6 text-xs text-ink-faint">
        <Link href="/works" className="hover:text-ink">
          작품 둘러보기
        </Link>{" "}
        / {mediumType?.nameKo ?? artwork.mediumTypeCode} / {artist.name}
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <PlaceholderArt
            hue={artwork.hue}
            variant={artwork.variant}
            seed={artwork.slug}
            className="aspect-[4/5] w-full"
          />
        </div>

        <div>
          <h1 className="font-editorial mb-1 text-2xl italic">{artwork.title}</h1>
          <Link href={`/artists/${artist.slug}`} className="text-sm text-patina hover:underline">
            {artist.name} →
          </Link>

          <dl className="mt-6 divide-y divide-line border-t border-line text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-soft">매체</dt>
              <dd>
                {mediumType ? `${mediumType.categoryNameKo} · ${mediumType.nameKo}` : artwork.mediumTypeCode}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-soft">사이즈</dt>
              <dd>{artwork.size}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink-soft">제작연도</dt>
              <dd>{artwork.year}</dd>
            </div>
          </dl>

          <p className="mt-6 mb-4 text-2xl font-semibold">{formatKRW(artwork.price)}</p>

          {artwork.sold ? (
            <p className="border border-line px-4 py-3 text-center text-sm text-ink-faint">
              이 작품은 판매완료되었습니다
            </p>
          ) : (
            <Link
              href={`/works/${artwork.slug}/checkout`}
              className={`w-full ${buttonClasses("primary")}`}
            >
              구매하기
            </Link>
          )}
          <p className="mt-2 text-xs text-ink-faint">
            무료 배송 · 보험 포함 · 디지털 진품 인증서 발급
          </p>

          <div className="mt-8 border border-patina p-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-patina uppercase">
              이 작가에게 의뢰하기
            </p>
            <p className="mb-4 text-sm text-ink-soft">
              {artist.name} 작가의 화풍으로 원하는 사이즈·주제의 작품을 1:1로 주문 제작할 수
              있습니다.
            </p>
            <Link
              href={`/artists/${artist.slug}/commission`}
              className={`w-full ${buttonClasses("ghost")}`}
            >
              커미션 문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
