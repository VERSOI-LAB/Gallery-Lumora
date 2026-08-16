import AdminOrdersBrowser from "@/components/AdminOrdersBrowser";
import { getAllArtworkOrders, getAllMerchOrders } from "@/lib/queries";

export default async function AdminOrdersPage() {
  const [artworkOrders, merchOrders] = await Promise.all([getAllArtworkOrders(), getAllMerchOrders()]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">주문 현황</h1>
      <AdminOrdersBrowser artworkOrders={artworkOrders} merchOrders={merchOrders} />
    </div>
  );
}
