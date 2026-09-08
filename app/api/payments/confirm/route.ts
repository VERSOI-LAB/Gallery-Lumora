import { NextResponse } from "next/server";

/** Same widely-published Toss sandbox demo secret key that pairs with the
 * demo client key in lib/toss.ts. Override with TOSS_SECRET_KEY once the
 * merchant has a real Toss Payments account. Never expose this to the browser. */
const DEMO_SECRET_KEY = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || DEMO_SECRET_KEY;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const paymentKey = body?.paymentKey;
  const orderId = body?.orderId;
  const amount = body?.amount;

  if (typeof paymentKey !== "string" || typeof orderId !== "string" || typeof amount !== "number") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? "confirm_failed" }, { status: res.status });
  }

  return NextResponse.json({ ok: true, payment: data });
}
