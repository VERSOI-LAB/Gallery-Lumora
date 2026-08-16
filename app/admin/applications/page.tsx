import AdminApplicationsBrowser from "@/components/AdminApplicationsBrowser";
import { getArtistApplications } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminApplicationsPage() {
  const applications = await getArtistApplications(supabaseService);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작가 지원</h1>
      <AdminApplicationsBrowser applications={applications} />
    </div>
  );
}
