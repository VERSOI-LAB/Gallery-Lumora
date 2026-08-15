import JournalBrowser from "@/components/JournalBrowser";
import { getJournalPosts } from "@/lib/queries";

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-2 text-2xl">Journal</h1>
      <p className="mb-8 max-w-lg text-sm text-ink-soft">
        미술사와 작가의 목소리,
        <br />
        컬렉팅의 이야기들 — 예술이 조금 더 가까워지는 시간.
      </p>
      <JournalBrowser posts={posts} />
    </div>
  );
}
