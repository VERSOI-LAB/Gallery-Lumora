import ArtistSalesBrowser from "@/components/ArtistSalesBrowser";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioSalesPage() {
  await getCurrentArtist();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">매출·정산</h1>
      <p className="mb-6 border border-line bg-paper-raised px-4 py-3 text-sm text-ink-soft">
        정산기간: 매월 1일~말일 · 정산일: 익월 15일
      </p>
      <ArtistSalesBrowser />
    </div>
  );
}
