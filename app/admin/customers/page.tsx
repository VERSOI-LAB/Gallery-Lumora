import AdminCustomerList from "@/components/AdminCustomerList";
import { getCustomers, getArtworks } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminCustomersPage() {
  const [customers, artworks] = await Promise.all([getCustomers(supabaseService), getArtworks()]);
  const notifiableArtworks = artworks.filter((a) => !a.sold);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">고객 관리</h1>
      <AdminCustomerList customers={customers} notifiableArtworks={notifiableArtworks} />
    </div>
  );
}
