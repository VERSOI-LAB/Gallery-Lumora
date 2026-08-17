import ArtistSalesBrowser from "@/components/ArtistSalesBrowser";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioSalesPage() {
  await getCurrentArtist();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">매출·정산</h1>
      <ArtistSalesBrowser />
    </div>
  );
}
