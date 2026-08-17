import { notFound } from "next/navigation";
import AdminCustomerDetail from "@/components/AdminCustomerDetail";
import { getCustomerDetail } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCustomerDetail(id, supabaseService);
  if (!detail) notFound();

  return <AdminCustomerDetail detail={detail} />;
}
