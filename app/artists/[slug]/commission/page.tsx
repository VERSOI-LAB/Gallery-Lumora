import { notFound } from "next/navigation";
import CommissionForm from "@/components/CommissionForm";
import { getArtist, getArtistSlugs } from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await getArtistSlugs();
  return slugs.map((slug) => ({ slug }));
}

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
