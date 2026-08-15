"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { submitGeneralInquiry } from "@/lib/queries";

type Category = "general" | "consulting" | "other";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "general", label: "일반 문의" },
  { value: "consulting", label: "공간 컨설팅" },
  { value: "other", label: "기타" },
];

export default function GeneralInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitGeneralInquiry({ name, email, phone, category, message });
      setSubmitted(true);
    } catch {
      setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">문의 접수 완료</p>
        <h2 className="mb-4 font-display text-xl">감사합니다, {name || "고객"}님</h2>
        <p className="text-sm leading-7 text-ink-soft">
          문의 내용이 Lumora 운영팀에 전달되었습니다. 확인 후 1~3영업일 내 연락드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="문의 유형">
        <div className="flex gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`h-10 flex-1 border text-xs transition-colors ${
                category === opt.value
                  ? "border-patina bg-patina text-paper"
                  : "border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="이름">
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="이메일">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="연락처">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="문의 내용">
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="문의하실 내용을 상세히 적어주세요."
          className="h-32 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
        />
      </Field>

      <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
        {submitting ? "전송 중..." : "문의 보내기"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}
