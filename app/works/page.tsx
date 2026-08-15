import WorksBrowser from "@/components/WorksBrowser";
import { getArtworks } from "@/lib/queries";

export default async function WorksPage() {
  const artworks = await getArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-base tracking-wide text-ink-soft">Exhibition</h1>
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
