/** 연락처 형식: 휴대폰·지역번호(010-1234-5678, 02-123-4567, 031-123-4567)와
 * 대표번호(1588-1234). 입력은 숫자만 받아 이 형식으로 자동 변환합니다. */
export const PHONE_PATTERN = "0\\d{1,2}-\\d{3,4}-\\d{4}|1\\d{3}-\\d{4}";
const PHONE_REGEX = new RegExp(`^(?:${PHONE_PATTERN})$`);

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

/** 숫자 외 문자를 버리고 입력 중인 번호에 하이픈을 넣습니다. */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.startsWith("1")) {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
