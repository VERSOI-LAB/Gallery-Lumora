-- 환불(결제 취소)을 위해 토스 결제 정보를 주문에 저장합니다. (적용 완료)
alter table public.orders
  add column if not exists payment_key text,
  add column if not exists toss_order_id text,
  add column if not exists refunded_at timestamptz;
alter table public.merch_orders
  add column if not exists payment_key text,
  add column if not exists toss_order_id text,
  add column if not exists refunded_at timestamptz;
