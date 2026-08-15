// Price range slider ladder: 0, then every 1,000,000-won step up to 100,000,000
// (1억), with a final "무제한" (unlimited) stop beyond that.
export const PRICE_STEPS: number[] = [
  0,
  ...Array.from({ length: 100 }, (_, i) => (i + 1) * 1_000_000),
  Infinity,
];

export function formatPriceStep(amount: number): string {
  if (amount === Infinity) return "무제한";
  if (amount === 0) return "0";
  if (amount % 100_000_000 === 0) return `${amount / 100_000_000}억`;
  return `${(amount / 10_000).toLocaleString("ko-KR")}만`;
}
