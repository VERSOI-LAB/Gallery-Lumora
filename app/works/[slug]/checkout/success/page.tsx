import { Suspense } from "react";
import { notFound } from "next/navigation";
import CheckoutSuccessClient from "@/components/CheckoutSuccessClient";
import { getArtistById, getArtwork } from "@/lib/queries";
import { decodeSlugParam } from "@/lib/params";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtwork(decodeSlugParam(slug));
  if (!artwork) notFound();
  const artist = await getArtistById(artwork.artistId);
  if (!artist) notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-5 py-24 text-center md:px-0" />}>
      <CheckoutSuccessClient artwork={artwork} artist={artist} />
    </Suspense>
  );
}
