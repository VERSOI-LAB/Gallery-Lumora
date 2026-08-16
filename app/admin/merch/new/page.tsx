import AdminMerchForm from "@/components/AdminMerchForm";
import { getArtworks } from "@/lib/queries";

export default async function AdminNewMerchPage() {
  const artworks = await getArtworks();
  const merchEnabledArtworks = artworks.filter((a) => a.merchEnabled);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">새 굿즈 상품 등록</h1>
      {merchEnabledArtworks.length === 0 ? (
        <p className="text-sm text-ink-faint">
          굿즈 제작이 허용된 작품이 없습니다. 스튜디오의 작품 관리에서 먼저 굿즈를 허용해주세요.
        </p>
      ) : (
        <AdminMerchForm artworks={merchEnabledArtworks} />
      )}
    </div>
  );
}
