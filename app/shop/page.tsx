import ShopBrowser from "@/components/ShopBrowser";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getMerchProducts, getSiteAsset } from "@/lib/queries";

export default async function ShopPage() {
  const [products, mainImageUrl] = await Promise.all([
    getMerchProducts(),
    getSiteAsset("shop_main_image"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-xl tracking-wide text-ink-soft">Shop</h1>
      <FeaturedProducts products={products.slice(0, 5)} mainImageUrl={mainImageUrl} />
      <ShopBrowser products={products} />
    </div>
  );
}
