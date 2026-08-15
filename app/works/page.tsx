import WorksBrowser from "@/components/WorksBrowser";
import { getArtworks } from "@/lib/queries";

export default async function WorksPage() {
  const artworks = await getArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-2 text-2xl">Exhibition</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        지금 이 순간,
        <br />
        누군가의 손끝에서 완성된 이야기들.
      </p>
      <WorksBrowser artworks={artworks} />
    </div>
  );
}
