"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { ActivityLogEntry } from "@/lib/queries";

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

export default function AdminActivityLog({ entries }: { entries: ActivityLogEntry[] }) {
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const entityTypes = useMemo(() => Array.from(new Set(entries.map((e) => e.entityType))), [entries]);
  const filtered = useMemo(
    () => (entityFilter === "all" ? entries : entries.filter((e) => e.entityType === entityFilter)),
    [entries, entityFilter]
  );

  if (entries.length === 0) {
    return <p className="text-sm text-ink-faint">아직 기록된 활동이 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-5">
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
      </div>

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
    </div>
  );
}
