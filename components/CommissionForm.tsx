"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { createCommissionInquiry } from "@/lib/queries";
import { getMediumTypeLabel } from "@/lib/mediumTaxonomy";
import type { Artist } from "@/lib/types";

const STEP_LABELS = ["참고자료", "요청 내용", "연락처"];

interface FormState {
  referenceNote: string;
  medium: string;
  size: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  message: string;
  name: string;
  email: string;
  phone: string;
}

const INITIAL_STATE: FormState = {
  referenceNote: "",
  medium: "",
  size: "",
  budgetMin: 1500000,
  budgetMax: 3000000,
  timeline: "",
  message: "",
  name: "",
  email: "",
  phone: "",
};

export default function CommissionForm({ artist }: { artist: Artist }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createCommissionInquiry({
        artistId: artist.id,
        collectorName: form.name,
        email: form.email,
        phone: form.phone,
        referenceNote: form.referenceNote,
        medium: form.medium,
        size: form.size,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        timeline: form.timeline,
        message: form.message,
      });
      setSubmitted(true);
    } catch {
      setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">
          문의 접수 완료
        </p>
        <h1 className="mb-4 font-display text-2xl">감사합니다, {form.name || "고객"}님</h1>
        <p className="mb-8 text-sm leading-7 text-ink-soft">
          {artist.name} 작가에게 커미션 문의가 전달되었습니다. Lumora 운영팀이 작가와 일정·견적을
          조율해 1~3영업일 내 연락드립니다.
          <br />
          Phase 1에서는 계약과 결제가 자동화되지 않으며, 운영팀이 직접 안내해드립니다.
        </p>
        <Link href={`/artists/${artist.slug}`} className={buttonClasses("ghost")}>
          작가 프로필로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10 md:px-0">
      <p className="mb-1 text-xs text-ink-faint">{artist.name} 작가에게 의뢰</p>
      <h1 className="mb-8 font-display text-2xl">커미션 문의하기</h1>

      <div className="mb-8 flex gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-[3px] ${i <= step ? "bg-patina" : "bg-line"}`} />
            <div className="mt-2 text-[11px] text-ink-faint">{label}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 0 && (
          <div className="space-y-5">
            <Field label="참고 이미지 / 설명 (선택)">
              <textarea
                value={form.referenceNote}
                onChange={(e) => update("referenceNote", e.target.value)}
                placeholder="참고할 이미지 링크나 원하는 분위기를 설명해주세요"
                className="h-24 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
              />
            </Field>
            <StepNav onNext={() => setStep(1)} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="원하는 매체">
              <select
                value={form.medium}
                onChange={(e) => update("medium", e.target.value)}
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              >
                <option value="">선택해주세요</option>
                {artist.commission.media.map((code) => (
                  <option key={code} value={getMediumTypeLabel(code)}>
                    {getMediumTypeLabel(code)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="원하는 사이즈">
              <input
                type="text"
                value={form.size}
                onChange={(e) => update("size", e.target.value)}
                placeholder="예: 72.7 × 60.6 cm (30호)"
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              />
            </Field>
            <Field label={`예산 범위 — ${formatKRW(form.budgetMin)} ~ ${formatKRW(form.budgetMax)}`}>
              <div className="space-y-2">
                <input
                  type="range"
                  min={300000}
                  max={5000000}
                  step={100000}
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", Math.min(Number(e.target.value), form.budgetMax))}
                  className="w-full accent-patina"
                />
                <input
                  type="range"
                  min={300000}
                  max={5000000}
                  step={100000}
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", Math.max(Number(e.target.value), form.budgetMin))}
                  className="w-full accent-patina"
                />
              </div>
            </Field>
            <Field label="희망 완성 기한">
              <select
                value={form.timeline}
                onChange={(e) => update("timeline", e.target.value)}
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              >
                <option value="">선택해주세요</option>
                <option value="4주 이내">4주 이내</option>
                <option value="4-8주">4–8주</option>
                <option value="8-12주">8–12주</option>
                <option value="기한 협의">기한 협의</option>
              </select>
            </Field>
            <Field label="요청 메모">
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="작품에 담고 싶은 이야기나 요청 사항을 자유롭게 적어주세요"
                className="h-24 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
              />
            </Field>
            <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="이름">
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              />
            </Field>
            <Field label="이메일">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              />
            </Field>
            <Field label="연락처">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
              />
            </Field>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={buttonClasses("ghost", "sm")}
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 ${buttonClasses("primary")}`}
              >
                {submitting ? "전송 중..." : "문의 보내기"}
              </button>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <p className="border border-patina bg-patina-soft px-4 py-3 text-xs leading-6 text-ink">
              문의가 접수되면 Lumora 운영팀이 {artist.name} 작가와 일정·견적을 조율해 1~3영업일
              내 연락드립니다. (Phase 1에서는 계약·결제가 자동화되지 않습니다.)
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function StepNav({ onBack, onNext }: { onBack?: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <button type="button" onClick={onBack} className={buttonClasses("ghost", "sm")}>
          이전
        </button>
      )}
      <button type="button" onClick={onNext} className={`flex-1 ${buttonClasses("primary")}`}>
        다음
      </button>
    </div>
  );
}
