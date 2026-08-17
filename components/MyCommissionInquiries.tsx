"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getMyCommissionInquiries } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { MyCommissionInquiry } from "@/lib/types";

const STATUS_LABEL: Record<MyCommissionInquiry["status"], string> = {
  new: "접수됨",
  reviewing: "검토중",
  coordinating: "운영팀 조율중",
  accepted: "수락됨",
  declined: "거절됨",
};

const STATUS_STYLE: Record<MyCommissionInquiry["status"], string> = {
  new: "border-line-strong text-ink-soft",
  reviewing: "border-patina text-patina",
  coordinating: "border-patina text-patina",
  accepted: "border-patina bg-patina text-paper",
  declined: "border-line-strong text-ink-faint line-through",
};

export default function MyCommissionInquiries() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [inquiries, setInquiries] = useState<MyCommissionInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    getMyCommissionInquiries()
      .then(setInquiries)
      .catch(() => setError("커미션 요청을 불러오지 못했습니다."));
  }, [loggedIn]);

  if (!loggedIn) return null;
  if (error) return <p className="text-xs text-red-600">{error}</p>;
  if (inquiries === null) return <p className="text-sm text-ink-faint">불러오는 중...</p>;
  if (inquiries.length === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-8">
      <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">내 커미션 요청</p>
      <ul className="space-y-4">
        {inquiries.map((inquiry) => (
          <li key={inquiry.id} className="border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/artists/${inquiry.artistSlug}`}
                  className="block truncate text-sm font-semibold text-ink hover:underline"
                >
                  {inquiry.artistName}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-faint">{inquiry.message}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-faint">{formatDate(inquiry.createdAt)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span className={`border px-1.5 py-0.5 text-[10px] ${STATUS_STYLE[inquiry.status]}`}>
                {STATUS_LABEL[inquiry.status]}
              </span>
              {inquiry.budgetMin && inquiry.budgetMax && (
                <span>
                  {(inquiry.budgetMin / 10000).toFixed(0)}만~{(inquiry.budgetMax / 10000).toFixed(0)}만원
                </span>
              )}
              {inquiry.timeline && <span>희망 {inquiry.timeline}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
