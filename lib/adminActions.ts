"use server";

import { revalidatePath } from "next/cache";
import { assertAdminSession } from "./adminAuth";
import { supabaseService } from "./supabase/service";
import { sendNewArtworkEmail } from "./email";
import {
  updateArtwork,
  deleteArtwork,
  toggleExhibitionFeaturedArtwork,
  createMerchProduct,
  updateMerchProduct,
  updateMerchProductActive,
  addMerchEditions,
  createMerchVariant,
  updateMerchVariant,
  deleteMerchVariant,
  reviewArtistApplication,
  createArtist,
  updateArtist,
  deleteArtist,
  deleteMerchProduct,
  updateGeneralInquiryStatus,
  updateArtworkOrderStatus,
  updateMerchOrderStatus,
  updateOrderStaffNote,
  bulkUpdateArtworkOrderStatus,
  bulkUpdateMerchOrderStatus,
  markOrdersSettled,
  createJournalPost,
  updateJournalPost,
  deleteJournalPost,
  updateSiteAsset,
  getArtworkOrdersByPhone,
  getArtworkById,
  getCustomersByIds,
  updateCustomerMarketingOptIn,
  recordCustomerNotifications,
  logAdminActivity,
  getAdminActivityLog,
  type ActivityLogEntry,
  type ActivityLogPageOptions,
  type ArtworkUpdateInput,
  type MerchProductInput,
  type MerchVariantInput,
  type ArtistInput,
  type JournalPostInput,
} from "./queries";
import type { ArtworkOrder, OrderStatus, SiteAssetKey } from "./types";

/** Every admin mutation below logs through here after it succeeds. "Who" did
 * it isn't recorded yet — admin auth is still a single shared password with
 * no per-admin identity (see lib/adminAuth.ts) — so this only answers "what
 * changed and when" until individual admin accounts exist. */
function log(action: string, entityType: string, entityId: string | null, detail: Record<string, unknown> = {}) {
  return logAdminActivity(action, entityType, entityId, detail, supabaseService);
}

export async function adminGetActivityLogPage(options: ActivityLogPageOptions): Promise<ActivityLogEntry[]> {
  await assertAdminSession();
  return getAdminActivityLog(supabaseService, options);
}

export async function adminUpdateArtwork(id: string, input: ArtworkUpdateInput): Promise<void> {
  await assertAdminSession();
  await updateArtwork(id, input, supabaseService);
  await log("update", "artwork", id, { title: input.title });
  revalidatePath("/admin/artworks");
}

export async function adminDeleteArtwork(id: string): Promise<void> {
  await assertAdminSession();
  await deleteArtwork(id, supabaseService);
  await log("delete", "artwork", id);
  revalidatePath("/admin/artworks");
}

export async function adminToggleExhibitionFeaturedArtwork(id: string, featured: boolean): Promise<void> {
  await assertAdminSession();
  await toggleExhibitionFeaturedArtwork(id, featured, supabaseService);
  await log("set_exhibition_featured", "artwork", id, { featured });
  revalidatePath("/admin/artworks");
  revalidatePath("/works");
}

export async function adminCreateMerchProduct(input: MerchProductInput): Promise<string> {
  await assertAdminSession();
  const id = await createMerchProduct(input, supabaseService);
  await log("create", "merch_product", id, { title: input.title });
  revalidatePath("/admin/merch");
  return id;
}

export async function adminUpdateMerchProduct(id: string, input: MerchProductInput): Promise<void> {
  await assertAdminSession();
  await updateMerchProduct(id, input, supabaseService);
  await log("update", "merch_product", id, { title: input.title });
  revalidatePath("/admin/merch");
  revalidatePath(`/admin/merch/${id}/edit`);
}

export async function adminUpdateMerchProductActive(id: string, active: boolean): Promise<void> {
  await assertAdminSession();
  await updateMerchProductActive(id, active, supabaseService);
  await log("update", "merch_product", id, { active });
  revalidatePath("/admin/merch");
}

export async function adminAddMerchEditions(id: string, count: number): Promise<void> {
  await assertAdminSession();
  await addMerchEditions(id, count, supabaseService);
  await log("update", "merch_product", id, { restock: count });
  revalidatePath("/admin/merch");
}

export async function adminCreateMerchVariant(productId: string, input: MerchVariantInput): Promise<string> {
  await assertAdminSession();
  const id = await createMerchVariant(productId, input, supabaseService);
  await log("create", "merch_variant", id, { productId, label: input.label });
  revalidatePath(`/admin/merch/${productId}/edit`);
  return id;
}

export async function adminUpdateMerchVariant(id: string, input: MerchVariantInput): Promise<void> {
  await assertAdminSession();
  await updateMerchVariant(id, input, supabaseService);
  await log("update", "merch_variant", id, { label: input.label });
}

export async function adminDeleteMerchVariant(id: string): Promise<void> {
  await assertAdminSession();
  await deleteMerchVariant(id, supabaseService);
  await log("delete", "merch_variant", id);
}

export async function adminReviewArtistApplication(
  id: string,
  decision: "accepted" | "declined"
): Promise<void> {
  await assertAdminSession();
  await reviewArtistApplication(id, decision, supabaseService);
  await log("review", "artist_application", id, { decision });
  revalidatePath("/admin/applications");
}

