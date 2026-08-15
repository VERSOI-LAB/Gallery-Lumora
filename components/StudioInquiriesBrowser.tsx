"use client";

import { useState } from "react";
import { buttonClasses } from "@/lib/ui";
import { updateInquiryStatus } from "@/lib/queries";
import type { CommissionInquiry } from "@/lib/types";

const STATUS_LABEL: Record<CommissionInquiry["status"], string> = {
  new: "신규",
  reviewing: "검토중",
  coordinating: "운영팀 조율중",
  accepted: "수락함",
  declined: "거절함",
};

const STATUS_STYLE: Record<CommissionInquiry["status"], string> = {
  new: "border-patina text-patina",
  reviewing: "border-line-strong text-ink-soft",
  coordinating: "border-line-strong text-ink-soft",
  accepted: "border-patina bg-patina text-paper",
  declined: "border-line-strong text-ink-faint line-through",
};

export default function StudioInquiriesBrowser({
  inquiries: initialInquiries,
}: {
  inquiries: CommissionInquiry[];
}) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [selectedId, setSelectedId] = useState(initialInquiries[0]?.id ?? "");
  const [pending, setPending] = useState<string | null>(null);

  const selected = inquiries.find((i) => i.id === selectedId);

  async function respond(id: string, decision: "accepted" | "declined") {
    setPending(id);
    try {
      await updateInquiryStatus(id, decision);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: decision } : i)));
    } finally {
      setPending(null);
    }
  }

  if (inquiries.length === 0) {
    return <p className="text-sm text-ink-faint">아직 접수된 커미션 문의가 없습니다.</p>;
  }

  return (
    <div>
      <div className="space-y-3">
        {inquiries.map((inquiry) => {
          const active = inquiry.id === selectedId;
          return (
            <button
              key={inquiry.id}
              type="button"
              onClick={() => setSelectedId(inquiry.id)}
              className={`block w-full border px-4 py-3 text-left ${
                active ? "border-patina" : "border-line hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{inquiry.collectorName}</span>
                <span className={`border px-2 py-0.5 text-[10px] ${STATUS_STYLE[inquiry.status]}`}>
                  {STATUS_LABEL[inquiry.status]}
                </span>
              </div>
              <div className="mt-1 text-sm text-ink-soft">{inquiry.summary}</div>
              <div className="mt-1 flex gap-4 text-xs text-ink-faint">
                {inquiry.budgetMin && inquiry.budgetMax && (
                  <span>
                    {(inquiry.budgetMin / 10000).toFixed(0)}만~{(inquiry.budgetMax / 10000).toFixed(0)}만원
                  </span>
                )}
                {inquiry.timeline && <span>희망 {inquiry.timeline}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8 border border-line p-5">
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {selected.collectorName} 님의 요청
          </p>
          <p className="text-sm leading-7 text-ink-soft">&ldquo;{selected.message}&rdquo;</p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={pending === selected.id}
              onClick={() => respond(selected.id, "accepted")}
              className={buttonClasses("primary", "sm")}
            >
              수락 의사 전달
            </button>
            <button
              type="button"
              disabled={pending === selected.id}
              onClick={() => respond(selected.id, "declined")}
              className={buttonClasses("ghost", "sm")}
            >
              거절
            </button>
          </div>

          <p className="mt-4 text-xs text-ink-faint">
            Phase 1: 수락 시 운영팀이 견적·계약을 오프라인으로 진행합니다. 계약서 자동 생성과
            에스크로 결제는 Phase 2에서 지원됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
