import { supabase } from "./supabase";
import type { Database } from "./database.types";
import type { Artist, Artwork, CommissionInquiry, JournalPost, MerchProduct, MerchVariant } from "./types";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ArtworkRow = Database["public"]["Tables"]["artworks"]["Row"];
type InquiryRow = Database["public"]["Tables"]["commission_inquiries"]["Row"];
type JournalRow = Database["public"]["Tables"]["journal_posts"]["Row"];
type MerchProductRow = Database["public"]["Tables"]["merch_products"]["Row"];
type MerchVariantRow = Database["public"]["Tables"]["merch_variants"]["Row"];
type ArtworkWithArtistRow = ArtworkRow & { artists: { name: string } | null };
type MerchProductWithRelationsRow = MerchProductRow & {
  artworks: { slug: string; title: string } | null;
  artists: { slug: string; name: string } | null;
};

const ARTWORK_WITH_ARTIST_SELECT = "*, artists ( name )";
const MERCH_PRODUCT_SELECT = "*, artworks ( slug, title ), artists ( slug, name )";

function toArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    tagline: row.tagline,
    bio: row.bio,
    hue: row.hue,
    styleTags: row.style_tags,
    commission: {
      accepting: row.commission_accepting,
      media: row.commission_media,
      leadTime: row.commission_lead_time,
      priceRange: row.commission_price_range,
    },
  };
}

function toArtwork(row: ArtworkWithArtistRow): Artwork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
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

function toJournalPost(row: JournalRow): JournalPost {
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
    author: row.author,
    readMinutes: row.read_minutes,
    relatedArtistId: row.related_artist_id,
    relatedArtworkId: row.related_artwork_id,
    relatedMediumCategoryCode: row.related_medium_category_code,
    publishedAt: row.published_at,
  };
}

function toMerchProduct(row: MerchProductWithRelationsRow): MerchProduct {
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
    stockQuantity: row.stock_quantity,
    hasVariants: row.has_variants,
    active: row.active,
    hue: row.cover_hue,
    variant: row.cover_variant,
  };
}

function toMerchVariant(row: MerchVariantRow): MerchVariant {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    stockQuantity: row.stock_quantity,
    priceDelta: row.price_delta,
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

export async function getArtistById(id: string): Promise<Artist | null> {
  const { data, error } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toArtist(data) : null;
}

export async function getArtistSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("artists").select("slug");
  if (error) throw error;
  return data.map((r) => r.slug);
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

export async function getStudioInquiries(artistId: string): Promise<CommissionInquiry[]> {
  const { data, error } = await supabase
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
  paymentMethod: string;
  insured: boolean;
}

export async function purchaseArtwork(
  input: PurchaseInput
): Promise<{ orderNumber: string; amount: number }> {
  const { data, error } = await supabase.rpc("purchase_artwork", {
    p_artwork_id: input.artworkId,
    p_shipping_address: input.shippingAddress,
    p_phone: input.phone,
    p_payment_method: input.paymentMethod,
    p_insured: input.insured,
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
  mediumTypeCode: string;
  size: string;
  year: number;
  price: number;
  hue: number;
}

export async function createArtwork(input: NewArtworkInput): Promise<void> {
  const { error } = await supabase.from("artworks").insert({
    slug: slugify(input.title),
    title: input.title,
    artist_id: input.artistId,
    medium_type_code: input.mediumTypeCode,
    size: input.size,
    year: input.year,
    price: input.price,
    hue: input.hue,
    variant: Math.floor(Math.random() * 3),
  });
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

export async function getMerchProductSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("merch_products").select("slug").eq("active", true);
  if (error) throw error;
  return data.map((r) => r.slug);
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
  paymentMethod: string;
}

export async function purchaseMerch(
  input: MerchPurchaseInput
): Promise<{ orderNumber: string; amount: number }> {
  const { data, error } = await supabase.rpc("purchase_merch", {
    p_product_id: input.productId,
    p_variant_id: input.variantId,
    p_quantity: input.quantity,
    p_shipping_address: input.shippingAddress,
    p_phone: input.phone,
    p_payment_method: input.paymentMethod,
  });
  if (error) throw error;
  const row = data[0];
  return { orderNumber: row.order_number, amount: row.amount };
}
