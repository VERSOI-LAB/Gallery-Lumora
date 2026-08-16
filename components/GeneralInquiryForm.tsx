"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses, chipClasses, fieldInputClasses, fieldTextareaClasses } from "@/lib/ui";
import { submitGeneralInquiry } from "@/lib/queries";
import FormField from "./FormField";

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
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-patina text-patina">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 10.5 3.2 3.2L15 7"
            />
          </svg>
        </div>
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
      <FormField label="문의 유형">
        <div className="flex gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`h-10 flex-1 ${chipClasses(category === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="이름">
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldInputClasses}
        />
      </FormField>
      <FormField label="이메일">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputClasses}
        />
      </FormField>
      <FormField label="연락처">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldInputClasses}
        />
      </FormField>
      <FormField label="문의 내용">
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="문의하실 내용을 상세히 적어주세요."
          className={`h-32 ${fieldTextareaClasses}`}
        />
      </FormField>

      <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
        {submitting ? "전송 중..." : "문의 보내기"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
