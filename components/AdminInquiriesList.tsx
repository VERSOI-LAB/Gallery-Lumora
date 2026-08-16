"use client";

import { useMemo, useState } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { updateGeneralInquiryStatus } from "@/lib/queries";
import type { GeneralInquiry } from "@/lib/types";

const CATEGORY_LABEL: Record<GeneralInquiry["category"], string> = {
  general: "일반",
  consulting: "컨설팅",
  other: "기타",
};

const STATUS_LABEL: Record<GeneralInquiry["status"], string> = {
  new: "신규",
  reviewing: "검토중",
  done: "처리완료",
};

const STATUS_STYLE: Record<GeneralInquiry["status"], string> = {
  new: "border-patina text-patina",
  reviewing: "border-line-strong text-ink-soft",
  done: "border-line-strong text-ink-faint line-through",
};

export default function AdminInquiriesList({ inquiries: initial }: { inquiries: GeneralInquiry[] }) {
  const [inquiries, setInquiries] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<GeneralInquiry["status"] | "all">("all");

  async function setStatus(id: string, status: "reviewing" | "done") {
    setPendingId(id);
    try {
      await updateGeneralInquiryStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } finally {
      setPendingId(null);
    }
  }

  const term = keyword.trim().toLowerCase();

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!term) return true;
      return (
        i.name.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.phone.includes(term) ||
        i.message.toLowerCase().includes(term)
      );
    });
  }, [inquiries, statusFilter, term]);

  if (inquiries.length === 0) {
    return <p className="text-sm text-ink-faint">접수된 문의가 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름, 연락처, 이메일, 내용으로 검색"
          className="h-9 min-w-[200px] flex-1 border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as GeneralInquiry["status"] | "all")}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        >
          <option value="all">모든 상태</option>
          <option value="new">신규</option>
          <option value="reviewing">검토중</option>
          <option value="done">처리완료</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((inquiry) => (
        <div key={inquiry.id} className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{inquiry.name || "익명"}</span>
              <span className="border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">
                {CATEGORY_LABEL[inquiry.category]}
              </span>
              <span className={`border px-1.5 py-0.5 text-[10px] ${STATUS_STYLE[inquiry.status]}`}>
                {STATUS_LABEL[inquiry.status]}
              </span>
            </div>
            <span className="text-xs text-ink-faint">{formatDate(inquiry.createdAt)}</span>
          </div>

          <p className="mt-2 text-sm whitespace-pre-wrap text-ink-soft">{inquiry.message}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {inquiry.email} · {inquiry.phone}
          </p>

              {inquiry.status !== "done" && (
                <div className="mt-3 flex gap-3">
                  {inquiry.status === "new" && (
                    <button
                      type="button"
                      disabled={pendingId === inquiry.id}
                      onClick={() => setStatus(inquiry.id, "reviewing")}
                      className={buttonClasses("ghost", "sm")}
                    >
                      검토중으로 표시
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pendingId === inquiry.id}
                    onClick={() => setStatus(inquiry.id, "done")}
                    className={buttonClasses("primary", "sm")}
                  >
                    처리완료로 표시
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
