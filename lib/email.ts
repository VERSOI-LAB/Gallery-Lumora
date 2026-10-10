import "server-only";
import { Resend } from "resend";
import type { Artwork } from "./types";
import { formatKRW } from "./format";
import { SHIPPING_PERIOD_STANDARD } from "./shipping";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY가 설정되지 않았습니다. .env.local에 RESEND_API_KEY와 MAIL_FROM_ADDRESS를 추가한 뒤 다시 시도해주세요."
    );
  }
  return new Resend(apiKey);
}

/** Sends one email per recipient (not a single multi-recipient send, so each
 * customer's address stays out of the other recipients' "to" header). */
export async function sendNewArtworkEmail(to: string[], artwork: Artwork): Promise<void> {
  const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim();
  if (!fromAddress) {
    throw new Error("MAIL_FROM_ADDRESS가 설정되지 않았습니다. .env.local에 발신 이메일 주소를 추가해주세요.");
  }
  const recipients = to.filter((email) => email.trim().length > 0);
  if (recipients.length === 0) return;

  const resend = getResendClient();
  const artworkUrl = `${siteUrl}/works/${artwork.slug}`;
  const imageUrl = artwork.imageUrls[0];

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 12px; letter-spacing: 0.1em; color: #8c8c8c; text-transform: uppercase;">GALLERY LUMORA · 신작 소식</p>
      <h1 style="font-size: 20px; margin: 8px 0 4px;">${artwork.title}</h1>
      <p style="font-size: 14px; color: #4d4d4d; margin: 0 0 16px;">${artwork.artistName}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="" style="width: 100%; height: auto; display: block; margin-bottom: 16px;" />` : ""}
      <p style="font-size: 14px; color: #111111; margin: 0 0 20px;">${formatKRW(artwork.price)}</p>
      <a href="${artworkUrl}" style="display: inline-block; padding: 10px 20px; background: #111111; color: #ffffff; text-decoration: none; font-size: 13px;">작품 보러가기</a>
    </div>
  `;

  await Promise.all(
    recipients.map((email) =>
      resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `[Gallery Lumora] 새 작품 소식: ${artwork.title}`,
        html,
      })
    )
  );
}

function escapeHtml(value: string): string {
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
  amount: number;
}

/** 결제 완료 후 구매자에게 보내는 주문 확인 메일. 비회원은 이 메일의 주문번호로 주문을 조회합니다.
 * 호출하는 쪽에서 실패가 결제 흐름에 영향을 주지 않도록 처리해야 합니다(결제는 이미 완료된 상태). */
export async function sendOrderConfirmationEmail({
  to,
  buyerName,
  lines,
  paymentMethod,
  shippingAddress,
  test = false,
}: {
  to: string;
  buyerName: string;
  lines: OrderConfirmationLine[];
  paymentMethod: string;
  shippingAddress: string;
  /** 관리자 테스트 발송 — 제목에 [테스트]를 붙입니다. */
  test?: boolean;
}): Promise<void> {
  const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim();
  if (!fromAddress) throw new Error("MAIL_FROM_ADDRESS가 설정되지 않았습니다.");
  if (!to.trim() || lines.length === 0) return;

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const rows = lines
    .map(
      (line) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #111111;">
            ${escapeHtml(line.title)}
            <div style="font-size: 12px; color: #8c8c8c; margin-top: 2px;">주문번호 <strong style="color: #111111;">${escapeHtml(line.orderNumber)}</strong></div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #111111; text-align: right; white-space: nowrap;">${formatKRW(line.amount)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111111;">
      <p style="font-size: 12px; letter-spacing: 0.1em; color: #8c8c8c; text-transform: uppercase;">GALLERY LUMORA · 주문 확인</p>
      <h1 style="font-size: 20px; margin: 8px 0 16px;">${escapeHtml(buyerName)}님, 주문이 완료되었습니다</h1>
      <table style="width: 100%; border-collapse: collapse;">${rows}
        <tr>
          <td style="padding: 12px 0; font-size: 14px; font-weight: bold;">총 결제금액</td>
          <td style="padding: 12px 0; font-size: 14px; font-weight: bold; text-align: right;">${formatKRW(total)}</td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; color: #4d4d4d;">
        <tr><td style="padding: 4px 0; width: 80px; color: #8c8c8c;">결제수단</td><td style="padding: 4px 0;">${escapeHtml(paymentMethod)}</td></tr>
        <tr><td style="padding: 4px 0; color: #8c8c8c;">배송지</td><td style="padding: 4px 0;">${escapeHtml(shippingAddress)}</td></tr>
        <tr><td style="padding: 4px 0; color: #8c8c8c;">배송기간</td><td style="padding: 4px 0;">${SHIPPING_PERIOD_STANDARD} 발송</td></tr>
      </table>
      <p style="font-size: 13px; color: #4d4d4d; margin: 20px 0;">
        비회원 주문은 주문 시 입력한 연락처와 위 주문번호로 주문내역·배송 현황을 조회할 수 있습니다.
      </p>
      <a href="${siteUrl}/mypage" style="display: inline-block; padding: 10px 20px; background: #111111; color: #ffffff; text-decoration: none; font-size: 13px;">주문내역 보기</a>
    </div>
  `;

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: `${test ? "[테스트] " : ""}[Gallery Lumora] 주문이 완료되었습니다 (${lines[0].orderNumber}${lines.length > 1 ? ` 외 ${lines.length - 1}건` : ""})`,
    html,
  });
  if (error) throw new Error(error.message);
}

/** 관리자 화면에 보여줄 메일 발송 설정 상태. 키 값은 노출하지 않고, 이름 오타 등을 찾을 수 있도록
 * 실제로 읽히는 RESEND/MAIL 관련 환경변수의 "이름"과 현재 배포 정보만 함께 돌려줍니다. */
export function getEmailConfigStatus(): {
  hasApiKey: boolean;
  fromAddress: string | null;
  relatedEnvNames: string[];
  deployment: { project: string | null; env: string | null; commit: string | null };
} {
  return {
    hasApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    fromAddress: process.env.MAIL_FROM_ADDRESS?.trim() || null,
    relatedEnvNames: Object.keys(process.env)
      .filter((name) => /resend|mail/i.test(name))
      .sort(),
    deployment: {
      project: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
      env: process.env.VERCEL_ENV ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    },
  };
}
