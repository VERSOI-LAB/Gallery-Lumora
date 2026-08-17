import { supabase } from "./supabase";
import {
  toArtwork,
  toMerchProduct,
  ARTWORK_WITH_ARTIST_SELECT,
  MERCH_PRODUCT_SELECT,
  type ArtworkWithArtistRow,
  type MerchProductWithRelationsRow,
} from "./queries";
import type { Artwork, MerchProduct } from "./types";

export type WishlistKind = "artwork" | "product";

export async function isWishlisted(kind: WishlistKind, itemId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const column = kind === "artwork" ? "artwork_id" : "product_id";
  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq(column, itemId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Adds/removes the item from the caller's wishlist and returns the new
 * state (true = now wishlisted). Throws if not logged in — callers should
 * prompt sign-in rather than call this for guests. */
export async function toggleWishlist(kind: WishlistKind, itemId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const column = kind === "artwork" ? "artwork_id" : "product_id";
  const { data: existing, error: selectError } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq(column, itemId)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase.from("wishlists").delete().eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("wishlists").insert(
    kind === "artwork" ? { user_id: user.id, artwork_id: itemId } : { user_id: user.id, product_id: itemId }
  );
  if (error) throw error;
  return true;
}

export interface MyWishlist {
  artworks: Artwork[];
  products: MerchProduct[];
}

export async function getMyWishlist(): Promise<MyWishlist> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { artworks: [], products: [] };

  const { data: rows, error } = await supabase
    .from("wishlists")
    .select("artwork_id, product_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const artworkIds = rows.map((r) => r.artwork_id).filter((id): id is string => !!id);
  const productIds = rows.map((r) => r.product_id).filter((id): id is string => !!id);

  const [artworkRes, productRes] = await Promise.all([
    artworkIds.length
      ? supabase.from("artworks").select(ARTWORK_WITH_ARTIST_SELECT).in("id", artworkIds).returns<ArtworkWithArtistRow[]>()
      : Promise.resolve({ data: [] as ArtworkWithArtistRow[], error: null }),
    productIds.length
      ? supabase
          .from("merch_products")
          .select(MERCH_PRODUCT_SELECT)
          .in("id", productIds)
          .returns<MerchProductWithRelationsRow[]>()
      : Promise.resolve({ data: [] as MerchProductWithRelationsRow[], error: null }),
  ]);
  if (artworkRes.error) throw artworkRes.error;
  if (productRes.error) throw productRes.error;

  return {
    artworks: artworkRes.data.map(toArtwork),
    products: productRes.data.map(toMerchProduct),
  };
}
