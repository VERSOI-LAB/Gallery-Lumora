import ShopBrowser from "@/components/ShopBrowser";
import { getMerchProducts } from "@/lib/queries";

export default async function ShopPage() {
  const products = await getMerchProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-2 font-display text-2xl">Shop</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        원작을 기반으로 만든 프린트와 생활용품 — 판매 수익의 일부는 작가에게 로열티로 전달됩니다.
      </p>
      <ShopBrowser products={products} />
    </div>
  );
}
