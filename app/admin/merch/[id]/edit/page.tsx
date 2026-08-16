import { notFound } from "next/navigation";
import AdminMerchForm from "@/components/AdminMerchForm";
import AdminMerchVariantsManager from "@/components/AdminMerchVariantsManager";
import { getMerchProductByIdAdmin, getMerchVariants } from "@/lib/queries";

export default async function AdminEditMerchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getMerchProductByIdAdmin(id);
  if (!product) notFound();
  const variants = product.hasVariants ? await getMerchVariants(product.id) : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">굿즈 상품 수정</h1>
      <AdminMerchForm product={product} />
      {product.hasVariants && (
        <div className="max-w-2xl">
          <AdminMerchVariantsManager productId={product.id} variants={variants} />
        </div>
      )}
    </div>
  );
}
