import StudioNav from "@/components/StudioNav";
import { getCurrentArtist } from "@/lib/studioAuth";
import { getStudioInquiries } from "@/lib/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const artist = await getCurrentArtist();
  const client = await createServerSupabaseClient();
  const inquiries = await getStudioInquiries(artist.id, client);
  const newInquiryCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="mx-auto flex max-w-6xl px-5 md:px-8">
      <StudioNav artistName={artist.name} newInquiryCount={newInquiryCount} />
      <div className="min-w-0 flex-1 py-8 pb-24 md:pl-8 md:pb-8">{children}</div>
    </div>
  );
}
