import { supabase } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type {
  Artist,
  ArtistApplication,
  Artwork,
  ArtworkOrder,
  CommissionInquiry,
  Customer,
  CustomerNotification,
  GeneralInquiry,
  JournalPost,
  MerchOrder,
  MerchProduct,
  MerchVariant,
  OrderStatus,
  Profile,
  ShippingInfo,
  SiteAssetKey,
} from "./types";
import { getMediumTypeLabel } from "./mediumTaxonomy";
import { getMerchCategoryLabel } from "./merchTaxonomy";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ArtworkRow = Database["public"]["Tables"]["artworks"]["Row"];
type InquiryRow = Database["public"]["Tables"]["commission_inquiries"]["Row"];
type ArtistApplicationRow = Database["public"]["Tables"]["artist_applications"]["Row"];
type GeneralInquiryRow = Database["public"]["Tables"]["general_inquiries"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type MerchOrderRow = Database["public"]["Tables"]["merch_orders"]["Row"];
type JournalRow = Database["public"]["Tables"]["journal_posts"]["Row"];
type MerchProductRow = Database["public"]["Tables"]["merch_products"]["Row"];
type MerchVariantRow = Database["public"]["Tables"]["merch_variants"]["Row"];
type MerchOrderByPhoneRow = Database["public"]["Functions"]["get_merch_orders_by_phone"]["Returns"][number];
export type ArtworkWithArtistRow = ArtworkRow & { artists: { name: string } | null };
export type MerchProductWithRelationsRow = MerchProductRow & {
  artworks: { slug: string; title: string } | null;
  artists: { slug: string; name: string } | null;
};
type OrderWithArtworkRow = OrderRow & {
  artworks: { title: string; artists: { name: string } | null } | null;
};
type MerchOrderWithProductRow = MerchOrderRow & {
  merch_products: {
    slug: string;
    title: string;
    category: string;
    cover_hue: number;
    cover_variant: number;
    image_urls: string[];
  } | null;
  merch_variants: { label: string } | null;
};

export const ARTWORK_WITH_ARTIST_SELECT = "*, artists ( name )";
export const MERCH_PRODUCT_SELECT = "*, artworks ( slug, title ), artists ( slug, name )";

export function toArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    tagline: row.tagline,
    bio: row.bio,
    hue: row.hue,
    avatarUrl: row.avatar_url,
    styleTags: row.style_tags,
    artistSplitRate: row.artist_split_rate,
    commission: {
      accepting: row.commission_accepting,
      media: row.commission_media,
      leadTime: row.commission_lead_time,
      priceRange: row.commission_price_range,
    },
  };
}

export function toArtwork(row: ArtworkWithArtistRow): Artwork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    artistId: row.artist_id,
    artistName: row.artists?.name ?? "",
    mediumTypeCode: row.medium_type_code,
    size: row.size,
    year: row.year,
    price: row.price,
    sold: row.sold,
    merchEnabled: row.merch_enabled,
    hue: row.hue,
    variant: row.variant,
    imageUrls: row.image_urls,
    viewCount: row.view_count,
  };
}

function toInquiry(row: InquiryRow): CommissionInquiry {
  const summary = row.message.length > 28 ? `${row.message.slice(0, 28)}…` : row.message;
  return {
    id: row.id,
    artistId: row.artist_id,
    collectorName: row.collector_name,
    summary,
    message: row.message,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    timeline: row.timeline,
    status: row.status as CommissionInquiry["status"],
  };
}

export function toJournalPost(row: JournalRow): JournalPost {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as JournalPost["category"],
    title: row.title,
    excerpt: row.excerpt,
    body: row.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    coverHue: row.cover_hue,
    coverVariant: row.cover_variant,
    coverImageUrl: row.cover_image_url,
    author: row.author,
    readMinutes: row.read_minutes,
    relatedArtistId: row.related_artist_id,
    relatedArtworkId: row.related_artwork_id,
    relatedMediumCategoryCode: row.related_medium_category_code,
    publishedAt: row.published_at,
  };
}

export function toMerchProduct(row: MerchProductWithRelationsRow): MerchProduct {
  return {
    id: row.id,
    slug: row.slug,
    artworkId: row.artwork_id,
    artworkSlug: row.artworks?.slug ?? "",
    artworkTitle: row.artworks?.title ?? "",
    artistId: row.artist_id,
    artistSlug: row.artists?.slug ?? "",
    artistName: row.artists?.name ?? "",
    category: row.category,
    title: row.title,
    description: row.description,
    price: row.price,
    royaltyRate: Number(row.royalty_rate),
    fulfillment: row.fulfillment as MerchProduct["fulfillment"],
    editionSize: row.edition_size,
    hasVariants: row.has_variants,
    active: row.active,
    hue: row.cover_hue,
    variant: row.cover_variant,
    imageUrls: row.image_urls,
  };
}

function toMerchVariant(row: MerchVariantRow): MerchVariant {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    priceDelta: row.price_delta,
  };
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role as Profile["role"],
    name: row.name,
    phone: row.phone,
    email: row.email,
    username: row.username,
    artistId: row.artist_id,
  };
}

function toArtistApplication(row: ArtistApplicationRow): ArtistApplication {
  return {
    id: row.id,
    artistName: row.artist_name,
    nameEn: row.name_en,
    tagline: row.tagline,
    bio: row.bio,
    styleTags: row.style_tags,
    commissionMedia: row.commission_media,
    portfolioUrl: row.portfolio_url,
    sampleArtworkTitle: row.sample_artwork_title,
    sampleArtworkNote: row.sample_artwork_note,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    status: row.status as ArtistApplication["status"],
    createdAt: row.created_at,
  };
}

