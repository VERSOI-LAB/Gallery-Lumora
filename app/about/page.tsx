import FadeInOnScroll from "@/components/FadeInOnScroll";

const CORE_VALUES = [
  {
    number: "01",
    tagEn: "For Artists",
    tagKo: "작가를 향한 존중",
    quote: "당신의 고뇌와 열정이 세상에서 가장 빛나는 가치가 되도록.",
    body: "루모라는 단순히 작품을 전시하는 공간이 아닙니다. 작가가 지닌 고유의 서사와 가능성을 미술사적 관점에서 재조명하고, 당신의 예술이 가장 정당하고 눈부시게 빛날 수 있는 무대를 만듭니다.",
  },
  {
    number: "02",
    tagEn: "For Spaces & Clients",
    tagKo: "공간과 고객을 향한 울림",
    quote: "기업의 로비부터 삶의 가장 사적인 거실까지, 영혼을 품는 공간의 완성.",
    body: "1:1 맞춤 주문제작(Commission)을 통해, 취향을 넘어 당신과 기업의 철학을 대변하는 단 하나의 마스터피스를 제안합니다. 매일 만나는 작품을 통해 삶과 공간의 격을 높이고, 세월이 흘러도 변하지 않는 감동을 선사합니다.",
  },
  {
    number: "03",
    tagEn: "For the Future of Art",
    tagKo: "예술의 미래를 향한 책임",
    quote: "과거의 역사를 배우고, 현재를 기록하며, 미래로 보존될 가치를 만듭니다.",
    body: "미술사를 통찰하는 깊은 시선으로, 10년, 50년 후에도 가치를 인정받을 예술을 엄선하고 발굴합니다. 루모라와 함께하는 모든 선택은 예술의 역사를 지키고 확장하는 위대한 여정이 됩니다.",
  },
];

function Gold({ children }: { children: React.ReactNode }) {
  return <span className="text-[#d1a355]">{children}</span>;
}

export default function AboutPage() {
  return (
    <div>
      <video
        src="/videos/about-hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="block h-auto w-full border-b border-line"
      />

      {/* Brand story — dark section */}
      <div className="bg-[#0d1117]">
        {/* 1. Header & Slogan */}
        <FadeInOnScroll className="mx-auto max-w-2xl px-5 pt-20 pb-14 text-center md:px-8 md:pt-28 md:pb-20">
          <h1 className="font-editorial text-xl tracking-wide text-[#e8e6e0]">About</h1>
        </FadeInOnScroll>

        {/* 2. Main Manifesto */}
        <FadeInOnScroll
          delay={150}
          className="mx-auto max-w-2xl px-5 pb-20 text-center md:px-8 md:pb-28"
        >
          <div className="space-y-6 text-sm leading-8 text-[#c9c4b8] md:text-base md:leading-9">
            <p>예술은 단순히 벽을 장식하는 유행이 아닙니다.</p>
            <p>
              과거 르네상스 시절, <Gold>메디치 가문</Gold>의 위대한 의뢰가 거장들의 천재성을 세상에
              끌어내고
              <br />
              인류의 유산을 만들어냈듯, 예술은 시대를 뛰어넘어 인간의 영혼과 공간을 변화시키는
              가장&nbsp;강력한&nbsp;힘입니다.
            </p>
            <p>
              갤러리 루모라(Lumora)는 미술의 역사 속에 숨쉬는 <Gold>변치 않는 가치</Gold>를 믿습니다.
              우리는
              <br />
              시대를 조용히 탐구하며 자신만의 독창적인 세계를 구축해 나가는 작가들의 고유한
              가치와&nbsp;가능성을&nbsp;발굴합니다.
            </p>
            <p>
              한 점의 작품이 만들어지기까지의 고뇌, 그리고 그 안에 담긴 <Gold>무한한 미래의 가능성</Gold>.
            </p>
            <p>
              루모라는 작가의 진정한 가치를 재평가하고, 과거의 지혜와 현재의 감성,
              <br />
              그리고 미래의 유산을 잇는 든든한 다리가 되고자 합니다.
            </p>
          </div>
        </FadeInOnScroll>

        {/* 3. Core Values */}
        <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CORE_VALUES.map((v, i) => (
              <FadeInOnScroll key={v.number} delay={i * 150} className="h-full">
                <div className="group h-full border border-[#262c35] bg-[#161B22] p-8 transition-all duration-300 hover:border-[#d1a355]/60 hover:shadow-[0_0_28px_rgba(209,163,85,0.18)]">
                  <div className="mb-6 text-2xl font-extralight tracking-wide text-[#d1a355]">
                    {v.number}
                  </div>
                  <div className="mb-1 text-[11px] font-semibold tracking-[0.15em] text-[#8a8471] uppercase">
                    {v.tagEn}
                  </div>
                  <h3 className="font-editorial mb-4 text-lg text-[#e8e6e0]">{v.tagKo}</h3>
                  <p className="font-editorial mb-4 text-sm leading-7 text-[#d1a355] italic">
                    &ldquo;{v.quote}&rdquo;
                  </p>
                  <p className="text-xs leading-6 text-[#9a9488]">{v.body}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>

        {/* 4. Closing & Call to Action */}
        <FadeInOnScroll className="mx-auto max-w-2xl px-5 pb-24 text-center md:px-8 md:pb-32">
          <p className="mb-6 text-sm leading-8 text-[#c9c4b8] md:text-base">
            빛을 발하지 못한 위대한 예술은 없습니다.
            <br />
            단지 그 빛을 알아보는 눈을 기다릴 뿐입니다.
          </p>
          <p className="mb-8 text-sm leading-8 text-[#c9c4b8] md:text-base">
            작가에게는 창작의 숭고함이 인정받는 곳,
            <br />
            기업과 개인에게는 영혼을 울리는 예술을 소장하는 기쁨이 시작되는 곳.
          </p>
          <p className="font-editorial text-lg text-[#e8e6e0] md:text-xl">
            시대를 잇는 예술의 빛,
            <br />
            당신의 공간에 피어나는 단 하나의 마스터피스.
          </p>
        </FadeInOnScroll>
      </div>
    </div>
  );
}
