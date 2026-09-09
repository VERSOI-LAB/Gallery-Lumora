import { BUYER_TERMS } from "@/lib/legalTerms";

export const metadata = {
  title: "환불정책 | Gallery Lumora",
  description: "갤러리 루모라 배송·청약철회·환불 및 반품 정책 안내",
};

const REFUND_ARTICLE_HEADINGS = [
  "제9조(배송)",
  "제10조(청약철회)",
  "제11조(환불 및 반품)",
  "제12조(작품의 하자)",
];

export default function RefundPolicyPage() {
  const articles = BUYER_TERMS.articles.filter((a) => REFUND_ARTICLE_HEADINGS.includes(a.heading));

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-0">
      <p className="mb-2 text-xs font-semibold tracking-wide text-patina uppercase">Policy</p>
      <h1 className="mb-3 font-display text-2xl">환불정책 (배송·청약철회·환불 및 반품)</h1>
      <p className="mb-10 text-xs text-ink-faint">{BUYER_TERMS.subtitle}</p>

      <div className="space-y-8 text-sm leading-7 text-ink-soft">
        {articles.map((article) => (
          <div key={article.heading} className="border-t border-line pt-6">
            <h2 className="mb-2 font-semibold text-ink">{article.heading}</h2>
            <p className="whitespace-pre-line">{article.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-line pt-6 text-xs text-ink-faint">
        <p className="mb-1">
          본 페이지는 갤러리 루모라 구매자 이용약관 중 배송·청약철회·환불에 관한 조항을 발췌한
          것입니다. 이용약관 전문은 회원가입 시 확인하실 수 있습니다.
        </p>
        <p>
          환불·반품 문의: 갤러리 루모라 고객센터 ·{" "}
          <a href="mailto:versoi.labs@gmail.com" className="hover:text-ink hover:underline">
            versoi.labs@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
