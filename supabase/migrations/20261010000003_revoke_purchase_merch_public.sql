-- purchase_merch를 결제 승인 서버(service_role)만 호출할 수 있게 제한합니다.
-- 굿즈 결제를 TossPayments로 승인한 뒤 서버에서 주문을 등록하는 앱 코드가 배포된 뒤에 적용하세요.
-- 먼저 적용하면 배포 전 코드의 굿즈 구매(브라우저에서 직접 호출)가 실패합니다.
revoke execute on function public.purchase_merch(uuid, uuid, integer, text, text, text, text, text, boolean, uuid, text)
  from public, anon, authenticated;
grant execute on function public.purchase_merch(uuid, uuid, integer, text, text, text, text, text, boolean, uuid, text)
  to service_role;
