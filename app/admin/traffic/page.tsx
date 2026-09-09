import { formatDate } from "@/lib/format";
import { getReferralStats, getReferralVisits, type ReferralSource } from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

const SOURCE_LABEL: Record<ReferralSource, string> = {
  youtube: "유튜브",
  instagram: "인스타그램",
  facebook: "페이스북",
  other: "기타",
};

export const dynamic = "force-dynamic";

export default async function AdminTrafficPage() {
  const [stats, visits] = await Promise.all([
    getReferralStats(supabaseService, 30),
    getReferralVisits(supabaseService, { limit: 50 }),
  ]);
  const maxCount = Math.max(1, ...stats.bySource.map((s) => s.count));

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl">유입경로</h1>
      <p className="mb-6 text-sm text-ink-soft">
        헤더의 유튜브·인스타그램·페이스북 링크를 통해 방문자가 유입되면, 브라우저의 리퍼러 정보를
        기준으로 최초 방문 1건이 기록됩니다.
      </p>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">최근 30일 유입 경로 ({stats.total}건)</h2>
        {stats.total === 0 ? (
          <p className="text-sm text-ink-faint">최근 30일 내 외부 유입 기록이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {stats.bySource.map((s) => (
              <li key={s.source} className="text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-ink">{SOURCE_LABEL[s.source]}</span>
                  <span className="text-ink-soft">{s.count}건</span>
                </div>
                <div className="h-1.5 bg-paper-raised">
                  <div className="h-full bg-ink" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink">최근 유입 기록</h2>
        {visits.length === 0 ? (
          <p className="text-sm text-ink-faint">아직 기록된 유입이 없습니다.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {visits.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-ink">{SOURCE_LABEL[v.source]}</span>
                  <span className="ml-2 truncate text-ink-faint">→ {v.landingPath}</span>
                </div>
                <span className="flex-none text-xs text-ink-faint">{formatDate(v.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
