import AdminActivityLog from "@/components/AdminActivityLog";
import { getAdminActivityLog } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminActivityPage() {
  const entries = await getAdminActivityLog(supabaseService, { limit: 50 });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl">활동 로그</h1>
      <p className="mb-6 text-sm text-ink-soft">
        관리자 계정이 아직 팀 공유 비밀번호 하나뿐이라 “누가” 했는지는 기록되지 않습니다. 개별
        계정이 도입되면 이 로그에도 담당자가 함께 남습니다.
      </p>
      <AdminActivityLog entries={entries} />
    </div>
  );
}
