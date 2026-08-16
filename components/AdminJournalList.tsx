"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { getJournalCategoryLabel } from "@/lib/journalTaxonomy";
import { deleteJournalPost } from "@/lib/queries";
import type { JournalPost } from "@/lib/types";

export default function AdminJournalList({ posts: initial }: { posts: JournalPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    setPendingId(id);
    try {
      await deleteJournalPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setPendingId(null);
    }
  }

  if (posts.length === 0) {
    return <p className="text-sm text-ink-faint">작성된 저널 글이 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-ink">{post.title}</span>
              <span className="flex-none border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                {getJournalCategoryLabel(post.category)}
              </span>
            </div>
            <div className="text-xs text-ink-soft">
              {post.author} · {formatDate(post.publishedAt)}
            </div>
          </div>

          <div className="flex flex-none items-center gap-3">
            <Link href={`/admin/journal/${post.id}/edit`} className={buttonClasses("ghost", "sm")}>
              수정
            </Link>
            <button
              type="button"
              disabled={pendingId === post.id}
              onClick={() => remove(post.id)}
              className="text-xs text-red-600 hover:underline disabled:opacity-40"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
