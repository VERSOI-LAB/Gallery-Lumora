"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { adminSendTestEmail } from "@/lib/adminActions";

export default function AdminTestEmailForm() {
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: true } | { ok: false; error: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      setResult(await adminSendTestEmail(to));
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "발송 요청에 실패했습니다." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          required
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="테스트 메일을 받을 주소"
          className="h-10 flex-1 border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button type="submit" disabled={sending} className={buttonClasses("primary", "sm")}>
          {sending ? "발송 중..." : "테스트 메일 보내기"}
        </button>
      </form>
      {result?.ok && (
        <p className="mt-2 text-xs text-patina">
          발송했습니다. 몇 분 안에 오지 않으면 스팸함과 Resend 대시보드의 Emails 기록을 확인해주세요.
        </p>
      )}
      {result && !result.ok && <p className="mt-2 text-xs break-all text-red-600">발송 실패: {result.error}</p>}
    </div>
  );
}
