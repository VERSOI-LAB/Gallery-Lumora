import AdminNav from "@/components/AdminNav";

// 어드민은 인증된 실시간 운영 데이터를 보여주는 화면이라 정적 프리렌더링 대상이 아님.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl px-5 md:px-8">
      <AdminNav />
      <div className="min-w-0 flex-1 py-8 pb-24 md:pl-8 md:pb-8">{children}</div>
    </div>
  );
}
