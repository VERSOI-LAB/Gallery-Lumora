import Link from "next/link";
import MyOrdersBrowser from "@/components/MyOrdersBrowser";

export default function MyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="font-display text-2xl">마이페이지</h1>
        <Link href="/mypage/wishlist" className="text-xs text-ink-soft hover:text-ink">
          찜한 목록 →
        </Link>
      </div>
      <p className="mb-8 text-sm text-ink-faint">
        로그인하셨다면 계정에 연결된 주문내역이 자동으로 표시됩니다. 게스트라면 주문 시 입력한
        연락처로 굿즈 주문내역을 조회하세요.
      </p>
      <MyOrdersBrowser />
    </div>
  );
}
