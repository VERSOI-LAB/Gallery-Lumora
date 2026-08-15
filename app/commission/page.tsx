import Link from "next/link";
import { buttonClasses } from "@/lib/ui";

export default function CommissionLandingPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-24">
      <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gold uppercase">Commission</p>
      <h1 className="font-editorial mb-6 text-2xl leading-snug md:text-3xl">
        오직 당신의 공간과 철학을 위해 그려지는 단 하나의 마스터피스.
      </h1>
      <p className="mb-10 text-sm leading-8 text-ink-soft md:text-base">
        르네상스의 가장 훌륭한 후원자의 정신을 회복하듯, 루모라의 작가들이 당신의 이야기와 공간의
        격에 맞춤 작품을 창작합니다. 기업의 상징성을 담은 대형 벽화 작품부터, 개인의 삶을 담는
        가장 특별한 한 점까지 가장 특별한 예술적 경험을 시작하세요.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/artists" className={buttonClasses("primary")}>
          1:1 프라이빗 의뢰 신청하기
        </Link>
        <a href="mailto:hello@lumora.gallery" className={buttonClasses("ghost")}>
          공간 맞춤 컨설팅 문의
        </a>
      </div>
    </div>
  );
}
