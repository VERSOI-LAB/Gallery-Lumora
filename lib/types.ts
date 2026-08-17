export interface Artist {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  bio: string;
  hue: number;
  avatarUrl: string | null;
  styleTags: string[];
  artistSplitRate: number;
  commission: {
    accepting: boolean;
    media: string[];
    leadTime: string;
    priceRange: string;
  };
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  mediumTypeCode: string;
  size: string;
  year: number;
  price: number;
  sold: boolean;
  merchEnabled: boolean;
  hue: number;
  variant: number;
  imageUrls: string[];
  viewCount: number;
}

export interface JournalPost {
  id: string;
  slug: string;
  category: "art-history" | "interview" | "guide" | "news";
  title: string;
  excerpt: string;
  body: string[];
  coverHue: number;
  coverVariant: number;
  coverImageUrl: string | null;
  author: string;
  readMinutes: number;
  relatedArtistId: string | null;
  relatedArtworkId: string | null;
  relatedMediumCategoryCode: string | null;
  publishedAt: string;
}

export interface MerchProduct {
  id: string;
  slug: string;
  artworkId: string;
  artworkSlug: string;
  artworkTitle: string;
  artistId: string;
  artistSlug: string;
  artistName: string;
  category: string;
  title: string;
  description: string;
  price: number;
  royaltyRate: number;
  fulfillment: "edition" | "made_to_order";
  editionSize: number | null;
  hasVariants: boolean;
  active: boolean;
  hue: number;
  variant: number;
  imageUrls: string[];
  /** Template products (엽서/포스터/캔버스 액자/노트/에코백/머그컵/텀블러/스카프 등)
   * have no fixed artwork — the customer searches for and picks one at
   * purchase time. artworkId/artistId and their derived fields are empty
   * strings for these until an artwork is chosen client-side. */
  isTemplate: boolean;
}

export interface MerchVariant {
  id: string;
  productId: string;
  label: string;
  priceDelta: number;
}

export type OrderStatus = "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export interface ShippingInfo {
  shippingMethod: "parcel" | "freight" | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  courierPhone: string | null;
  vehicleNumber: string | null;
}

export interface MerchOrder extends ShippingInfo {
  id: string;
  orderNumber: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productCategory: string;
  hue: number;
  variant: number;
  imageUrls: string[];
  /** Set only for template-product orders: which artwork the customer picked. */
  selectedArtworkTitle: string | null;
  selectedArtistName: string | null;
  variantLabel: string | null;
  editionNumber: number | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  royaltyAmount: number;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  role: "individual" | "company" | "artist";
  name: string;
  phone: string;
  email: string;
  username: string;
  artistId: string | null;
}

export interface CommissionInquiry {
  id: string;
  artistId: string;
  collectorName: string;
  summary: string;
  message: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: "new" | "reviewing" | "coordinating" | "accepted" | "declined";
}

export interface MyCommissionInquiry {
  id: string;
  artistName: string;
  artistSlug: string;
  status: "new" | "reviewing" | "coordinating" | "accepted" | "declined";
  medium: string;
  size: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  message: string;
  createdAt: string;
}

export interface ArtistApplication {
  id: string;
  artistName: string;
  nameEn: string;
  tagline: string;
  bio: string;
  styleTags: string[];
  commissionMedia: string[];
  portfolioUrl: string;
  sampleArtworkTitle: string;
  sampleArtworkNote: string;
  artworkImageUrls: string[];
  name: string;
  phone: string;
  email: string;
  message: string;
  status: "new" | "reviewing" | "accepted" | "declined";
  createdAt: string;
}

export interface GeneralInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: "general" | "consulting" | "other";
  message: string;
  status: "new" | "reviewing" | "done";
  createdAt: string;
}

export interface ArtworkOrder extends ShippingInfo {
  id: string;
  orderNumber: string;
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  imageUrls: string[];
  hue: number;
  variant: number;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
  insured: boolean;
  amount: number;
  artistPayoutAmount: number | null;
  status: OrderStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email: string;
  marketingOptIn: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  preferenceTags: string[];
  createdAt: string;
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  artworkId: string | null;
  artworkTitle: string | null;
  subject: string;
  sentAt: string;
}

export type SiteAssetKey =
  | "home_hero_video"
  | "about_hero_video"
  | "exhibition_main_image"
  | "shop_main_image";
