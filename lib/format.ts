export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
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
