import { notFound } from "next/navigation";
import AdminArtworkForm from "@/components/AdminArtworkForm";
import { getArtworkById } from "@/lib/queries";

export default async function AdminEditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = await getArtworkById(id);
  if (!artwork) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작품 수정</h1>
      <AdminArtworkForm artwork={artwork} />
    </div>
  );
}
