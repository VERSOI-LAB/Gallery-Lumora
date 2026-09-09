import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getArtists, getArtworks, getJournalPosts } from "@/lib/queries";

const STATIC_ROUTES = ["", "/about", "/works", "/artists", "/shop", "/commission", "/journal", "/studio", "/search"];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, artworks, journalPosts] = await Promise.all([
    getArtists().catch(() => []),
    getArtworks().catch(() => []),
    getJournalPosts().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const artistEntries: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${SITE_URL}/artists/${artist.slug}`,
    lastModified: new Date(),
  }));

  const artworkEntries: MetadataRoute.Sitemap = artworks.map((artwork) => ({
    url: `${SITE_URL}/works/${artwork.slug}`,
    lastModified: new Date(),
  }));

  const journalEntries: MetadataRoute.Sitemap = journalPosts.map((post) => ({
    url: `${SITE_URL}/journal/${post.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...artistEntries, ...artworkEntries, ...journalEntries];
}
