import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getArtistById, getArtwork } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
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

  return <CheckoutForm artwork={artwork} artist={artist} />;
}
