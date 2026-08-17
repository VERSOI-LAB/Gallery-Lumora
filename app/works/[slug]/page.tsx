import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArtworkThumbnail from "@/components/ArtworkThumbnail";
import ReviewsSection from "@/components/ReviewsSection";
import WishlistButton from "@/components/WishlistButton";
import { getArtistById, getArtwork, incrementArtworkView } from "@/lib/queries";
import { formatKRW } from "@/lib/format";
import { buttonClasses } from "@/lib/ui";
import { getMediumType } from "@/lib/mediumTaxonomy";
import { decodeSlugParam } from "@/lib/params";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(decodeSlugParam(slug));
  if (!artwork) notFound();
  const artist = await getArtistById(artwork.artistId);
  if (!artist) notFound();
  const mediumType = getMediumType(artwork.mediumTypeCode);
  incrementArtworkView(artwork.id).catch(() => {});

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-6 text-xs text-ink-faint">
        <Link href="/works" className="hover:text-ink">
          Exhibition
        </Link>{" "}
        / {mediumType?.nameKo ?? artwork.mediumTypeCode} / {artist.name}
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <ArtworkThumbnail
            imageUrls={artwork.imageUrls}
            hue={artwork.hue}
            variant={artwork.variant}
            seed={artwork.slug}
            className="aspect-[4/5] w-full"
            sizes="(max-width: 1024px) 100vw, 60vw"
            fit="contain"
          />
          {artwork.imageUrls.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {artwork.imageUrls.slice(1).map((url, i) => (
                <div key={url} className="relative aspect-square overflow-hidden">
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                  {/* index offset by 1 since the first photo is the hero image above */}
                  <span className="sr-only">{`사진 ${i + 2}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-editorial mb-1 text-2xl italic">{artwork.title}</h1>
            <WishlistButton kind="artwork" itemId={artwork.id} />
          </div>
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

      <div className="mt-12">
        <ReviewsSection target={{ artworkId: artwork.id }} />
      </div>
    </div>
  );
}
