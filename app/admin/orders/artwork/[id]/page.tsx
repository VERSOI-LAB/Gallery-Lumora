import { notFound } from "next/navigation";
import AdminOrderDetail from "@/components/AdminOrderDetail";
import { getArtworkOrderById, getArtworkOrdersByPhone, getMerchOrdersByPhone } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminArtworkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getArtworkOrderById(id, supabaseService);
  if (!order) notFound();

  const [customerArtworkOrders, customerMerchOrders] = await Promise.all([
    getArtworkOrdersByPhone(order.phone, supabaseService),
    getMerchOrdersByPhone(order.phone),
  ]);

  return (
    <AdminOrderDetail
      kind="artwork"
      order={order}
      customerArtworkOrders={customerArtworkOrders}
      customerMerchOrders={customerMerchOrders}
    />
  );
}
