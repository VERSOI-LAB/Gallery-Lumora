// 배송(제품 제공) 기간 기준. 사이트 전역 안내 문구는 모두 여기서 가져옵니다.
export const SHIPPING_PERIOD_STANDARD = "결제 완료 후 2주 이내";
export const SHIPPING_PERIOD_COMMISSION = "최대 6주";

export const SHIPPING_GUIDE_LINES = [
  { label: "일반 등록 작품 · 굿즈 상품", value: `${SHIPPING_PERIOD_STANDARD} 발송` },
  { label: "1:1 커미션(주문 제작) 작품", value: `제작 착수 후 ${SHIPPING_PERIOD_COMMISSION} (제작·배송 포함)` },
] as const;
