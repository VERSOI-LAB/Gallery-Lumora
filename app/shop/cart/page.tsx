import CartBrowser from "@/components/CartBrowser";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-8 font-display text-2xl">장바구니</h1>
      <CartBrowser />
    </div>
  );
}
