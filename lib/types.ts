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
  fulfillment: "edition" | "stock";
  editionSize: number | null;
  stockQuantity: number | null;
  hasVariants: boolean;
  active: boolean;
  hue: number;
  variant: number;
}

export interface MerchVariant {
  id: string;
  productId: string;
  label: string;
  stockQuantity: number;
  priceDelta: number;
}

export type OrderStatus = "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export interface MerchOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productCategory: string;
  hue: number;
  variant: number;
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

export interface ArtworkOrder {
  id: string;
  orderNumber: string;
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  paymentMethod: string;
  insured: boolean;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export type SiteAssetKey =
  | "home_hero_video"
  | "about_hero_video"
  | "exhibition_main_image"
  | "shop_main_image";
