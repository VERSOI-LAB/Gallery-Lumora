"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { adminGetActivityLogPage } from "@/lib/adminActions";
import type { ActivityLogEntry } from "@/lib/queries";

const PAGE_SIZE = 50;

const ACTION_LABEL: Record<string, string> = {
  create: "생성",
  update: "수정",
  delete: "삭제",
  review: "심사",
  bulk_update: "일괄 변경",
  mark_settled: "정산 완료 처리",
  unmark_settled: "정산 대기로 되돌림",
};

const ENTITY_LABEL: Record<string, string> = {
  artwork: "작품",
  merch_product: "굿즈 상품",
  merch_variant: "굿즈 옵션",
  artist: "작가",
  artist_application: "작가 지원",
  general_inquiry: "일반 문의",
  artwork_order: "작품 주문",
  merch_order: "굿즈 주문",
  journal_post: "저널 글",
  site_asset: "사이트 미디어",
};

export default function AdminActivityLog({ entries: initial }: { entries: ActivityLogEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initial.length >= PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);

  const entityTypes = useMemo(() => Array.from(new Set(entries.map((e) => e.entityType))), [entries]);
  const filtered = useMemo(
    () => (entityFilter === "all" ? entries : entries.filter((e) => e.entityType === entityFilter)),
    [entries, entityFilter]
  );

  async function applyDateFilter() {
    setLoading(true);
    setError(null);
    try {
      const page = await adminGetActivityLogPage({
        offset: 0,
        limit: PAGE_SIZE,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setEntries(page);
      setHasMore(page.length >= PAGE_SIZE);
    } catch {
      setError("불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const page = await adminGetActivityLogPage({
        offset: entries.length,
        limit: PAGE_SIZE,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setEntries((prev) => [...prev, ...page]);
      setHasMore(page.length >= PAGE_SIZE);
    } catch {
      setError("불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        >
          <option value="all">전체 종류</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {ENTITY_LABEL[t] ?? t}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        />
        <span className="text-sm text-ink-faint">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        />
        <button
          type="button"
          onClick={applyDateFilter}
          disabled={loading}
          className="h-9 border border-line-strong px-3 text-sm text-ink-soft hover:text-ink disabled:opacity-50"
        >
          기간 조회
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-ink-faint">해당 조건의 활동 기록이 없습니다.</p>
      ) : (
        <>
          <div className="divide-y divide-line border-y border-line">
            {filtered.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-ink">{ACTION_LABEL[entry.action] ?? entry.action}</span>
                  <span className="ml-2 text-ink-soft">{ENTITY_LABEL[entry.entityType] ?? entry.entityType}</span>
                  {typeof entry.detail.title === "string" && (
                    <span className="ml-2 truncate text-ink-faint">— {entry.detail.title}</span>
                  )}
                  {typeof entry.detail.name === "string" && (
                    <span className="ml-2 truncate text-ink-faint">— {entry.detail.name}</span>
                  )}
                </div>
                <span className="flex-none text-xs text-ink-faint">{formatDate(entry.createdAt)}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="mt-4 text-xs text-ink-soft hover:text-ink hover:underline disabled:opacity-50"
            >
              {loading ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
