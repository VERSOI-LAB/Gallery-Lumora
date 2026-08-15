import WorksBrowser from "@/components/WorksBrowser";
import { getArtworks } from "@/lib/queries";

export default async function WorksPage() {
  const artworks = await getArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-8 font-display text-2xl">Exhibition</h1>
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
