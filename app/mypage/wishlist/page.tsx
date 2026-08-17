import WishlistBrowser from "@/components/WishlistBrowser";

export default function MyWishlistPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-8 font-display text-2xl">찜한 작품·굿즈</h1>
      <WishlistBrowser />
    </div>
  );
}
