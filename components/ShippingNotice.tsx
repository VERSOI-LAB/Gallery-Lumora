import { SHIPPING_GUIDE_LINES } from "@/lib/shipping";

// 결제 전 화면에서 보이는 배송기간 안내 박스. kind로 해당 상품 유형만 노출하거나 전체를 노출한다.
export default function ShippingNotice({
  kind = "all",
  className = "",
}: {
  kind?: "standard" | "commission" | "all";
  className?: string;
}) {
  const lines = SHIPPING_GUIDE_LINES.filter((_, i) =>
    kind === "all" ? true : kind === "standard" ? i === 0 : i === 1
  );
  return (
    <div className={`border border-line bg-paper-raised px-4 py-3 text-xs leading-6 text-ink-soft ${className}`}>
      <p className="mb-1 font-semibold text-ink">배송 안내</p>
      <dl className="space-y-0.5">
        {lines.map((l) => (
          <div key={l.label} className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="flex-none text-ink-faint sm:w-44">{l.label}</dt>
            <dd>{l.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-ink-faint">배송비 무료 · 택배 발송 후 송장번호로 배송조회가 가능합니다.</p>
    </div>
  );
}
