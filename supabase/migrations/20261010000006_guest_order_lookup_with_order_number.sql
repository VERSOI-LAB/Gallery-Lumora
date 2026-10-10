-- 비회원 주문조회를 "연락처 + 주문번호"로 제한합니다 (1단계: 새 함수 추가, 기존 동작 영향 없음).
-- 기존 get_*_orders_by_phone은 연락처만으로 이름·이메일·배송지까지 돌려줘, 남의 번호만 알면
-- 개인정보를 볼 수 있었습니다. 새 함수는 연락처(숫자 비교)와 주문번호가 모두 맞는 주문만 반환합니다.
begin;

create or replace function public.get_guest_artwork_orders(p_phone text, p_order_number text)
returns table(id uuid, order_number text, artwork_id uuid, artwork_title text, artist_name text, image_urls text[], hue integer, variant integer, shipping_address text, phone text, name text, email text, payment_method text, insured boolean, amount integer, artist_payout_amount integer, status text, created_at timestamp with time zone, shipping_method text, tracking_carrier text, tracking_number text, courier_name text, courier_phone text, vehicle_number text, tax_status text)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    o.id, o.order_number, o.artwork_id, a.title, ar.name,
    a.image_urls, a.hue, a.variant, o.shipping_address, o.phone,
    o.name, o.email, o.payment_method, o.insured, o.amount,
    o.artist_payout_amount, o.status, o.created_at,
    o.shipping_method, o.tracking_carrier, o.tracking_number,
    o.courier_name, o.courier_phone, o.vehicle_number,
    coalesce(a.tax_status, 'taxable')
  from public.orders o
  left join public.artworks a on a.id = o.artwork_id
  left join public.artists ar on ar.id = a.artist_id
  where length(regexp_replace(p_phone, '\D', '', 'g')) >= 9
    and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
    and o.order_number = upper(trim(p_order_number))
  order by o.created_at desc;
$function$;

create or replace function public.get_guest_merch_orders(p_phone text, p_order_number text)
returns table(id uuid, order_number text, product_id uuid, product_slug text, product_title text, product_category text, cover_hue integer, cover_variant integer, variant_label text, edition_number integer, quantity integer, unit_price integer, amount integer, shipping_address text, phone text, payment_method text, status text, created_at timestamp with time zone)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    mo.id, mo.order_number, mo.product_id, mp.slug, mp.title, mp.category,
    mp.cover_hue, mp.cover_variant, mv.label, mo.edition_number, mo.quantity,
    mo.unit_price, mo.amount, mo.shipping_address, mo.phone, mo.payment_method,
    mo.status, mo.created_at
  from public.merch_orders mo
  left join public.merch_products mp on mp.id = mo.product_id
  left join public.merch_variants mv on mv.id = mo.variant_id
  where length(regexp_replace(p_phone, '\D', '', 'g')) >= 9
    and regexp_replace(mo.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
    and mo.order_number = upper(trim(p_order_number))
  order by mo.created_at desc;
$function$;

grant execute on function public.get_guest_artwork_orders(text, text) to anon, authenticated, service_role;
grant execute on function public.get_guest_merch_orders(text, text) to anon, authenticated, service_role;

commit;
