"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { adminSendNewArtworkNotification } from "@/lib/adminActions";
import type { Artwork, Customer } from "@/lib/types";

export default function AdminCustomerList({
  customers,
  notifiableArtworks,
}: {
  customers: Customer[];
  notifiableArtworks: Artwork[];
}) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [artworkId, setArtworkId] = useState(notifiableArtworks[0]?.id ?? "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const term = keyword.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.preferenceTags.some((t) => t.toLowerCase().includes(term))
    );
  }, [customers, term]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id))));
  }

  async function handleSend() {
    if (selected.size === 0 || !artworkId) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const { sentCount } = await adminSendNewArtworkNotification(artworkId, Array.from(selected));
      setResult(
        sentCount === 0
          ? "발송 대상이 없습니다 (선택한 고객 중 이메일 수신에 동의한 고객이 없습니다)."
          : `${sentCount}명에게 발송했습니다.`
      );
      setSelected(new Set());
    } catch {
      setError("발송에 실패했습니다. RESEND_API_KEY / MAIL_FROM_ADDRESS 설정을 확인해주세요.");
    } finally {
      setSending(false);
    }
  }

  function exportCsv() {
    downloadCsv(
      `lumora-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((c) => ({
        이름: c.name,
        연락처: c.phone,
        이메일: c.email,
        마케팅수신: c.marketingOptIn ? "Y" : "N",
        주문건수: c.orderCount,
        누적결제액: c.totalSpent,
        최근주문일: c.lastOrderAt ? formatDate(c.lastOrderAt) : "",
        취향태그: c.preferenceTags.join(" / "),
        가입일: formatDate(c.createdAt),
      }))
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름, 연락처, 이메일, 취향 태그로 검색"
          className="h-10 flex-1 min-w-[200px] border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className={`${buttonClasses("ghost", "sm")} disabled:opacity-40`}
        >
          CSV 내보내기
        </button>
      </div>

      {notifiableArtworks.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 border border-line p-3">
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selected.size === filtered.length}
              onChange={toggleAll}
              className="accent-patina"
            />
            전체 선택 ({selected.size}명)
          </label>
          <select
            value={artworkId}
            onChange={(e) => setArtworkId(e.target.value)}
            className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
          >
            {notifiableArtworks.map((a) => (
              <option key={a.id} value={a.id}>
                {a.artistName} — {a.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={selected.size === 0 || sending}
            onClick={handleSend}
            className={`${buttonClasses("primary", "sm")} disabled:opacity-40`}
          >
            {sending ? "발송 중..." : "선택 고객에게 신작 알림 발송"}
          </button>
          {result && <p className="text-xs text-patina">{result}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">
          {customers.length === 0 ? "고객 데이터가 없습니다." : "검색 결과가 없습니다."}
        </p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-4">
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="accent-patina" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/customers/${c.id}`} className="text-sm font-medium text-ink hover:underline">
                    {c.name || "이름 미입력"}
                  </Link>
                  <span className="text-xs text-ink-faint">{c.phone}</span>
                  {!c.marketingOptIn && (
                    <span className="border border-line px-1.5 py-0.5 text-[10px] text-ink-faint">수신 거부</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-ink-soft">
                  {c.email || "이메일 미입력"}
                  {c.preferenceTags.length > 0 && ` · 취향: ${c.preferenceTags.join(", ")}`}
                </div>
              </div>
              <div className="flex-none text-right text-xs text-ink-soft">
                <p className="font-semibold text-ink">{formatKRW(c.totalSpent)}</p>
                <p>
                  {c.orderCount}건{c.lastOrderAt ? ` · 최근 ${formatDate(c.lastOrderAt)}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
