export interface MerchCategory {
  code: string;
  nameKo: string;
}

export const MERCH_CATEGORIES: MerchCategory[] = [
  { code: "postcard", nameKo: "엽서" },
  { code: "poster", nameKo: "포스터" },
  { code: "canvas-frame", nameKo: "캔버스 액자" },
  { code: "notebook", nameKo: "노트" },
  { code: "eco-bag", nameKo: "에코백" },
  { code: "mug", nameKo: "머그컵" },
  { code: "tumbler", nameKo: "텀블러" },
  { code: "scarf", nameKo: "스카프" },
];

const MERCH_CATEGORY_INDEX: Record<string, string> = Object.fromEntries(
  MERCH_CATEGORIES.map((c) => [c.code, c.nameKo])
);

export function getMerchCategoryLabel(code: string): string {
  return MERCH_CATEGORY_INDEX[code] ?? code;
}
