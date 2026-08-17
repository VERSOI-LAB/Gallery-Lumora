import { supabase } from "./supabase";
import {
  toArtist,
  toArtwork,
  toMerchProduct,
  toJournalPost,
  ARTWORK_WITH_ARTIST_SELECT,
  MERCH_PRODUCT_SELECT,
  type ArtworkWithArtistRow,
  type MerchProductWithRelationsRow,
} from "./queries";
import type { Artist, Artwork, JournalPost, MerchProduct } from "./types";

export interface SearchResults {
  artists: Artist[];
  artworks: Artwork[];
  merchProducts: MerchProduct[];
  journalPosts: JournalPost[];
}

const EMPTY: SearchResults = { artists: [], artworks: [], merchProducts: [], journalPosts: [] };

export async function searchSite(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return EMPTY;
  // ilike wildcards are applied around the raw query; commas would break the
  // .or() filter list syntax, so strip them (searches rarely need them anyway).
  const pattern = `%${q.replace(/,/g, " ")}%`;

  const [artistsRes, artworksRes, productsRes, postsRes] = await Promise.all([
    supabase.from("artists").select("*").or(`name.ilike.${pattern},tagline.ilike.${pattern},bio.ilike.${pattern}`).limit(6),
    supabase
      .from("artworks")
      .select(ARTWORK_WITH_ARTIST_SELECT)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(8)
      .returns<ArtworkWithArtistRow[]>(),
    supabase
      .from("merch_products")
      .select(MERCH_PRODUCT_SELECT)
      .eq("active", true)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(8)
      .returns<MerchProductWithRelationsRow[]>(),
    supabase.from("journal_posts").select("*").or(`title.ilike.${pattern},excerpt.ilike.${pattern}`).limit(6),
  ]);
  if (artistsRes.error) throw artistsRes.error;
  if (artworksRes.error) throw artworksRes.error;
  if (productsRes.error) throw productsRes.error;
  if (postsRes.error) throw postsRes.error;

  return {
    artists: artistsRes.data.map(toArtist),
    artworks: artworksRes.data.map(toArtwork),
    merchProducts: productsRes.data.map(toMerchProduct),
    journalPosts: postsRes.data.map(toJournalPost),
  };
}