function toGeneralInquiry(row: GeneralInquiryRow): GeneralInquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    category: row.category as GeneralInquiry["category"],
    message: row.message,
    status: row.status as GeneralInquiry["status"],
    createdAt: row.created_at,
  };
}

function toShippingInfo(row: {
  shipping_method: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  courier_name: string | null;
  courier_phone: string | null;
  vehicle_number: string | null;
}): ShippingInfo {
  return {
    shippingMethod: row.shipping_method as ShippingInfo["shippingMethod"],
    trackingCarrier: row.tracking_carrier,
    trackingNumber: row.tracking_number,
    courierName: row.courier_name,
    courierPhone: row.courier_phone,
    vehicleNumber: row.vehicle_number,
  };
}

function toArtworkOrder(row: OrderWithArtworkRow): ArtworkOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    artworkId: row.artwork_id,
    artworkTitle: row.artworks?.title ?? "(삭제된 작품)",
    artistName: row.artworks?.artists?.name ?? "",
    shippingAddress: row.shipping_address,
    phone: row.phone,
    name: row.name,
    email: row.email,
    paymentMethod: row.payment_method,
    insured: row.insured,
    amount: row.amount,
    artistPayoutAmount: row.artist_payout_amount,
    status: row.status as ArtworkOrder["status"],
    createdAt: row.created_at,
    ...toShippingInfo(row),
  };
}

function toAdminMerchOrder(row: MerchOrderWithProductRow): MerchOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    productId: row.product_id,
    productSlug: row.merch_products?.slug ?? "",
    productTitle: row.merch_products?.title ?? "(삭제된 상품)",
    productCategory: row.merch_products?.category ?? "",
    hue: row.merch_products?.cover_hue ?? 90,
    variant: row.merch_products?.cover_variant ?? 0,
    imageUrls: row.merch_products?.image_urls ?? [],
    variantLabel: row.merch_variants?.label ?? null,
    editionNumber: row.edition_number,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    amount: row.amount,
    royaltyAmount: row.royalty_amount,
    shippingAddress: row.shipping_address,
    phone: row.phone,
    name: row.name,
    email: row.email,
    paymentMethod: row.payment_method,
    status: row.status as MerchOrder["status"],
    createdAt: row.created_at,
    ...toShippingInfo(row),
  };
}

function toMerchOrder(row: MerchOrderByPhoneRow): MerchOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    productId: row.product_id,
    productSlug: row.product_slug ?? "",
    productTitle: row.product_title ?? "(삭제된 상품)",
    productCategory: row.product_category ?? "",
    hue: row.cover_hue ?? 90,
    variant: row.cover_variant ?? 0,
    imageUrls: [],
    variantLabel: row.variant_label,
    editionNumber: row.edition_number,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    amount: row.amount,
    // get_merch_orders_by_phone doesn't return royalty_amount (it's a
    // studio/admin-only figure, not shown in the guest order-lookup UI).
    royaltyAmount: 0,
    shippingAddress: row.shipping_address,
    phone: row.phone,
    name: "",
    email: "",
    paymentMethod: row.payment_method,
    status: row.status as MerchOrder["status"],
    createdAt: row.created_at,
    shippingMethod: null,
    trackingCarrier: null,
    trackingNumber: null,
    courierName: null,
    courierPhone: null,
    vehicleNumber: null,
  };
}

export async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase.from("artists").select("*").order("created_at");
  if (error) throw error;
  return data.map(toArtist);
}

export async function getArtist(slug: string): Promise<Artist | null> {
  const { data, error } = await supabase.from("artists").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? toArtist(data) : null;
}

export async function getArtistById(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<Artist | null> {
  const { data, error } = await client.from("artists").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toArtist(data) : null;
}

export async function getArtistSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("artists").select("slug");
  if (error) throw error;
  return data.map((r) => r.slug);
}

export interface ArtistInput {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  bio: string;
  hue: number;
  avatarUrl: string | null;
  styleTags: string[];
  artistSplitRate: number;
  commissionAccepting: boolean;
  commissionMedia: string[];
  commissionLeadTime: string;
  commissionPriceRange: string;
}

export async function createArtist(
  input: ArtistInput,
  client: SupabaseClient<Database> = supabase
): Promise<string> {
  const { data, error } = await client
    .from("artists")
    .insert({
      slug: input.slug,
      name: input.name,
      name_en: input.nameEn,
      tagline: input.tagline,
      bio: input.bio,
      hue: input.hue,
      avatar_url: input.avatarUrl,
      style_tags: input.styleTags,
      artist_split_rate: input.artistSplitRate,
      commission_accepting: input.commissionAccepting,
      commission_media: input.commissionMedia,
      commission_lead_time: input.commissionLeadTime,
      commission_price_range: input.commissionPriceRange,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateArtist(
  id: string,
  input: ArtistInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("artists")
    .update({
      slug: input.slug,
      name: input.name,
      name_en: input.nameEn,
      tagline: input.tagline,
      bio: input.bio,
      hue: input.hue,
      avatar_url: input.avatarUrl,
      style_tags: input.styleTags,
      artist_split_rate: input.artistSplitRate,
      commission_accepting: input.commissionAccepting,
      commission_media: input.commissionMedia,
      commission_lead_time: input.commissionLeadTime,
      commission_price_range: input.commissionPriceRange,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function getArtworks(): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_WITH_ARTIST_SELECT)
    .order("created_at", { ascending: false })
    .returns<ArtworkWithArtistRow[]>();
  if (error) throw error;
  return data.map(toArtwork);
}

export async function getArtwork(slug: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_WITH_ARTIST_SELECT)
    .eq("slug", slug)
    .maybeSingle()
    .returns<ArtworkWithArtistRow>();
  if (error) throw error;
  return data ? toArtwork(data) : null;
}

export async function getArtworkSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("artworks").select("slug");
  if (error) throw error;
  return data.map((r) => r.slug);
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_WITH_ARTIST_SELECT)
    .eq("id", id)
    .maybeSingle()
    .returns<ArtworkWithArtistRow>();
  if (error) throw error;
  return data ? toArtwork(data) : null;
}

export async function getUnsoldArtworkSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("artworks").select("slug").eq("sold", false);
  if (error) throw error;
  return data.map((r) => r.slug);
}

