-- 비회원 주문조회: 연락처를 숫자만 비교해 하이픈 유무와 상관없이 조회되게 합니다.
-- (예전 주문은 "01012345678", 새 주문은 "010-1234-5678" 형식으로 저장되어 있음)
-- 숫자가 9자리 미만이면 아무것도 반환하지 않아, 빈 값으로 연락처 없는 주문이 조회되지 않게 합니다.
-- create or replace라 반환 형식과 실행 권한은 그대로 유지됩니다. 앱 코드 변경 없이 바로 적용해도 됩니다.
begin;

create or replace function public.get_artwork_orders_by_phone(p_phone text)
returns table(id uuid, order_number text, artwork_id uuid, artwork_title text, artist_name text, image_urls text[], hue integer, variant integer, shipping_address text, phone text, name text, email text, payment_method text, insured boolean, amount integer, artist_payout_amount integer, status text, created_at timestamp with time zone, shipping_method text, tracking_carrier text, tracking_number text, courier_name text, courier_phone text, vehicle_number text, tax_status text)
language sql
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
  order by o.created_at desc;
$function$;

create or replace function public.get_merch_orders_by_phone(p_phone text)
returns table(id uuid, order_number text, product_id uuid, product_slug text, product_title text, product_category text, cover_hue integer, cover_variant integer, variant_label text, edition_number integer, quantity integer, unit_price integer, amount integer, shipping_address text, phone text, payment_method text, status text, created_at timestamp with time zone)
language sql
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
  order by mo.created_at desc;
$function$;

commit;
