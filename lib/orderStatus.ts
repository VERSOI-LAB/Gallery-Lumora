import type { OrderStatus } from "./types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "결제완료",
  preparing: "배송준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

export const ORDER_STATUS_BADGE_STYLE: Record<OrderStatus, string> = {
  paid: "border-line-strong text-ink-soft",
  preparing: "border-patina text-patina",
  shipped: "border-patina bg-patina text-paper",
  delivered: "border-line-strong text-ink-faint",
  cancelled: "border-line-strong text-ink-faint line-through",
};
