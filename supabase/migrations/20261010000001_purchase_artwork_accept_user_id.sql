-- 1단계: purchase_artwork에 선택 인자 p_user_id 추가 (기존 호출은 그대로 동작)
-- 결제 승인 서버가 service_role로 호출할 때는 auth.uid()가 없으므로 구매자 ID를 직접 넘깁니다.
-- 이 SQL을 먼저 적용한 뒤 앱 코드를 배포하세요.
begin;

drop function public.purchase_artwork(uuid, text, text, text, boolean, text, text, boolean);

create function public.purchase_artwork(
  p_artwork_id uuid,
  p_shipping_address text,
  p_phone text,
  p_payment_method text,
  p_insured boolean,
  p_name text default ''::text,
  p_email text default ''::text,
  p_marketing_opt_in boolean default true,
  p_user_id uuid default null
)
returns table(order_number text, amount integer)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_price integer;
  v_sold boolean;
  v_split_rate numeric;
  v_payout integer;
  v_order_number text;
begin
  select price, sold, a.artist_split_rate into v_price, v_sold, v_split_rate
  from artworks
  join artists a on a.id = artworks.artist_id
  where artworks.id = p_artwork_id
  for update of artworks;

  if not found then
    raise exception 'artwork not found';
  end if;

  if v_sold then
    raise exception 'artwork already sold';
  end if;

  v_order_number := 'LM-' || to_char(now(), 'YYYY') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  v_payout := round(v_price * v_split_rate);

  update artworks set sold = true where id = p_artwork_id;

  insert into orders (artwork_id, order_number, shipping_address, phone, payment_method, insured, amount, name, email, user_id, artist_payout_amount)
  values (p_artwork_id, v_order_number, p_shipping_address, p_phone, p_payment_method, p_insured, v_price, p_name, p_email, coalesce(p_user_id, auth.uid()), v_payout);

  perform public.upsert_customer(p_phone, p_name, p_email, p_marketing_opt_in);

  return query select v_order_number, v_price;
end;
$function$;

commit;
