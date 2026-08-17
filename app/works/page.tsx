import WorksBrowser from "@/components/WorksBrowser";
import FeaturedArtworks from "@/components/FeaturedArtworks";
import { getArtworks, getExhibitionFeaturedArtworks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const [artworks, featured] = await Promise.all([getArtworks(), getExhibitionFeaturedArtworks()]);
  const spotlightArtworks = featured.length > 0 ? featured : artworks.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      <h1 className="font-editorial mb-10 text-xl tracking-wide text-ink-soft">Exhibition</h1>
      {spotlightArtworks.length > 0 && <FeaturedArtworks artworks={spotlightArtworks} />}
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
