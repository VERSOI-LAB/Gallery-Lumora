import Link from "next/link";
import AdminJournalList from "@/components/AdminJournalList";
import { buttonClasses } from "@/lib/ui";
import { getJournalPosts } from "@/lib/queries";

export default async function AdminJournalPage() {
  const posts = await getJournalPosts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl">저널 관리</h1>
        <Link href="/admin/journal/new" className={buttonClasses("primary", "sm")}>
          새 글 작성
        </Link>
      </div>
      <AdminJournalList posts={posts} />
    </div>
  );
}
