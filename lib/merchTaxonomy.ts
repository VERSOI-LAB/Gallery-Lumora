export interface MerchCategory {
  code: string;
  nameKo: string;
}

export const MERCH_CATEGORIES: MerchCategory[] = [
  { code: "print", nameKo: "파인아트 프린트" },
  { code: "card-poster", nameKo: "아트카드 · 포스터" },
  { code: "living", nameKo: "생활용품" },
  { code: "object", nameKo: "리미티드 오브제" },
];

const MERCH_CATEGORY_INDEX: Record<string, string> = Object.fromEntries(
  MERCH_CATEGORIES.map((c) => [c.code, c.nameKo])
);

export function getMerchCategoryLabel(code: string): string {
  return MERCH_CATEGORY_INDEX[code] ?? code;
}
