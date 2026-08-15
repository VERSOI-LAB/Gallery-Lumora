import ShopBrowser from "@/components/ShopBrowser";
import { getMerchProducts } from "@/lib/queries";

export default async function ShopPage() {
  const products = await getMerchProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-2 text-2xl">Shop</h1>
      <p className="mb-2 max-w-lg text-sm text-ink-soft">
        곁에 두고 매일 마주할 수 있는 작은 예술.
        <br />
        이 작은 물건 하나에도,
        <br />
        작가의 손끝이 스며 있습니다.
      </p>
      <p className="mb-8 max-w-lg text-xs text-ink-faint">
        판매 수익의 일부는 작가에게 로열티로 전달됩니다.
      </p>
      <ShopBrowser products={products} />
    </div>
  );
}
