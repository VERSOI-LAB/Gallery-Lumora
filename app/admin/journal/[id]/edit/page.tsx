import { notFound } from "next/navigation";
import AdminJournalForm from "@/components/AdminJournalForm";
import { getJournalPostById } from "@/lib/queries";

export default async function AdminEditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getJournalPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">저널 글 수정</h1>
      <AdminJournalForm post={post} />
    </div>
  );
}
