-- 2단계: purchase_artwork를 결제 승인 서버(service_role)만 호출할 수 있게 제한합니다.
-- 앱 코드(서버 라우트가 service_role로 호출하는 버전)가 배포된 뒤에 적용하세요.
-- 먼저 적용하면 배포 전 코드의 결제 승인 후 주문 등록이 실패합니다(결제는 자동 취소됨).
revoke execute on function public.purchase_artwork(uuid, text, text, text, boolean, text, text, boolean, uuid)
  from public, anon, authenticated;
grant execute on function public.purchase_artwork(uuid, text, text, text, boolean, text, text, boolean, uuid)
  to service_role;
