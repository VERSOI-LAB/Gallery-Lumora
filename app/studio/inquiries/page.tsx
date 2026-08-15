import { notFound } from "next/navigation";
import StudioInquiriesBrowser from "@/components/StudioInquiriesBrowser";
import { getArtist, getStudioInquiries } from "@/lib/queries";
import { CURRENT_ARTIST_SLUG } from "@/lib/constants";

export default async function StudioInquiriesPage() {
  const artist = await getArtist(CURRENT_ARTIST_SLUG);
  if (!artist) notFound();
  const inquiries = await getStudioInquiries(artist.id);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">커미션 요청함</h1>
      <StudioInquiriesBrowser inquiries={inquiries} />
    </div>
  );
}
