/** TossPayments 결제위젯 연동 상수.
 *
 * 실 결제에는 개발자센터 > API 키 > 라이브 > "주문서형·결제창형 연동 키(결제위젯 연동 키)"의
 * 클라이언트 키(live_gck_...)를 NEXT_PUBLIC_TOSS_CLIENT_KEY로, 같은 섹션의 시크릿 키
 * (live_gsk_...)를 TOSS_WIDGET_SECRET_KEY로 설정합니다. "API 개별 연동 키"(live_ck_/live_sk_)는
 * 결제위젯과 호환되지 않으니 사용하지 마세요.
 *
 * 환경변수가 없으면 TossPayments가 문서에 공개 배포하는 위젯 테스트 전용 키(실 결제 승인 불가)로
 * 동작합니다. https://docs.tosspayments.com/guides/payment-widget/integration
 */
export const TOSS_WIDGET_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

/** 결제 승인 시 orderId가 해당 작품의 주문인지 확인하는 데 사용하는 접두사. */
export function tossOrderIdPrefix(artworkId: string): string {
  return `gl_${artworkId.slice(0, 8)}_`;
}
