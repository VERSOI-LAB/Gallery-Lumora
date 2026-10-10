-- 비회원 주문조회 개인정보 보호 (2단계): 연락처만으로 조회하는 함수의 공개 실행 권한을 회수합니다.
-- 관리자 화면은 서버(service_role)로만 호출하도록 바뀐 앱 코드가 배포된 뒤에 적용하세요.
-- 비회원 조회는 get_guest_artwork_orders / get_guest_merch_orders(연락처 + 주문번호)를 사용합니다.
revoke execute on function public.get_artwork_orders_by_phone(text) from public, anon, authenticated;
revoke execute on function public.get_merch_orders_by_phone(text) from public, anon, authenticated;
grant execute on function public.get_artwork_orders_by_phone(text) to service_role;
grant execute on function public.get_merch_orders_by_phone(text) to service_role;
