import "server-only";
import { Resend } from "resend";
import type { Artwork } from "./types";
import { formatKRW } from "./format";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
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
  const fromAddress = process.env.MAIL_FROM_ADDRESS;
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
