import ShopBrowser from "@/components/ShopBrowser";
import { getMerchProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getMerchProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      <h1 className="font-editorial mb-10 text-xl tracking-wide text-ink-soft">Shop</h1>
      <ShopBrowser products={products} />
    </div>
  );
}