export async function adminCreateArtist(input: ArtistInput): Promise<string> {
  await assertAdminSession();
  const id = await createArtist(input, supabaseService);
  await log("create", "artist", id, { name: input.name });
  revalidatePath("/admin/artists");
  return id;
}

export async function adminUpdateArtist(id: string, input: ArtistInput): Promise<void> {
  await assertAdminSession();
  await updateArtist(id, input, supabaseService);
  await log("update", "artist", id, { name: input.name });
  revalidatePath("/admin/artists");
}

export async function adminDeleteArtist(id: string): Promise<void> {
  await assertAdminSession();
  await deleteArtist(id, supabaseService);
  await log("delete", "artist", id);
  revalidatePath("/admin/artists");
}

export async function adminDeleteMerchProduct(id: string): Promise<void> {
  await assertAdminSession();
  await deleteMerchProduct(id, supabaseService);
  await log("delete", "merch_product", id);
  revalidatePath("/admin/merch");
}

export async function adminUpdateGeneralInquiryStatus(
  id: string,
  status: "reviewing" | "done"
): Promise<void> {
  await assertAdminSession();
  await updateGeneralInquiryStatus(id, status, supabaseService);
  await log("update", "general_inquiry", id, { status });
  revalidatePath("/admin/inquiries");
}

export async function adminUpdateArtworkOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await updateArtworkOrderStatus(id, status, supabaseService);
  await log("update", "artwork_order", id, { status });
  revalidatePath("/admin/orders");
}

export async function adminUpdateMerchOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await updateMerchOrderStatus(id, status, supabaseService);
  await log("update", "merch_order", id, { status });
  revalidatePath("/admin/orders");
}

export async function adminUpdateOrderStaffNote(
  kind: "artwork" | "merch",
  id: string,
  note: string
): Promise<void> {
  await assertAdminSession();
  await updateOrderStaffNote(kind, id, note, supabaseService);
  revalidatePath(kind === "artwork" ? `/admin/orders/artwork/${id}` : `/admin/orders/merch/${id}`);
}

export async function adminBulkUpdateArtworkOrderStatus(ids: string[], status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await bulkUpdateArtworkOrderStatus(ids, status, supabaseService);
  await log("bulk_update", "artwork_order", null, { ids, status });
  revalidatePath("/admin/orders");
}

export async function adminBulkUpdateMerchOrderStatus(ids: string[], status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await bulkUpdateMerchOrderStatus(ids, status, supabaseService);
  await log("bulk_update", "merch_order", null, { ids, status });
  revalidatePath("/admin/orders");
}

export async function adminMarkOrdersSettled(
  kind: "artwork" | "merch",
  ids: string[],
  settled: boolean
): Promise<void> {
  await assertAdminSession();
  await markOrdersSettled(kind, ids, settled, supabaseService);
  await log(settled ? "mark_settled" : "unmark_settled", `${kind}_order`, null, { ids });
  revalidatePath("/admin/settlements");
}

export async function adminCreateJournalPost(input: JournalPostInput): Promise<void> {
  await assertAdminSession();
  await createJournalPost(input, supabaseService);
  await log("create", "journal_post", null, { title: input.title });
  revalidatePath("/admin/journal");
}

export async function adminUpdateJournalPost(id: string, input: JournalPostInput): Promise<void> {
  await assertAdminSession();
  await updateJournalPost(id, input, supabaseService);
  await log("update", "journal_post", id, { title: input.title });
  revalidatePath("/admin/journal");
}

export async function adminDeleteJournalPost(id: string): Promise<void> {
  await assertAdminSession();
  await deleteJournalPost(id, supabaseService);
  await log("delete", "journal_post", id);
  revalidatePath("/admin/journal");
}

export async function adminUpdateSiteAsset(key: SiteAssetKey, url: string): Promise<void> {
  await assertAdminSession();
  await updateSiteAsset(key, url, supabaseService);
  await log("update", "site_asset", key);
  revalidatePath("/admin/media");
}

export async function adminGetArtworkOrdersByPhone(phone: string): Promise<ArtworkOrder[]> {
  await assertAdminSession();
  return getArtworkOrdersByPhone(phone, supabaseService);
}

export async function adminUpdateCustomerMarketingOptIn(id: string, optIn: boolean): Promise<void> {
  await assertAdminSession();
  await updateCustomerMarketingOptIn(id, optIn, supabaseService);
  await log("update", "customer", id, { marketingOptIn: optIn });
  revalidatePath("/admin/customers");
}

export async function adminSendNewArtworkNotification(
  artworkId: string,
  customerIds: string[]
): Promise<{ sentCount: number }> {
  await assertAdminSession();
  const artwork = await getArtworkById(artworkId);
  if (!artwork) throw new Error("작품을 찾을 수 없습니다.");

  const customers = await getCustomersByIds(customerIds, supabaseService);
  const eligible = customers.filter((c) => c.marketingOptIn && c.email);
  if (eligible.length === 0) return { sentCount: 0 };

  await sendNewArtworkEmail(
    eligible.map((c) => c.email),
    artwork
  );
  await recordCustomerNotifications(
    eligible.map((c) => c.id),
    artworkId,
    `새 작품 소식: ${artwork.title}`,
    supabaseService
  );
  await log("send_notification", "artwork", artworkId, { customerCount: eligible.length });
  revalidatePath("/admin/customers");
  return { sentCount: eligible.length };
}
