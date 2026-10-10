import { notFound, redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getArtistById, getArtwork } from "@/lib/queries";
import { decodeSlugParam } from "@/lib/params";
import { isHighValueArtwork } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginHref } from "@/lib/loginRedirect";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 비회원 결제는 받지 않습니다 — 로그인 후 이 결제 페이지로 돌아오게 합니다.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginHref(`/works/${encodeURIComponent(decodeSlugParam(slug))}/checkout`));

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

  if (isHighValueArtwork(artwork.price)) {
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
