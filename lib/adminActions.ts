"use server";

import { revalidatePath } from "next/cache";
import { assertAdminSession } from "./adminAuth";
import { supabaseService } from "./supabase/service";
import {
  updateArtwork,
  deleteArtwork,
  createMerchProduct,
  updateMerchProduct,
  updateMerchProductActive,
  createMerchVariant,
  updateMerchVariant,
  deleteMerchVariant,
  reviewArtistApplication,
  createArtist,
  updateArtist,
  updateGeneralInquiryStatus,
  updateArtworkOrderStatus,
  updateMerchOrderStatus,
  createJournalPost,
  updateJournalPost,
  deleteJournalPost,
  updateSiteAsset,
  getArtworkOrdersByPhone,
  type ArtworkUpdateInput,
  type MerchProductInput,
  type MerchVariantInput,
  type ArtistInput,
  type JournalPostInput,
} from "./queries";
import type { ArtworkOrder, OrderStatus, SiteAssetKey } from "./types";

export async function adminUpdateArtwork(id: string, input: ArtworkUpdateInput): Promise<void> {
  await assertAdminSession();
  await updateArtwork(id, input, supabaseService);
  revalidatePath("/admin/artworks");
}

export async function adminDeleteArtwork(id: string): Promise<void> {
  await assertAdminSession();
  await deleteArtwork(id, supabaseService);
  revalidatePath("/admin/artworks");
}

export async function adminCreateMerchProduct(input: MerchProductInput): Promise<string> {
  await assertAdminSession();
  const id = await createMerchProduct(input, supabaseService);
  revalidatePath("/admin/merch");
  return id;
}

export async function adminUpdateMerchProduct(id: string, input: MerchProductInput): Promise<void> {
  await assertAdminSession();
  await updateMerchProduct(id, input, supabaseService);
  revalidatePath("/admin/merch");
  revalidatePath(`/admin/merch/${id}/edit`);
}

export async function adminUpdateMerchProductActive(id: string, active: boolean): Promise<void> {
  await assertAdminSession();
  await updateMerchProductActive(id, active, supabaseService);
  revalidatePath("/admin/merch");
}

export async function adminCreateMerchVariant(productId: string, input: MerchVariantInput): Promise<string> {
  await assertAdminSession();
  const id = await createMerchVariant(productId, input, supabaseService);
  revalidatePath(`/admin/merch/${productId}/edit`);
  return id;
}

export async function adminUpdateMerchVariant(id: string, input: MerchVariantInput): Promise<void> {
  await assertAdminSession();
  await updateMerchVariant(id, input, supabaseService);
}

export async function adminDeleteMerchVariant(id: string): Promise<void> {
  await assertAdminSession();
  await deleteMerchVariant(id, supabaseService);
}

export async function adminReviewArtistApplication(
  id: string,
  decision: "accepted" | "declined"
): Promise<void> {
  await assertAdminSession();
  await reviewArtistApplication(id, decision, supabaseService);
  revalidatePath("/admin/applications");
}

export async function adminCreateArtist(input: ArtistInput): Promise<string> {
  await assertAdminSession();
  const id = await createArtist(input, supabaseService);
  revalidatePath("/admin/artists");
  return id;
}

export async function adminUpdateArtist(id: string, input: ArtistInput): Promise<void> {
  await assertAdminSession();
  await updateArtist(id, input, supabaseService);
  revalidatePath("/admin/artists");
}

export async function adminUpdateGeneralInquiryStatus(
  id: string,
  status: "reviewing" | "done"
): Promise<void> {
  await assertAdminSession();
  await updateGeneralInquiryStatus(id, status, supabaseService);
  revalidatePath("/admin/inquiries");
}

export async function adminUpdateArtworkOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await updateArtworkOrderStatus(id, status, supabaseService);
  revalidatePath("/admin/orders");
}

export async function adminUpdateMerchOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await assertAdminSession();
  await updateMerchOrderStatus(id, status, supabaseService);
  revalidatePath("/admin/orders");
}

export async function adminCreateJournalPost(input: JournalPostInput): Promise<void> {
  await assertAdminSession();
  await createJournalPost(input, supabaseService);
  revalidatePath("/admin/journal");
}

export async function adminUpdateJournalPost(id: string, input: JournalPostInput): Promise<void> {
  await assertAdminSession();
  await updateJournalPost(id, input, supabaseService);
  revalidatePath("/admin/journal");
}

export async function adminDeleteJournalPost(id: string): Promise<void> {
  await assertAdminSession();
  await deleteJournalPost(id, supabaseService);
  revalidatePath("/admin/journal");
}

export async function adminUpdateSiteAsset(key: SiteAssetKey, url: string): Promise<void> {
  await assertAdminSession();
  await updateSiteAsset(key, url, supabaseService);
  revalidatePath("/admin/media");
}

export async function adminGetArtworkOrdersByPhone(phone: string): Promise<ArtworkOrder[]> {
  await assertAdminSession();
  return getArtworkOrdersByPhone(phone, supabaseService);
}
