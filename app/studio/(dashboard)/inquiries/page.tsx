import StudioInquiriesBrowser from "@/components/StudioInquiriesBrowser";
import { getStudioInquiries } from "@/lib/queries";
import { getCurrentArtist } from "@/lib/studioAuth";

export default async function StudioInquiriesPage() {
  const artist = await getCurrentArtist();
  const inquiries = await getStudioInquiries(artist.id);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">커미션 요청함</h1>
      <StudioInquiriesBrowser inquiries={inquiries} />
    </div>
  );
}
