import WorksBrowser from "@/components/WorksBrowser";
import FeaturedArtworks from "@/components/FeaturedArtworks";
import { getArtworks } from "@/lib/queries";

export default async function WorksPage() {
  const artworks = await getArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-xl tracking-wide text-ink-soft">Exhibition</h1>
      <FeaturedArtworks artworks={artworks.slice(0, 5)} />
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