export async function getArtworksByArtistId(artistId: string): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from("artworks")
    .select(ARTWORK_WITH_ARTIST_SELECT)
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .returns<ArtworkWithArtistRow[]>();
  if (error) throw error;
  return data.map(toArtwork);
}

export async function updateArtworkMerchEnabled(id: string, merchEnabled: boolean): Promise<void> {
  const { error } = await supabase.from("artworks").update({ merch_enabled: merchEnabled }).eq("id", id);
  if (error) throw error;
}

/** Fire-and-forget view counter, callable by anonymous visitors via a
 * SECURITY DEFINER RPC (direct UPDATE is restricted to the owning artist). */
export async function incrementArtworkView(artworkId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_artwork_view", { p_artwork_id: artworkId });
  if (error) throw error;
}

export async function getStudioInquiries(
  artistId: string,
  client: SupabaseClient<Database> = supabase
): Promise<CommissionInquiry[]> {
  const { data, error } = await client
    .from("commission_inquiries")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toInquiry);
}

export interface CommissionInquiryInput {
  artistId: string;
  collectorName: string;
  email: string;
  phone: string;
  referenceNote: string;
  medium: string;
  size: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  message: string;
}

export async function createCommissionInquiry(input: CommissionInquiryInput): Promise<void> {
  const { error } = await supabase.from("commission_inquiries").insert({
    artist_id: input.artistId,
    collector_name: input.collectorName,
    email: input.email,
    phone: input.phone,
    reference_note: input.referenceNote,
    medium: input.medium,
    size: input.size,
    budget_min: input.budgetMin,
    budget_max: input.budgetMax,
    timeline: input.timeline,
    message: input.message,
  });
  if (error) throw error;
}

