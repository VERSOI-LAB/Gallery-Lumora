import Link from "next/link";
import { buttonClasses } from "@/lib/ui";

export default function StudioPendingPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24 text-center md:px-0">
      <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">승인 대기중</p>
      <h1 className="mb-4 font-display text-2xl">아직 작가 승인 전입니다</h1>
      <p className="mb-8 text-sm leading-7 text-ink-soft">
        작가 지원을 아직 하지 않으셨거나, 운영팀 심사가 진행 중입니다. 승인이 완료되면 이 계정으로 스튜디오에
        접속할 수 있어요.
      </p>
      <Link href="/commission" className={buttonClasses("primary")}>
        작가 지원하러 가기
      </Link>
    </div>
  );
}
