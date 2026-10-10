"use client";

import { useEffect } from "react";
import { PHONE_PATTERN, formatPhoneInput } from "@/lib/phone";

/** 연락처 입력 — 숫자만 받아 010-1234-5678 형식으로 자동 변환하고, 형식이 맞지 않으면
 * 브라우저 기본 검증(pattern)으로 제출을 막습니다. */
export default function PhoneInput({
  value,
  onChange,
  required = false,
  placeholder = "010-0000-0000",
  className = "h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina",
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  // 프로필 등에서 하이픈 없이 저장된 번호를 불러온 경우에도 같은 형식으로 맞춥니다.
  useEffect(() => {
    const formatted = formatPhoneInput(value);
    if (formatted !== value) onChange(formatted);
  }, [value, onChange]);

  return (
    <input
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      required={required}
      pattern={PHONE_PATTERN}
      title="연락처를 010-1234-5678 형식으로 입력해주세요."
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(formatPhoneInput(e.target.value))}
      className={className}
    />
  );
}
