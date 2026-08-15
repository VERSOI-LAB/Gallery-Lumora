import MyOrdersBrowser from "@/components/MyOrdersBrowser";

export default function MyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <h1 className="mb-2 font-display text-2xl">마이페이지</h1>
      <p className="mb-8 text-sm text-ink-faint">
        아직 회원 로그인은 지원하지 않습니다. 주문 시 입력한 연락처로 굿즈 주문내역을 조회하세요.
      </p>
      <MyOrdersBrowser />
    </div>
  );
}
