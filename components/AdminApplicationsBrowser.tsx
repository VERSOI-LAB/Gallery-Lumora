"use client";

import { useState } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { reviewArtistApplication } from "@/lib/queries";
import type { ArtistApplication } from "@/lib/types";

const STATUS_LABEL: Record<ArtistApplication["status"], string> = {
  new: "신규",
  reviewing: "검토중",
  accepted: "승인함",
  declined: "거절함",
};

const STATUS_STYLE: Record<ArtistApplication["status"], string> = {
  new: "border-patina text-patina",
  reviewing: "border-line-strong text-ink-soft",
  accepted: "border-patina bg-patina text-paper",
  declined: "border-line-strong text-ink-faint line-through",
};

export default function AdminApplicationsBrowser({
  applications: initialApplications,
}: {
  applications: ArtistApplication[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedId, setSelectedId] = useState(initialApplications[0]?.id ?? "");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = applications.find((a) => a.id === selectedId);

  async function decide(id: string, decision: "accepted" | "declined") {
    setPending(id);
    setError(null);
    try {
      await reviewArtistApplication(id, decision);
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: decision } : a)));
    } catch {
      setError("처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(null);
    }
  }

  if (applications.length === 0) {
    return <p className="text-sm text-ink-faint">접수된 작가 지원이 없습니다.</p>;
  }

  return (
    <div>
      <div className="space-y-3">
        {applications.map((application) => {
          const active = application.id === selectedId;
          return (
            <button
              key={application.id}
              type="button"
              onClick={() => setSelectedId(application.id)}
              className={`block w-full border px-4 py-3 text-left ${
                active ? "border-patina" : "border-line hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{application.artistName || application.name}</span>
                <span className={`border px-2 py-0.5 text-[10px] ${STATUS_STYLE[application.status]}`}>
                  {STATUS_LABEL[application.status]}
                </span>
              </div>
              <div className="mt-1 text-sm text-ink-soft">{application.tagline}</div>
              <div className="mt-1 text-xs text-ink-faint">{formatDate(application.createdAt)}</div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8 border border-line p-5">
          <p className="mb-1 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            {selected.artistName} ({selected.nameEn})
          </p>
          <p className="mb-4 text-sm text-ink-soft">{selected.tagline}</p>

          <p className="text-sm leading-7 whitespace-pre-wrap text-ink-soft">{selected.bio}</p>

          {selected.styleTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.styleTags.map((tag) => (
                <span key={tag} className="border border-line px-2 py-0.5 text-[11px] text-ink-soft">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-5 space-y-2 text-sm">
            <Row label="신청자">
              {selected.name} · {selected.phone} · {selected.email}
            </Row>
            {selected.portfolioUrl && (
              <Row label="포트폴리오">
                <a
                  href={selected.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-patina hover:underline"
                >
                  {selected.portfolioUrl}
                </a>
              </Row>
            )}
            {selected.sampleArtworkTitle && (
              <Row label="대표작">
                {selected.sampleArtworkTitle}
                {selected.sampleArtworkNote && ` — ${selected.sampleArtworkNote}`}
              </Row>
            )}
            {selected.message && <Row label="메시지">{selected.message}</Row>}
          </dl>

          {selected.status === "new" || selected.status === "reviewing" ? (
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={pending === selected.id}
                onClick={() => decide(selected.id, "accepted")}
                className={buttonClasses("primary", "sm")}
              >
                승인
              </button>
              <button
                type="button"
                disabled={pending === selected.id}
                onClick={() => decide(selected.id, "declined")}
                className={buttonClasses("ghost", "sm")}
              >
                거절
              </button>
            </div>
          ) : (
            <p className="mt-5 text-xs text-ink-faint">
              {selected.status === "accepted"
                ? "승인되어 작가 프로필이 생성되었습니다."
                : "거절 처리되었습니다."}
            </p>
          )}

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 flex-none text-xs text-ink-faint">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}
