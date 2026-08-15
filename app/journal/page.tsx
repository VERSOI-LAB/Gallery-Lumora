import JournalBrowser from "@/components/JournalBrowser";
import { getJournalPosts } from "@/lib/queries";

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="font-editorial mb-8 text-base tracking-wide text-ink-soft">Journal</h1>
      <JournalBrowser posts={posts} />
    </div>
  );
}
