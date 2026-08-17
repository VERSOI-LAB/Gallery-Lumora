import { notFound } from "next/navigation";
import PlaceholderArt from "@/components/PlaceholderArt";
import ArtistAvatar from "@/components/ArtistAvatar";
import ArtistProfileTabs from "@/components/ArtistProfileTabs";
import { getArtist, getArtistSlugs, getArtworksByArtistId } from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await getArtistSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();
  const works = await getArtworksByArtistId(artist.id);

  return (
    <div>
      <PlaceholderArt
        hue={(artist.hue + 120) % 360}
        variant={2}
        seed={`${artist.slug}-banner`}
        className="h-40 w-full border-b border-line md:h-56"
      />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-8 flex items-end gap-4 -mt-10 md:-mt-14">
          <div className="h-20 w-20 flex-none overflow-hidden border-4 border-paper md:h-28 md:w-28">
            <ArtistAvatar avatarUrl={artist.avatarUrl} hue={artist.hue} seed={artist.slug} className="h-full w-full" />
          </div>
          <div className="pb-2">
            <h1 className="font-display text-xl md:text-2xl">{artist.name}</h1>
            <p className="text-sm text-ink-soft">{artist.tagline}</p>
          </div>
        </div>

        <ArtistProfileTabs artist={artist} works={works} />
      </div>
    </div>
  );
}
