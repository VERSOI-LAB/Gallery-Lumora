import JournalBrowser from "@/components/JournalBrowser";
import { getJournalPosts } from "@/lib/queries";

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      <h1 className="font-editorial mb-10 text-xl tracking-wide text-ink-soft">Journal</h1>
      <JournalBrowser posts={posts} />
    </div>
  );
}
