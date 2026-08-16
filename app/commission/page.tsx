import ContactTabs from "@/components/ContactTabs";
import FadeInOnScroll from "@/components/FadeInOnScroll";

const ASSURANCES = [
  {
    number: "01",
    title: "정성 어린 회신",
    body: "남겨주신 마음과 공간의 이야기를 세심히 정독한 뒤,\n1~2영업일 내에 정성스러운 답변을 전합니다.",
  },
  {
    number: "02",
    title: "섬세한 제안",
    body: "갤러리 큐레이터가 기업 사옥의 웅장함부터 개인 공간의 온기까지 고려하여\n가장 매끄럽게 스며들 작품과 작가를 제안합니다.",
  },
  {
    number: "03",
    title: "작가와 컬렉터의 투명한 다리",
    body: "작가의 창작 가치가 올바르게 인정받고, 컬렉터에게 안전하게 이어지도록\n모든 1:1 의뢰 과정과 입점 절차를 신뢰 있게 안내합니다.",
  },
];

export default function CommissionLandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
        <FadeInOnScroll className="md:sticky md:top-24 md:self-start">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-patina uppercase">
            Connect with Lumora
          </p>
          <h1 className="font-editorial mb-6 text-2xl tracking-wide text-ink md:text-3xl">Contact</h1>
          <p className="mb-10 max-w-sm text-sm leading-7 text-ink-soft">
            공간에 어울리는 예술을 찾는 컬렉터의 고민부터,
            <br />
            자신만의 시선을 공유하고자 하는 작가님의 이야기까지.
            <br />
            루모라는 예술이 전하는 깊은 울림에 귀를 기울입니다.
            <br />
            전하고 싶으신 마음이나 문의를 남겨주시면 정성을 다해 답변드리겠습니다.
          </p>
          <div className="space-y-7">
            {ASSURANCES.map((a) => (
              <div key={a.number} className="flex gap-4">
                <span className="font-editorial text-lg font-light text-gold">{a.number}</span>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-ink">{a.title}</h3>
                  <p className="max-w-xs text-xs leading-6 whitespace-pre-line text-ink-faint">
                    {a.body}
                  </p>
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
