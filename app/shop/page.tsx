import ShopBrowser from "@/components/ShopBrowser";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getMerchProducts } from "@/lib/queries";

export default async function ShopPage() {
  const products = await getMerchProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-xl tracking-wide text-ink-soft">Shop</h1>
      <FeaturedProducts products={products.slice(0, 5)} />
      <ShopBrowser products={products} />
    </div>
  );
}
