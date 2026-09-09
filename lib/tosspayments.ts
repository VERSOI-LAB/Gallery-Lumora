/** TossPayments 결제위젯 연동 상수.
 *
 * 아래 키는 TossPayments가 자사 문서에 공개 배포하는 위젯 연동 테스트 전용
 * 키(누구나 사용 가능, 실 결제 승인 불가)로, 계약 승인 전 결제경로 데모·심사용
 * 화면 캡처를 위한 기본값입니다. 계약 승인 후에는 발급받은 운영/테스트 키를
 * 환경변수로 설정해 교체해야 합니다.
 * https://docs.tosspayments.com/guides/payment-widget/integration
 */
export const TOSS_WIDGET_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
