import AdminOrdersBrowser from "@/components/AdminOrdersBrowser";
import { getAllArtworkOrders, getAllMerchOrders } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminOrdersPage() {
  const [artworkOrders, merchOrders] = await Promise.all([
    getAllArtworkOrders(supabaseService),
    getAllMerchOrders(supabaseService),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">주문 현황</h1>
      <AdminOrdersBrowser artworkOrders={artworkOrders} merchOrders={merchOrders} />
    </div>
  );
}
