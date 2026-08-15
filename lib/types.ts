export interface Artist {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  bio: string;
  hue: number;
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
