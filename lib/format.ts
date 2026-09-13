export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** PG사(토스페이먼츠) 규정상 1,000만원 이상 고가 미술품은 카드 결제 위젯으로 판매할 수 없어
 * 가격을 노출하지 않고 "별도 문의"로 안내한다. */
export const HIGH_VALUE_ARTWORK_THRESHOLD = 10_000_000;

export function isHighValueArtwork(price: number): boolean {
  return price >= HIGH_VALUE_ARTWORK_THRESHOLD;
}

export function formatArtworkPrice(price: number): string {
  return isHighValueArtwork(price) ? "별도 문의" : formatKRW(price);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export type TaxStatus = "taxable" | "exempt";

/** `price` is treated as VAT-inclusive (what the customer sees/pays). For a
 * taxable item this splits it into 공급가액(supply price) + 부가세(VAT) at the
 * standard 10% rate; an exempt item has no VAT. `productPrice + vat +
 * shipping` always equals `price`. */
export function computeVatBreakdown(
  price: number,
  taxStatus: TaxStatus,
  shipping = 0
): { productPrice: number; vat: number; shipping: number; total: number } {
  if (taxStatus === "exempt") {
    return { productPrice: price, vat: 0, shipping, total: price + shipping };
  }
  const productPrice = Math.round(price / 1.1);
  const vat = price - productPrice;
  return { productPrice, vat, shipping, total: price + shipping };
}

export function getTaxStatusLabel(taxStatus: TaxStatus): string {
  return taxStatus === "exempt" ? "부가세 면세" : "부가세 포함";
}
