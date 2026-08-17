import { notFound } from "next/navigation";
import AdminOrderDetail from "@/components/AdminOrderDetail";
import { getMerchOrderById, getArtworkOrdersByPhone, getMerchOrdersByPhone, getOrderStaffNote } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminMerchOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getMerchOrderById(id, supabaseService);
  if (!order) notFound();

  const [customerArtworkOrders, customerMerchOrders, staffNote] = await Promise.all([
    getArtworkOrdersByPhone(order.phone, supabaseService),
    getMerchOrdersByPhone(order.phone),
    getOrderStaffNote("merch", id, supabaseService),
  ]);

  return (
    <AdminOrderDetail
      kind="merch"
      order={order}
      customerArtworkOrders={customerArtworkOrders}
      customerMerchOrders={customerMerchOrders}
      staffNote={staffNote}
    />
  );
}
