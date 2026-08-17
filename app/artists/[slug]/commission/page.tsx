import { notFound } from "next/navigation";
import CommissionForm from "@/components/CommissionForm";
import { getArtist } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ArtistCommissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  return <CommissionForm artist={artist} />;
}
