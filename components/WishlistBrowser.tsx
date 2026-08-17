"use client";

import { useEffect, useState } from "react";
import ArtworkCard from "./ArtworkCard";
import MerchProductCard from "./MerchProductCard";
import { getMyWishlist } from "@/lib/wishlist";
import type { Artwork, MerchProduct } from "@/lib/types";

export default function WishlistBrowser() {
  const [wishlist, setWishlist] = useState<{ artworks: Artwork[]; products: MerchProduct[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyWishlist()
      .then(setWishlist)
      .catch(() => setError("찜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!wishlist) return <p className="text-sm text-ink-faint">불러오는 중...</p>;
  if (wishlist.artworks.length === 0 && wishlist.products.length === 0) {
    return <p className="text-sm text-ink-faint">아직 찜한 작품·굿즈가 없습니다.</p>;
  }

  return (
    <div className="space-y-10">
      {wishlist.artworks.length > 0 && (
        <div>
          <p className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">찜한 작품</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {wishlist.artworks.map((artwork) => (
              <ArtworkCard key={artwork.slug} artwork={artwork} />
            ))}
          </div>
        </div>
      )}
      {wishlist.products.length > 0 && (
        <div>
          <p className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">찜한 굿즈</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {wishlist.products.map((product) => (
              <MerchProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
