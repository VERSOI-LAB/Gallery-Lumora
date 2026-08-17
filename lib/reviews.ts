import { supabase } from "./supabase";
import type { Database } from "./database.types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export interface Review {
  id: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
}

function toReview(row: ReviewRow): Review {
  return { id: row.id, userId: row.user_id, rating: row.rating, body: row.body, createdAt: row.created_at };
}

export async function getReviewsForArtwork(artworkId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toReview);
}

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toReview);
}

/** True only if the caller is logged in, has a completed order for the item,
 * and hasn't already reviewed it — mirrors submit_review's own checks so the
 * UI can decide whether to show the "write a review" form before submitting. */
export async function canReviewArtwork(artworkId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const [{ data: order }, { data: existing }] = await Promise.all([
    supabase.from("orders").select("id").eq("user_id", user.id).eq("artwork_id", artworkId).maybeSingle(),
    supabase.from("reviews").select("id").eq("user_id", user.id).eq("artwork_id", artworkId).maybeSingle(),
  ]);
  return !!order && !existing;
}

export async function canReviewProduct(productId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const [{ data: order }, { data: existing }] = await Promise.all([
    supabase.from("merch_orders").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle(),
    supabase.from("reviews").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle(),
  ]);
  return !!order && !existing;
}

export async function submitReview(
  target: { artworkId: string; productId?: never } | { productId: string; artworkId?: never },
  rating: number,
  body: string
): Promise<void> {
  // submit_review's SQL params have no DEFAULT, so the generated types mark
  // them non-nullable even though the function accepts (and requires) null
  // for whichever of artwork/product isn't the review's target.
  const { error } = await supabase.rpc("submit_review", {
    p_artwork_id: (target.artworkId ?? null) as string,
    p_product_id: (target.productId ?? null) as string,
    p_rating: rating,
    p_body: body,
  });
  if (error) throw error;
}

/** RLS restricts this to the caller's own review (see the "members can
 * update their own reviews" policy). */
export async function updateReview(id: string, rating: number, body: string): Promise<void> {
  const { error } = await supabase.from("reviews").update({ rating, body }).eq("id", id);
  if (error) throw error;
}

/** RLS restricts this to the caller's own review. */
export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
