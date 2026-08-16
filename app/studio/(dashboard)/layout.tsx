import StudioNav from "@/components/StudioNav";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const artist = await getCurrentArtist();

  return (
    <div className="mx-auto flex max-w-6xl px-5 md:px-8">
      <StudioNav artistName={artist.name} />
      <div className="min-w-0 flex-1 py-8 pb-24 md:pl-8 md:pb-8">{children}</div>
    </div>
  );
}
