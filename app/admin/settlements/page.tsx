import AdminSettlementsBrowser from "@/components/AdminSettlementsBrowser";
import { getAdminSettlementOrders } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminSettlementsPage() {
  const orders = await getAdminSettlementOrders(supabaseService);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">정산 관리</h1>
      <p className="mb-6 text-sm text-ink-soft">
        굿즈는 상품별 로열티율로 계산된 정산액을 그대로 보여줍니다. 작품(원화) 판매는 갤러리
        수수료율이 별도로 정해져 있지 않아 수수료 차감 전 총 판매액만 표시합니다.
      </p>
      <AdminSettlementsBrowser orders={orders} />
    </div>
  );
}
