import ContactTabs from "@/components/ContactTabs";
import FadeInOnScroll from "@/components/FadeInOnScroll";

const ASSURANCES = [
  {
    number: "01",
    title: "빠른 회신",
    body: "접수된 문의는 Lumora 운영팀이 확인 후 1~3영업일 내 직접 답변드립니다.",
  },
  {
    number: "02",
    title: "맞춤 컨설팅",
    body: "공간과 취향에 맞는 작가와 작품을 큐레이터가 함께 제안합니다.",
  },
  {
    number: "03",
    title: "투명한 절차",
    body: "작가 등록부터 커미션 진행까지, 모든 과정을 명확하게 안내합니다.",
  },
];

export default function CommissionLandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
        <FadeInOnScroll className="md:sticky md:top-24 md:self-start">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-patina uppercase">
            Get in touch
          </p>
          <h1 className="font-editorial mb-6 text-2xl tracking-wide text-ink md:text-3xl">Contact</h1>
          <p className="mb-10 max-w-sm text-sm leading-7 text-ink-soft">
            작품 문의부터 공간 컨설팅, 작가 등록까지 — 무엇이든 편하게 남겨주세요. Lumora 운영팀이
            확인 후 가장 알맞은 방법으로 연락드립니다.
          </p>
          <div className="space-y-7">
            {ASSURANCES.map((a) => (
              <div key={a.number} className="flex gap-4">
                <span className="font-editorial text-lg font-light text-gold">{a.number}</span>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-ink">{a.title}</h3>
                  <p className="max-w-xs text-xs leading-6 text-ink-faint">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll delay={150}>
          <ContactTabs />
        </FadeInOnScroll>
      </div>
    </div>
  );
}