export async function updateInquiryStatus(
  id: string,
  status: "accepted" | "declined"
): Promise<void> {
  const { error } = await supabase.from("commission_inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

export interface PurchaseInput {
  artworkId: string;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
  insured: boolean;
  marketingOptIn?: boolean;
}

export async function purchaseArtwork(
  input: PurchaseInput
): Promise<{ orderNumber: string; amount: number }> {
  const { data, error } = await supabase.rpc("purchase_artwork", {
    p_artwork_id: input.artworkId,
    p_shipping_address: input.shippingAddress,
    p_phone: input.phone,
    p_name: input.name,
    p_email: input.email,
    p_payment_method: input.paymentMethod,
    p_insured: input.insured,
    p_marketing_opt_in: input.marketingOptIn ?? true,
  });
  if (error) throw error;
  const row = data[0];
  return { orderNumber: row.order_number, amount: row.amount };
}

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "artwork"}-${suffix}`;
}

export interface NewArtworkInput {
  artistId: string;
  title: string;
  description: string;
  mediumTypeCode: string;
  size: string;
  year: number;
  price: number;
  hue: number;
  imageUrls: string[];
}

export async function createArtwork(input: NewArtworkInput): Promise<string> {
  const { data, error } = await supabase
    .from("artworks")
    .insert({
      slug: slugify(input.title),
      title: input.title,
      description: input.description,
      artist_id: input.artistId,
      medium_type_code: input.mediumTypeCode,
      size: input.size,
      year: input.year,
      price: input.price,
      hue: input.hue,
      variant: Math.floor(Math.random() * 3),
      image_urls: input.imageUrls,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export interface ArtworkUpdateInput {
  title: string;
  description: string;
  mediumTypeCode: string;
  size: string;
  year: number;
  price: number;
  sold: boolean;
  hue: number;
  variant: number;
  imageUrls: string[];
}

export async function updateArtwork(
  id: string,
  input: ArtworkUpdateInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("artworks")
    .update({
      title: input.title,
      description: input.description,
      medium_type_code: input.mediumTypeCode,
      size: input.size,
      year: input.year,
      price: input.price,
      sold: input.sold,
      hue: input.hue,
      variant: input.variant,
      image_urls: input.imageUrls,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteArtwork(id: string, client: SupabaseClient<Database> = supabase): Promise<void> {
  const { error } = await client.from("artworks").delete().eq("id", id);
  if (error) throw error;
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  const { data, error } = await supabase
    .from("journal_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map(toJournalPost);
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  const { data, error } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toJournalPost(data) : null;
}

export async function getJournalPostSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("journal_posts").select("slug");
  if (error) throw error;
  return data.map((r) => r.slug);
}

export async function getRelatedJournalPosts(
  excludeSlug: string,
  limit = 3
): Promise<JournalPost[]> {
  const { data, error } = await supabase
    .from("journal_posts")
    .select("*")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(toJournalPost);
}

export async function getMerchProducts(): Promise<MerchProduct[]> {
  const { data, error } = await supabase
    .from("merch_products")
    .select(MERCH_PRODUCT_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .returns<MerchProductWithRelationsRow[]>();
  if (error) throw error;
  return data.map(toMerchProduct);
}

export async function getMerchProduct(slug: string): Promise<MerchProduct | null> {
  const { data, error } = await supabase
    .from("merch_products")
    .select(MERCH_PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()
    .returns<MerchProductWithRelationsRow>();
  if (error) throw error;
  return data ? toMerchProduct(data) : null;
}

export async function getMerchProductsByIds(ids: string[]): Promise<MerchProduct[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("merch_products")
    .select(MERCH_PRODUCT_SELECT)
    .in("id", ids)
    .returns<MerchProductWithRelationsRow[]>();
  if (error) throw error;
  return data.map(toMerchProduct);
}

export async function getMerchProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("merch_products").select("slug").eq("active", true);
  if (error) throw error;
  return data.map((r) => r.slug);
}

export async function getAllMerchProductsAdmin(
  client: SupabaseClient<Database> = supabase
): Promise<MerchProduct[]> {
  const { data, error } = await client
    .from("merch_products")
    .select(MERCH_PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .returns<MerchProductWithRelationsRow[]>();
  if (error) throw error;
  return data.map(toMerchProduct);
}

export async function getMerchProductByIdAdmin(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<MerchProduct | null> {
  const { data, error } = await client
    .from("merch_products")
    .select(MERCH_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle()
    .returns<MerchProductWithRelationsRow>();
  if (error) throw error;
  return data ? toMerchProduct(data) : null;
}

export interface MerchProductInput {
  slug: string;
  artworkId: string;
  artistId: string;
  category: string;
  title: string;
  description: string;
  price: number;
  royaltyRate: number;
  fulfillment: "edition" | "made_to_order";
  editionSize: number | null;
  hasVariants: boolean;
  active: boolean;
  coverHue: number;
  coverVariant: number;
  imageUrls: string[];
}

export async function createMerchProduct(
  input: MerchProductInput,
  client: SupabaseClient<Database> = supabase
): Promise<string> {
  const { data, error } = await client
    .from("merch_products")
    .insert({
      slug: input.slug,
      artwork_id: input.artworkId,
      artist_id: input.artistId,
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      royalty_rate: input.royaltyRate,
      fulfillment: input.fulfillment,
      edition_size: input.fulfillment === "edition" ? input.editionSize : null,
      has_variants: input.hasVariants,
      active: input.active,
      cover_hue: input.coverHue,
      cover_variant: input.coverVariant,
      image_urls: input.imageUrls,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (input.fulfillment === "edition" && input.editionSize && input.editionSize > 0) {
    const editions = Array.from({ length: input.editionSize }, (_, i) => ({
      product_id: data.id,
      edition_number: i + 1,
    }));
    const { error: editionsError } = await client.from("merch_editions").insert(editions);
    if (editionsError) throw editionsError;
  }

  return data.id;
}

export async function updateMerchProduct(
  id: string,
  input: MerchProductInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("merch_products")
    .update({
      slug: input.slug,
      artwork_id: input.artworkId,
      artist_id: input.artistId,
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      royalty_rate: input.royaltyRate,
      has_variants: input.hasVariants,
      active: input.active,
      image_urls: input.imageUrls,
    })
    .eq("id", id);
  if (error) throw error;
}

export interface MerchVariantInput {
  label: string;
  priceDelta: number;
}

export async function createMerchVariant(
  productId: string,
  input: MerchVariantInput,
  client: SupabaseClient<Database> = supabase
): Promise<string> {
  const { data, error } = await client
    .from("merch_variants")
    .insert({
      product_id: productId,
      label: input.label,
      price_delta: input.priceDelta,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateMerchVariant(
  id: string,
  input: MerchVariantInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("merch_variants")
    .update({
      label: input.label,
      price_delta: input.priceDelta,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMerchVariant(id: string, client: SupabaseClient<Database> = supabase): Promise<void> {
  const { error } = await client.from("merch_variants").delete().eq("id", id);
  if (error) throw error;
}

export async function updateMerchProductActive(
  id: string,
  active: boolean,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("merch_products").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function getMerchVariants(productId: string): Promise<MerchVariant[]> {
  const { data, error } = await supabase
    .from("merch_variants")
    .select("*")
    .eq("product_id", productId)
    .order("label");
  if (error) throw error;
  return data.map(toMerchVariant);
}

export async function getMerchEditionsRemaining(productId: string): Promise<number> {
  const { count, error } = await supabase
    .from("merch_editions")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("sold", false);
  if (error) throw error;
  return count ?? 0;
}

export interface MerchPurchaseInput {
  productId: string;
  variantId: string | null;
  quantity: number;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
  marketingOptIn?: boolean;
}

export async function purchaseMerch(
  input: MerchPurchaseInput
): Promise<{ orderNumber: string; amount: number }> {
  const { data, error } = await supabase.rpc("purchase_merch", {
    p_product_id: input.productId,
    // purchase_merch's SQL signature has no DEFAULT for p_variant_id, so the
    // generated type is non-nullable even though the function body accepts
    // (and expects) null for non-variant products.
    p_variant_id: input.variantId as string,
    p_quantity: input.quantity,
    p_shipping_address: input.shippingAddress,
    p_phone: input.phone,
    p_name: input.name,
    p_email: input.email,
    p_payment_method: input.paymentMethod,
    p_marketing_opt_in: input.marketingOptIn ?? true,
  });
  if (error) throw error;
  const row = data[0];
  return { orderNumber: row.order_number, amount: row.amount };
}

export async function getMerchOrdersByPhone(phone: string): Promise<MerchOrder[]> {
  const { data, error } = await supabase.rpc("get_merch_orders_by_phone", { p_phone: phone });
  if (error) throw error;
  return data.map(toMerchOrder);
}

/** Orders placed while logged in, linked via `orders.user_id`/`merch_orders.user_id`
 * (stamped automatically by the purchase RPCs). RLS scopes these to the caller's
 * own rows, so no explicit `.eq("user_id", ...)` filter is needed. Returns an
 * empty array for guests. */
export async function getMyArtworkOrders(): Promise<ArtworkOrder[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_WITH_ARTWORK_SELECT)
    .order("created_at", { ascending: false })
    .returns<OrderWithArtworkRow[]>();
  if (error) throw error;
  return data.map(toArtworkOrder);
}

export async function getMyMerchOrders(): Promise<MerchOrder[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("merch_orders")
    .select(MERCH_ORDER_WITH_PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .returns<MerchOrderWithProductRow[]>();
  if (error) throw error;
  return data.map(toAdminMerchOrder);
}

/** Sales view for the logged-in artist's own studio dashboard. RLS scopes
 * these to orders on the artist's own artworks/products, so — like
 * getMyArtworkOrders/getMyMerchOrders — no explicit artist filter is needed
 * in the query itself. */
export async function getArtworkOrdersForCurrentArtist(): Promise<ArtworkOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_WITH_ARTWORK_SELECT)
    .order("created_at", { ascending: false })
    .returns<OrderWithArtworkRow[]>();
  if (error) throw error;
  return data.map(toArtworkOrder);
}

export async function getMerchOrdersForCurrentArtist(): Promise<MerchOrder[]> {
  const { data, error } = await supabase
    .from("merch_orders")
    .select(MERCH_ORDER_WITH_PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .returns<MerchOrderWithProductRow[]>();
  if (error) throw error;
  return data.map(toAdminMerchOrder);
}

export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_available", { p_username: username });
  if (error) throw error;
  return data;
}

export interface GeneralInquiryInput {
  name: string;
  email: string;
  phone: string;
  category: "general" | "consulting" | "other";
  message: string;
}

export async function submitGeneralInquiry(input: GeneralInquiryInput): Promise<void> {
  const { error } = await supabase.from("general_inquiries").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    category: input.category,
    message: input.message,
  });
  if (error) throw error;
}

export interface ArtistApplicationInput {
  artistName: string;
  nameEn: string;
  tagline: string;
  bio: string;
  styleTags: string[];
  commissionMedia: string[];
  portfolioUrl: string;
  sampleArtworkTitle: string;
  sampleArtworkNote: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export async function submitArtistApplication(input: ArtistApplicationInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase.from("artist_applications").insert({
    user_id: user.id,
    artist_name: input.artistName,
    name_en: input.nameEn,
    tagline: input.tagline,
    bio: input.bio,
    style_tags: input.styleTags,
    commission_media: input.commissionMedia,
    portfolio_url: input.portfolioUrl,
    sample_artwork_title: input.sampleArtworkTitle,
    sample_artwork_note: input.sampleArtworkNote,
    name: input.name,
    phone: input.phone,
    email: input.email,
    message: input.message,
  });
  if (error) throw error;
}

export async function getArtistApplications(
  client: SupabaseClient<Database> = supabase
): Promise<ArtistApplication[]> {
  const { data, error } = await client
    .from("artist_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toArtistApplication);
}

export async function reviewArtistApplication(
  id: string,
  decision: "accepted" | "declined",
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.rpc("review_artist_application", {
    p_application_id: id,
    p_decision: decision,
  });
  if (error) throw error;
}

export async function getGeneralInquiries(
  client: SupabaseClient<Database> = supabase
): Promise<GeneralInquiry[]> {
  const { data, error } = await client
    .from("general_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toGeneralInquiry);
}

export async function updateGeneralInquiryStatus(
  id: string,
  status: "reviewing" | "done",
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("general_inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

const ORDER_WITH_ARTWORK_SELECT = "*, artworks ( title, artists ( name ) )";
const MERCH_ORDER_WITH_PRODUCT_SELECT =
  "*, merch_products ( slug, title, category, cover_hue, cover_variant, image_urls ), merch_variants ( label )";

export async function getAllArtworkOrders(
  client: SupabaseClient<Database> = supabase
): Promise<ArtworkOrder[]> {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ARTWORK_SELECT)
    .order("created_at", { ascending: false })
    .returns<OrderWithArtworkRow[]>();
  if (error) throw error;
  return data.map(toArtworkOrder);
}

export async function getAllMerchOrders(
  client: SupabaseClient<Database> = supabase
): Promise<MerchOrder[]> {
  const { data, error } = await client
    .from("merch_orders")
    .select(MERCH_ORDER_WITH_PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .returns<MerchOrderWithProductRow[]>();
  if (error) throw error;
  return data.map(toAdminMerchOrder);
}

export async function getArtworkOrderById(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<ArtworkOrder | null> {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ARTWORK_SELECT)
    .eq("id", id)
    .maybeSingle()
    .returns<OrderWithArtworkRow>();
  if (error) throw error;
  return data ? toArtworkOrder(data) : null;
}

export async function getMerchOrderById(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<MerchOrder | null> {
  const { data, error } = await client
    .from("merch_orders")
    .select(MERCH_ORDER_WITH_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle()
    .returns<MerchOrderWithProductRow>();
  if (error) throw error;
  return data ? toAdminMerchOrder(data) : null;
}

export interface ShippingUpdateInput {
  status: OrderStatus;
  shippingMethod?: "parcel" | "freight";
  trackingCarrier?: string;
  trackingNumber?: string;
  courierName?: string;
  courierPhone?: string;
  vehicleNumber?: string;
}

/** Called by the logged-in artist from the studio sales dashboard. Backed by
 * the update_order_shipping SECURITY DEFINER RPC, which verifies the order
 * belongs to the caller's own artist_id — not a plain table update, since
 * artists have no RLS UPDATE policy on orders/merch_orders (see AGENTS notes
 * in the admin actions for why: keeps arbitrary-column tampering impossible
 * via direct REST calls). */
export async function updateOrderShippingStatus(kind: "artwork" | "merch", id: string, input: ShippingUpdateInput): Promise<void> {
  const { error } = await supabase.rpc("update_order_shipping", {
    p_kind: kind,
    p_order_id: id,
    p_status: input.status,
    p_shipping_method: input.shippingMethod,
    p_tracking_carrier: input.trackingCarrier,
    p_tracking_number: input.trackingNumber,
    p_courier_name: input.courierName,
    p_courier_phone: input.courierPhone,
    p_vehicle_number: input.vehicleNumber,
  });
  if (error) throw error;
}

export async function getArtworkOrdersByPhone(
  phone: string,
  client: SupabaseClient<Database> = supabase
): Promise<ArtworkOrder[]> {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ARTWORK_SELECT)
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .returns<OrderWithArtworkRow[]>();
  if (error) throw error;
  return data.map(toArtworkOrder);
}

export async function updateArtworkOrderStatus(
  id: string,
  status: OrderStatus,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateMerchOrderStatus(
  id: string,
  status: OrderStatus,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("merch_orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateArtworkOrderStatus(
  ids: string[],
  status: OrderStatus,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("orders").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function bulkUpdateMerchOrderStatus(
  ids: string[],
  status: OrderStatus,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("merch_orders").update({ status }).in("id", ids);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Settlement — a unified artwork+merch order view for the admin settlement
// screen. Artwork orders have no defined gallery/artist commission split, so
// `payoutAmount` is null for them (gross `amount` is shown instead); merch
// orders already carry a computed `royalty_amount` per order.
// ---------------------------------------------------------------------------

export interface SettlementOrder {
  id: string;
  kind: "artwork" | "merch";
  artistName: string;
  itemTitle: string;
  orderNumber: string;
  amount: number;
  payoutAmount: number | null;
  status: OrderStatus;
  settledAt: string | null;
  createdAt: string;
}

type SettlementOrderRow = OrderRow & { artworks: { title: string; artists: { name: string } | null } | null };
type SettlementMerchOrderRow = MerchOrderRow & {
  merch_products: { title: string; artists: { name: string } | null } | null;
};

export async function getAdminSettlementOrders(
  client: SupabaseClient<Database> = supabase
): Promise<SettlementOrder[]> {
  const [artworkRes, merchRes] = await Promise.all([
    client
      .from("orders")
      .select("*, artworks ( title, artists ( name ) )")
      .order("created_at", { ascending: false })
      .returns<SettlementOrderRow[]>(),
    client
      .from("merch_orders")
      .select("*, merch_products ( title, artists ( name ) )")
      .order("created_at", { ascending: false })
      .returns<SettlementMerchOrderRow[]>(),
  ]);
  if (artworkRes.error) throw artworkRes.error;
  if (merchRes.error) throw merchRes.error;

  const artworkOrders: SettlementOrder[] = artworkRes.data.map((row) => ({
    id: row.id,
    kind: "artwork",
    artistName: row.artworks?.artists?.name ?? "",
    itemTitle: row.artworks?.title ?? "(삭제된 작품)",
    orderNumber: row.order_number,
    amount: row.amount,
    payoutAmount: null,
    status: row.status as OrderStatus,
    settledAt: row.settled_at,
    createdAt: row.created_at,
  }));
  const merchOrders: SettlementOrder[] = merchRes.data.map((row) => ({
    id: row.id,
    kind: "merch",
    artistName: row.merch_products?.artists?.name ?? "",
    itemTitle: row.merch_products?.title ?? "(삭제된 상품)",
    orderNumber: row.order_number,
    amount: row.amount,
    payoutAmount: row.royalty_amount,
    status: row.status as OrderStatus,
    settledAt: row.settled_at,
    createdAt: row.created_at,
  }));

  return [...artworkOrders, ...merchOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markOrdersSettled(
  kind: "artwork" | "merch",
  ids: string[],
  settled: boolean,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const table = kind === "artwork" ? "orders" : "merch_orders";
  const { error } = await client
    .from(table)
    .update({ settled_at: settled ? new Date().toISOString() : null })
    .in("id", ids);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}

export async function logAdminActivity(
  action: string,
  entityType: string,
  entityId: string | null,
  detail: Record<string, unknown> = {},
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("admin_activity_log")
    .insert({ action, entity_type: entityType, entity_id: entityId, detail: detail as Database["public"]["Tables"]["admin_activity_log"]["Insert"]["detail"] });
  if (error) throw error;
}

export async function getAdminActivityLog(
  client: SupabaseClient<Database> = supabase,
  limit = 100
): Promise<ActivityLogEntry[]> {
  const { data, error } = await client
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    detail: row.detail as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Analytics — revenue trend and top sellers, derived from existing order
// tables (no new aggregate tables needed).
// ---------------------------------------------------------------------------

export interface AdminAnalytics {
  dailyRevenue: { date: string; amount: number }[];
  topArtists: { name: string; amount: number }[];
  topArtworks: { title: string; amount: number }[];
}

export async function getAdminAnalytics(
  client: SupabaseClient<Database> = supabase
): Promise<AdminAnalytics> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [artworkRes, merchRes] = await Promise.all([
    client
      .from("orders")
      .select("amount, created_at, status, artworks ( title, artists ( name ) )")
      .gte("created_at", sinceIso)
      .neq("status", "cancelled")
      .returns<{ amount: number; created_at: string; status: string; artworks: { title: string; artists: { name: string } | null } | null }[]>(),
    client
      .from("merch_orders")
      .select("amount, created_at, status, merch_products ( title, artists ( name ) )")
      .gte("created_at", sinceIso)
      .neq("status", "cancelled")
      .returns<{ amount: number; created_at: string; status: string; merch_products: { title: string; artists: { name: string } | null } | null }[]>(),
  ]);
  if (artworkRes.error) throw artworkRes.error;
  if (merchRes.error) throw merchRes.error;

  const byDay = new Map<string, number>();
  const byArtist = new Map<string, number>();
  const byArtwork = new Map<string, number>();

  for (const row of artworkRes.data) {
    const day = row.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + row.amount);
    const artistName = row.artworks?.artists?.name;
    if (artistName) byArtist.set(artistName, (byArtist.get(artistName) ?? 0) + row.amount);
    const title = row.artworks?.title;
    if (title) byArtwork.set(title, (byArtwork.get(title) ?? 0) + row.amount);
  }
  for (const row of merchRes.data) {
    const day = row.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + row.amount);
    const artistName = row.merch_products?.artists?.name;
    if (artistName) byArtist.set(artistName, (byArtist.get(artistName) ?? 0) + row.amount);
  }

  const dailyRevenue = Array.from(byDay.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const topArtists = Array.from(byArtist.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const topArtworks = Array.from(byArtwork.entries())
    .map(([title, amount]) => ({ title, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return { dailyRevenue, topArtists, topArtworks };
}

export interface JournalPostInput {
  slug: string;
  category: "art-history" | "interview" | "guide" | "news";
  title: string;
  excerpt: string;
  body: string;
  author: string;
  readMinutes: number;
  coverHue: number;
  coverVariant: number;
  coverImageUrl: string | null;
}

export async function createJournalPost(
  input: JournalPostInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("journal_posts").insert({
    slug: input.slug,
    category: input.category,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    author: input.author,
    read_minutes: input.readMinutes,
    cover_hue: input.coverHue,
    cover_variant: input.coverVariant,
    cover_image_url: input.coverImageUrl,
  });
  if (error) throw error;
}

export async function updateJournalPost(
  id: string,
  input: JournalPostInput,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("journal_posts")
    .update({
      slug: input.slug,
      category: input.category,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      author: input.author,
      read_minutes: input.readMinutes,
      cover_hue: input.coverHue,
      cover_variant: input.coverVariant,
      cover_image_url: input.coverImageUrl,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteJournalPost(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("journal_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function getJournalPostById(id: string): Promise<JournalPost | null> {
  const { data, error } = await supabase.from("journal_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toJournalPost(data) : null;
}

export async function getSiteAssets(): Promise<Record<SiteAssetKey, string | null>> {
  const { data, error } = await supabase.from("site_assets").select("key, url");
  if (error) throw error;
  const result: Record<string, string | null> = {};
  for (const row of data) result[row.key] = row.url;
  return result as Record<SiteAssetKey, string | null>;
}

export async function getSiteAsset(key: SiteAssetKey): Promise<string | null> {
  const { data, error } = await supabase.from("site_assets").select("url").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.url ?? null;
}

export async function updateSiteAsset(
  key: SiteAssetKey,
  url: string,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("site_assets")
    .update({ url, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw error;
}

export async function uploadMedia(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export interface AdminDashboardStats {
  artists: number;
  artworks: number;
  merchProducts: number;
  newApplications: number;
  newInquiries: number;
  totalOrders: number;
}

export async function getAdminDashboardStats(
  client: SupabaseClient<Database> = supabase
): Promise<AdminDashboardStats> {
  const [artists, artworks, merchProducts, newApplications, newInquiries, artworkOrders, merchOrders] =
    await Promise.all([
      client.from("artists").select("*", { count: "exact", head: true }),
      client.from("artworks").select("*", { count: "exact", head: true }),
      client.from("merch_products").select("*", { count: "exact", head: true }),
      client
        .from("artist_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "reviewing"]),
      client.from("general_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      client.from("orders").select("*", { count: "exact", head: true }),
      client.from("merch_orders").select("*", { count: "exact", head: true }),
    ]);
  for (const result of [artists, artworks, merchProducts, newApplications, newInquiries, artworkOrders, merchOrders]) {
    if (result.error) throw result.error;
  }
  return {
    artists: artists.count ?? 0,
    artworks: artworks.count ?? 0,
    merchProducts: merchProducts.count ?? 0,
    newApplications: newApplications.count ?? 0,
    newInquiries: newInquiries.count ?? 0,
    totalOrders: (artworkOrders.count ?? 0) + (merchOrders.count ?? 0),
  };
}

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type CustomerNotificationRow = Database["public"]["Tables"]["customer_notifications"]["Row"];
type OrderPhoneAggRow = {
  phone: string;
  amount: number;
  created_at: string;
  artworks: { medium_type_code: string } | null;
};
type MerchOrderPhoneAggRow = {
  phone: string;
  amount: number;
  created_at: string;
  merch_products: { category: string } | null;
};

function toCustomer(
  row: CustomerRow,
  agg?: { orderCount: number; totalSpent: number; lastOrderAt: string | null; tagCounts: Map<string, number> }
): Customer {
  const preferenceTags = agg
    ? Array.from(agg.tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag)
    : [];
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    marketingOptIn: row.marketing_opt_in,
    orderCount: agg?.orderCount ?? 0,
    totalSpent: agg?.totalSpent ?? 0,
    lastOrderAt: agg?.lastOrderAt ?? null,
    preferenceTags,
    createdAt: row.created_at,
  };
}

type PhoneAgg = { orderCount: number; totalSpent: number; lastOrderAt: string | null; tagCounts: Map<string, number> };

function bumpPhoneAgg(map: Map<string, PhoneAgg>, phone: string, amount: number, createdAt: string, tag: string | null) {
  if (!phone) return;
  const agg = map.get(phone) ?? { orderCount: 0, totalSpent: 0, lastOrderAt: null, tagCounts: new Map<string, number>() };
  agg.orderCount += 1;
  agg.totalSpent += amount;
  if (!agg.lastOrderAt || createdAt > agg.lastOrderAt) agg.lastOrderAt = createdAt;
  if (tag) agg.tagCounts.set(tag, (agg.tagCounts.get(tag) ?? 0) + 1);
  map.set(phone, agg);
}

/** Admin-only customer directory: every row in `customers`, joined against
 * non-cancelled order history (by phone, since guest checkout is the primary
 * path and there's no real customer-account table) to derive spend totals
 * and "preference" tags (top medium/category by purchase count). */
export async function getCustomers(client: SupabaseClient<Database> = supabase): Promise<Customer[]> {
  const [{ data: customerRows, error }, { data: artworkRows, error: artworkErr }, { data: merchRows, error: merchErr }] =
    await Promise.all([
      client.from("customers").select("*").order("updated_at", { ascending: false }),
      client
        .from("orders")
        .select("phone, amount, created_at, artworks ( medium_type_code )")
        .neq("status", "cancelled")
        .returns<OrderPhoneAggRow[]>(),
      client
        .from("merch_orders")
        .select("phone, amount, created_at, merch_products ( category )")
        .neq("status", "cancelled")
        .returns<MerchOrderPhoneAggRow[]>(),
    ]);
  if (error) throw error;
  if (artworkErr) throw artworkErr;
  if (merchErr) throw merchErr;

  const byPhone = new Map<string, PhoneAgg>();
  for (const row of artworkRows ?? []) {
    const tag = row.artworks?.medium_type_code ? getMediumTypeLabel(row.artworks.medium_type_code) : null;
    bumpPhoneAgg(byPhone, row.phone, row.amount, row.created_at, tag);
  }
  for (const row of merchRows ?? []) {
    const tag = row.merch_products?.category ? getMerchCategoryLabel(row.merch_products.category) : null;
    bumpPhoneAgg(byPhone, row.phone, row.amount, row.created_at, tag);
  }

  return customerRows.map((row) => toCustomer(row, byPhone.get(row.phone)));
}

export interface CustomerDetail {
  customer: Customer;
  artworkOrders: ArtworkOrder[];
  merchOrders: MerchOrder[];
  notifications: CustomerNotification[];
}

export async function getCustomerDetail(
  id: string,
  client: SupabaseClient<Database> = supabase
): Promise<CustomerDetail | null> {
  const { data: row, error } = await client.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const [artworkOrders, merchOrders, notificationRows] = await Promise.all([
    getArtworkOrdersByPhone(row.phone, client),
    getMerchOrdersByPhone(row.phone),
    client
      .from("customer_notifications")
      .select("*, artworks ( title )")
      .eq("customer_id", id)
      .order("sent_at", { ascending: false })
      .returns<(CustomerNotificationRow & { artworks: { title: string } | null })[]>(),
  ]);
  if (notificationRows.error) throw notificationRows.error;

  const tagCounts = new Map<string, number>();
  for (const o of artworkOrders) {
    // artistName doubles as a rough style signal alongside the medium; keep
    // this simple rather than re-fetching medium_type_code per order.
    tagCounts.set(o.artistName, (tagCounts.get(o.artistName) ?? 0) + 1);
  }
  for (const o of merchOrders) {
    const label = getMerchCategoryLabel(o.productCategory);
    tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
  }
  const nonCancelled = [...artworkOrders, ...merchOrders].filter((o) => o.status !== "cancelled");
  const agg: PhoneAgg = {
    orderCount: nonCancelled.length,
    totalSpent: nonCancelled.reduce((sum, o) => sum + o.amount, 0),
    lastOrderAt:
      [...artworkOrders, ...merchOrders].reduce<string | null>(
        (latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest),
        null
      ) ?? null,
    tagCounts,
  };

  return {
    customer: toCustomer(row, agg),
    artworkOrders,
    merchOrders,
    notifications: (notificationRows.data ?? []).map((n) => ({
      id: n.id,
      customerId: n.customer_id,
      artworkId: n.artwork_id,
      artworkTitle: n.artworks?.title ?? null,
      subject: n.subject,
      sentAt: n.sent_at,
    })),
  };
}

export async function getCustomersByIds(
  ids: string[],
  client: SupabaseClient<Database> = supabase
): Promise<Customer[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client.from("customers").select("*").in("id", ids);
  if (error) throw error;
  return data.map((row) => toCustomer(row));
}

export async function updateCustomerMarketingOptIn(
  id: string,
  optIn: boolean,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client.from("customers").update({ marketing_opt_in: optIn }).eq("id", id);
  if (error) throw error;
}

export async function recordCustomerNotifications(
  customerIds: string[],
  artworkId: string,
  subject: string,
  client: SupabaseClient<Database> = supabase
): Promise<void> {
  const { error } = await client
    .from("customer_notifications")
    .insert(customerIds.map((customerId) => ({ customer_id: customerId, artwork_id: artworkId, subject })));
  if (error) throw error;
}
