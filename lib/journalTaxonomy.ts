export interface JournalCategory {
  code: string;
  nameKo: string;
}

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  { code: "art-history", nameKo: "미술사" },
  { code: "interview", nameKo: "작가 인터뷰" },
  { code: "guide", nameKo: "컬렉팅 가이드" },
  { code: "news", nameKo: "소식" },
];

const JOURNAL_CATEGORY_INDEX: Record<string, string> = Object.fromEntries(
  JOURNAL_CATEGORIES.map((c) => [c.code, c.nameKo])
);

export function getJournalCategoryLabel(code: string): string {
  return JOURNAL_CATEGORY_INDEX[code] ?? code;
}
