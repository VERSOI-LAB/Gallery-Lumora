import JournalBrowser from "@/components/JournalBrowser";
import { getJournalPosts } from "@/lib/queries";

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gold uppercase">Journal</p>
      <h1 className="font-editorial mb-4 text-2xl leading-snug md:text-3xl">
        아는 만큼 깊어지는 예술의 울림, 루모라 저널.
      </h1>
      <p className="mb-8 max-w-lg text-sm leading-7 text-ink-soft">
        미술의 역사적 흐름을 이해할 때 비로소 작품이 지닌 참된 가치가 보이기 시작합니다.
      </p>
      <JournalBrowser posts={posts} />
    </div>
  );
}
