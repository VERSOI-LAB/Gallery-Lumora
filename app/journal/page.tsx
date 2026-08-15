import JournalBrowser from "@/components/JournalBrowser";
import { getJournalPosts } from "@/lib/queries";

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-2 font-display text-2xl">Journal</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        미술사, 작가 인터뷰, 컬렉팅 가이드 — 미술을 낯설지 않게 만드는 이야기들.
      </p>
      <JournalBrowser posts={posts} />
    </div>
  );
}
