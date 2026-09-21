import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getArtistById, getArtwork } from "@/lib/queries";
import { decodeSlugParam } from "@/lib/params";
import { isHighValuePrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(decodeSlugParam(slug));
  if (!artwork) notFound();
  const artist = await getArtistById(artwork.artistId);
  if (!artist) notFound();

  if (artwork.sold) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
        <p className="mb-4 font-display text-xl">이미 판매완료된 작품입니다</p>
        <p className="text-sm text-ink-soft">다른 작품을 둘러보시거나 작가에게 커미션을 의뢰해보세요.</p>
      </div>
    );
  }

  if (isHighValuePrice(artwork.price)) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
        <p className="mb-4 font-display text-xl">가격 문의가 필요한 작품입니다</p>
        <p className="text-sm text-ink-soft">
          해당 작품은 카드 결제 대신 별도 문의를 통해 구매를 도와드립니다.
        </p>
      </div>
    );
  }

  return <CheckoutForm artwork={artwork} artist={artist} />;
}
