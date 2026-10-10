import { notFound } from "next/navigation";
import AdminOrderDetail from "@/components/AdminOrderDetail";
import { getMerchOrderById, getArtworkOrdersByPhone, getMerchOrdersByPhone, getOrderStaffNote } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";
import { getRefundableOrder } from "@/lib/refund";

export default async function AdminMerchOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getMerchOrderById(id, supabaseService);
  if (!order) notFound();

  const [customerArtworkOrders, customerMerchOrders, staffNote, refundInfo] = await Promise.all([
    getArtworkOrdersByPhone(order.phone, supabaseService),
    getMerchOrdersByPhone(order.phone, supabaseService),
    getOrderStaffNote("merch", id, supabaseService),
    getRefundableOrder("merch", id),
  ]);

  return (
    <AdminOrderDetail
      kind="merch"
      order={order}
      customerArtworkOrders={customerArtworkOrders}
      customerMerchOrders={customerMerchOrders}
      staffNote={staffNote}
      refundedAt={refundInfo?.refundedAt ?? null}
    />
  );
}
