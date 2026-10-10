-- 고객 주문 취소는 토스 환불까지 처리하는 서버 라우트(/api/orders/cancel)로만 진행합니다.
-- 상태만 바꾸고 환불은 하지 않던 cancel_order RPC의 공개 실행 권한을 회수합니다(앱 코드 배포 후 적용).
revoke execute on function public.cancel_order(text, uuid, text) from public, anon, authenticated;
grant execute on function public.cancel_order(text, uuid, text) to service_role;
