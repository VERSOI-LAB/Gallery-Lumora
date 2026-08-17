import Link from "next/link";
import { formatDate, formatKRW } from "@/lib/format";
import {
  getAdminDashboardStats,
  getArtistApplications,
  getGeneralInquiries,
  getAdminAnalytics,
} from "@/lib/queries";
import { supabaseService } from "@/lib/supabase/service";

const STAT_CARDS: {
  key: keyof Awaited<ReturnType<typeof getAdminDashboardStats>>;
  label: string;
  href: string;
  emphasize?: boolean;
}[] = [
  { key: "newApplications", label: "신규 작가 지원", href: "/admin/applications", emphasize: true },
  { key: "newInquiries", label: "미확인 문의", href: "/admin/inquiries", emphasize: true },
  { key: "totalOrders", label: "전체 주문", href: "/admin/orders" },
  { key: "artists", label: "등록 작가", href: "/admin/artists" },
  { key: "artworks", label: "등록 작품", href: "/admin/artworks" },
  { key: "merchProducts", label: "굿즈 상품", href: "/admin/merch" },
];

export default async function AdminDashboardPage() {
  const [stats, applications, inquiries, analytics] = await Promise.all([
    getAdminDashboardStats(supabaseService),
    getArtistApplications(supabaseService),
    getGeneralInquiries(supabaseService),
    getAdminAnalytics(supabaseService),
  ]);
  const maxDailyRevenue = Math.max(1, ...analytics.dailyRevenue.map((d) => d.amount));
  const maxTopArtist = Math.max(1, ...analytics.topArtists.map((a) => a.amount));

  const recentApplications = applications.slice(0, 3);
  const recentInquiries = inquiries.slice(0, 3);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">개요</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const value = stats[card.key];
          const flagged = card.emphasize && value > 0;
          return (
            <Link
              key={card.key}
              href={card.href}
              className={`border p-4 transition-colors ${
                flagged ? "border-patina bg-patina-soft" : "border-line hover:border-line-strong"
              }`}
            >
              <div className={`text-2xl font-semibold ${flagged ? "text-patina" : "text-ink"}`}>
                {value}
              </div>
              <div className="mt-1 text-xs text-ink-soft">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">최근 30일 매출 추이</h2>
          {analytics.dailyRevenue.length === 0 ? (
            <p className="text-sm text-ink-faint">최근 30일 내 주문이 없습니다.</p>
          ) : (
            <div className="flex h-24 items-end gap-[2px] border-b border-line">
              {analytics.dailyRevenue.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date} · ${formatKRW(d.amount)}`}
                  className="flex-1 bg-ink"
                  style={{ height: `${Math.max(4, (d.amount / maxDailyRevenue) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">작가별 매출 순위 (최근 30일)</h2>
          {analytics.topArtists.length === 0 ? (
            <p className="text-sm text-ink-faint">최근 30일 내 매출이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {analytics.topArtists.map((a) => (
                <li key={a.name} className="text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-ink">{a.name}</span>
                    <span className="text-ink-soft">{formatKRW(a.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-paper-raised">
                    <div className="h-full bg-ink" style={{ width: `${(a.amount / maxTopArtist) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">최근 작가 지원</h2>
            <Link href="/admin/applications" className="text-xs text-ink-soft hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-ink-faint">접수된 작가 지원이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {recentApplications.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-ink">{a.artistName || a.name}</span>
                  <span className="text-xs text-ink-faint">{formatDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">최근 문의</h2>
            <Link href="/admin/inquiries" className="text-xs text-ink-soft hover:text-ink">
              전체 보기 →
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-ink-faint">접수된 문의가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {recentInquiries.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-ink">{i.name || "익명"}</span>
                  <span className="text-xs text-ink-faint">{formatDate(i.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
