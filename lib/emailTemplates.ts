import { formatKRW } from "./format";
import { SHIPPING_PERIOD_STANDARD } from "./shipping";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface OrderConfirmationLine {
  orderNumber: string;
  title: string;
  /** 작품은 작가명, 굿즈는 부가 설명. */
  subtitle?: string | null;
  imageUrl?: string | null;
  amount: number;
}

// 메일 클라이언트마다 웹폰트 지원이 달라, 시스템 명조·세리프 폰트로 갤러리 톤을 냅니다.
const SERIF = "'Nanum Myeongjo', 'AppleMyungjo', 'Batang', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', Helvetica, Arial, sans-serif";
const INK = "#1a1a1a";
const SOFT = "#5c5852";
const FAINT = "#9a958d";
const LINE = "#e4dfd6";
const PAPER = "#f6f3ee";

function itemBlock(line: OrderConfirmationLine): string {
  const image = line.imageUrl
    ? `<tr><td style="padding: 28px; text-align: center; background: ${PAPER};">
         <img src="${escapeHtml(line.imageUrl)}" alt="${escapeHtml(line.title)}" width="424"
           style="display: block; width: 100%; max-width: 424px; height: auto; margin: 0 auto; border: 0;" />
       </td></tr>
       <tr><td style="height: 18px; line-height: 18px; font-size: 0;">&nbsp;</td></tr>`
    : "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 36px;">
      ${image}
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: top;">
              <div style="font-family: ${SERIF}; font-size: 19px; line-height: 1.4; color: ${INK};">${escapeHtml(line.title)}</div>
              ${line.subtitle ? `<div style="font-family: ${SANS}; font-size: 13px; color: ${SOFT}; margin-top: 4px;">${escapeHtml(line.subtitle)}</div>` : ""}
              <div style="font-family: ${SANS}; font-size: 11px; letter-spacing: 0.08em; color: ${FAINT}; margin-top: 10px;">ORDER NO. ${escapeHtml(line.orderNumber)}</div>
            </td>
            <td style="vertical-align: top; text-align: right; white-space: nowrap; font-family: ${SANS}; font-size: 14px; color: ${INK};">${formatKRW(line.amount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>`;
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-top: 1px solid ${LINE}; width: 96px; vertical-align: top; font-family: ${SANS}; font-size: 12px; letter-spacing: 0.04em; color: ${FAINT};">${label}</td>
      <td style="padding: 12px 0; border-top: 1px solid ${LINE}; font-family: ${SANS}; font-size: 13px; line-height: 1.6; color: ${INK};">${value}</td>
    </tr>`;
}

export function renderOrderConfirmationEmail({
  siteUrl,
  buyerName,
  lines,
  paymentMethod,
  shippingAddress,
}: {
  siteUrl: string;
  buyerName: string;
  lines: OrderConfirmationLine[];
  paymentMethod: string;
  shippingAddress: string;
}): string {
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin: 0; padding: 0; background: ${PAPER};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${PAPER};">
    <tr><td align="center" style="padding: 40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff;">
        <tr><td style="padding: 36px 40px 0; text-align: center;">
          <div style="font-family: ${SERIF}; font-size: 15px; letter-spacing: 0.32em; color: ${INK};">GALLERY LUMORA</div>
          <div style="width: 32px; height: 1px; background: ${INK}; margin: 18px auto 0;"></div>
        </td></tr>

        <tr><td style="padding: 40px 40px 8px; text-align: center;">
          <div style="font-family: ${SANS}; font-size: 11px; letter-spacing: 0.24em; color: ${FAINT};">ORDER CONFIRMATION</div>
          <h1 style="margin: 14px 0 0; font-family: ${SERIF}; font-weight: normal; font-size: 26px; line-height: 1.45; color: ${INK};">
            ${escapeHtml(buyerName)}님의 소장을<br />진심으로 축하드립니다
          </h1>
          <p style="margin: 16px 0 0; font-family: ${SANS}; font-size: 13px; line-height: 1.7; color: ${SOFT};">
            주문이 정상적으로 완료되었습니다.<br />작품이 안전하게 도착하도록 정성껏 준비하겠습니다.
          </p>
        </td></tr>

        <tr><td style="padding: 40px 40px 4px;">
          ${lines.map(itemBlock).join("")}
        </td></tr>

        <tr><td style="padding: 0 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 16px 0; border-top: 1px solid ${INK}; font-family: ${SANS}; font-size: 13px; color: ${INK};">총 결제금액</td>
              <td style="padding: 16px 0; border-top: 1px solid ${INK}; text-align: right; font-family: ${SERIF}; font-size: 20px; color: ${INK};">${formatKRW(total)}</td>
            </tr>
            ${detailRow("결제수단", escapeHtml(paymentMethod))}
            ${detailRow("배송지", escapeHtml(shippingAddress))}
            ${detailRow("배송기간", `${SHIPPING_PERIOD_STANDARD} 발송`)}
          </table>
        </td></tr>

        <tr><td style="padding: 36px 40px 44px; text-align: center;">
          <a href="${siteUrl}/mypage" style="display: inline-block; padding: 13px 34px; border: 1px solid ${INK}; color: ${INK}; text-decoration: none; font-family: ${SANS}; font-size: 12px; letter-spacing: 0.16em;">주문내역 보기</a>
          <p style="margin: 18px 0 0; font-family: ${SANS}; font-size: 12px; line-height: 1.7; color: ${FAINT};">
            배송이 시작되면 송장번호를 다시 안내해 드립니다.<br />주문 취소·문의는 마이페이지 또는 고객센터를 이용해주세요.
          </p>
        </td></tr>
      </table>

      <p style="margin: 24px 0 0; font-family: ${SANS}; font-size: 11px; line-height: 1.7; color: ${FAINT}; text-align: center;">
        Gallery Lumora — 완성작을 소장하거나, 작가에게 1:1로 의뢰하세요.<br />
        <a href="${siteUrl}" style="color: ${FAINT};">${siteUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}
