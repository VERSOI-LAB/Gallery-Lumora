import PlaceholderArt from "@/components/PlaceholderArt";

const PILLARS = [
  { tag: "ACQUIRE", title: "완성작 구매", body: "작가가 올린 원작을 즉시 소장" },
  { tag: "COMMISSION", title: "1:1 커미션", body: "같은 화풍으로 나만의 작품 의뢰" },
  { tag: "SHOP", title: "굿즈", body: "원작 기반 프린트·생활용품" },
  { tag: "JOURNAL", title: "저널", body: "미술사·작가 이야기로 배우는 미술" },
];

const PRINCIPLES = [
  {
    label: "작가 심사",
    body: "포트폴리오 검증을 거친 작가만 입점합니다. 등록 즉시 판매되지 않습니다.",
  },
  {
    label: "수수료 구조",
    body: "완성작 판매 15–20%, 커미션 20–25% — 운영 개입 정도에 따라 차등 적용합니다.",
  },
  {
    label: "진품 인증",
    body: "모든 거래 건에 디지털 인증서(QR)를 발급해 소장 이력을 보증합니다.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PlaceholderArt
        hue={96}
        variant={1}
        seed="lumora-about-hero"
        className="h-[220px] w-full border-b border-line md:h-[340px]"
      />

      <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
        <p className="mb-4 text-xs font-semibold tracking-wide text-patina uppercase">About Lumora</p>
        <h1 className="mb-4 font-display text-2xl leading-snug md:text-3xl">
          완성작을 파는 곳이 아니라,
          <br />
          다음 작품을 함께 짓는 곳
        </h1>
        <p className="mb-4 text-sm leading-8 text-ink-soft">
          15세기 메디치 가문은 완성된 그림이 아니라 화가의 화풍을 보고 다음 작품을 주문했습니다.
          Lumora는 이 후원(patronage) 모델을 오늘의 커머스로 옮깁니다.
        </p>
        <p className="text-sm leading-8 text-ink-soft">
          작가는 자신의 작품을 올려 판매하고, 컬렉터는 그 작품을 그대로 소장하거나 같은 화풍으로
          자신만의 한 점을 의뢰할 수 있습니다.
        </p>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <h2 className="mb-1 font-display text-xl">Lumora가 하는 일</h2>
          <p className="mb-8 text-sm text-ink-faint">네 가지 축으로 미술을 잇습니다</p>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.tag} className="border border-line p-5">
                <div className="mb-2 text-[10px] font-semibold tracking-wide text-gold">{p.tag}</div>
                <h3 className="mb-1.5 text-sm font-semibold">{p.title}</h3>
                <p className="text-xs leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
          <h2 className="mb-1 font-display text-xl">운영 원칙</h2>
          <p className="mb-6 text-sm text-ink-faint">신뢰를 위해 공개하는 세 가지</p>
          <dl>
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col gap-1.5 py-4 sm:flex-row sm:gap-6 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <dt className="w-full flex-none text-sm font-semibold sm:w-36">{p.label}</dt>
                <dd className="text-sm leading-7 text-ink-soft">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
          <h2 className="mb-6 font-display text-xl">문의</h2>
          <div className="flex flex-wrap gap-8">
            <div>
              <div className="mb-1.5 text-[10px] tracking-wide text-ink-faint uppercase">이메일</div>
              <div className="text-sm font-semibold">hello@lumora.gallery</div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] tracking-wide text-ink-faint uppercase">
                작가 입점 문의
              </div>
              <div className="text-sm font-semibold">artists@lumora.gallery</div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] tracking-wide text-ink-faint uppercase">운영 시간</div>
              <div className="text-sm font-semibold">평일 10:00–18:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
