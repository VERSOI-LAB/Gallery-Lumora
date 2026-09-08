/**
 * Toss Payments widely-published sandbox demo keys (documented at
 * https://docs.tosspayments.com for anyone to try the integration without
 * signing up). Override with real test/live keys from
 * https://developers.tosspayments.com once the merchant has an account.
 */
const DEMO_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || DEMO_CLIENT_KEY;
