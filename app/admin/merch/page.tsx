import Link from "next/link";
import AdminMerchList from "@/components/AdminMerchList";
import { buttonClasses } from "@/lib/ui";
import { getAllMerchProductsAdmin, getMerchEditionsRemainingMap } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminMerchPage() {
  const products = await getAllMerchProductsAdmin(supabaseService);
  const editionProductIds = products.filter((p) => p.fulfillment === "edition").map((p) => p.id);
  const editionsRemaining = await getMerchEditionsRemainingMap(editionProductIds, supabaseService);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl">굿즈 관리</h1>
        <Link href="/admin/merch/new" className={buttonClasses("primary", "sm")}>
          새 상품 등록
        </Link>
      </div>
      <AdminMerchList products={products} editionsRemaining={editionsRemaining} />
    </div>
  );
}
