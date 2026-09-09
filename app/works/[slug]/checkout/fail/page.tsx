import { notFound } from "next/navigation";
import { getArtwork } from "@/lib/queries";
import { decodeSlugParam } from "@/lib/params";
import { buttonClasses } from "@/lib/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutFailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { slug } = await params;
  const { code, message } = await searchParams;
  const artwork = await getArtwork(decodeSlugParam(slug));
  if (!artwork) notFound();

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center md:px-0">
      <p className="mb-3 text-xs font-semibold tracking-wide text-red-600 uppercase">결제 실패</p>
      <h1 className="mb-4 font-display text-2xl">결제가 완료되지 않았습니다</h1>
      <p className="mb-2 text-sm leading-7 text-ink-soft">
        {message || "결제가 취소되었거나 처리 중 오류가 발생했습니다."}
      </p>
      {code && <p className="mb-8 text-xs text-ink-faint">오류 코드: {code}</p>}
      <Link href={`/works/${artwork.slug}/checkout`} className={buttonClasses("primary")}>
        다시 결제하기
      </Link>
    </div>
  );
}
