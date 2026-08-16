import WorksBrowser from "@/components/WorksBrowser";
import FeaturedArtworks from "@/components/FeaturedArtworks";
import { getArtworks, getSiteAsset } from "@/lib/queries";

export default async function WorksPage() {
  const [artworks, mainImageUrl] = await Promise.all([
    getArtworks(),
    getSiteAsset("exhibition_main_image"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-xl tracking-wide text-ink-soft">Exhibition</h1>
      <FeaturedArtworks artworks={artworks.slice(0, 5)} mainImageUrl={mainImageUrl} />
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
