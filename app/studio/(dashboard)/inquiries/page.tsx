import StudioInquiriesBrowser from "@/components/StudioInquiriesBrowser";
import CommissionAvailabilityForm from "@/components/CommissionAvailabilityForm";
import { getStudioInquiries } from "@/lib/queries";
import { getCurrentArtist } from "@/lib/studioAuth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function StudioInquiriesPage() {
  const artist = await getCurrentArtist();
  const client = await createServerSupabaseClient();
  const inquiries = await getStudioInquiries(artist.id, client);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">커미션 요청함</h1>
      <CommissionAvailabilityForm artist={artist} />
      <StudioInquiriesBrowser inquiries={inquiries} />
    </div>
  );
}
