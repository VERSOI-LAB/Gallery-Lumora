export interface MediumType {
  code: string;
  nameKo: string;
  nameEn: string;
}

export interface MediumCategory {
  code: string;
  number: string;
  nameKo: string;
  nameEn: string;
  types: MediumType[];
}

// The canonical medium taxonomy. Mirrors the CHECK constraints on
// artworks.medium_type_code and artists.commission_media in Supabase —
// update both places together if this list ever changes.
export const MEDIUM_CATEGORIES: MediumCategory[] = [
  {
    code: "fine-painting",
    number: "01",
    nameKo: "회화",
    nameEn: "Fine Painting",
    types: [
      { code: "oil", nameKo: "유화", nameEn: "Oil" },
      { code: "acrylic", nameKo: "아크릴", nameEn: "Acrylic" },
      { code: "watercolor-gouache", nameKo: "수채/과슈", nameEn: "Watercolor/Gouache" },
      { code: "asian-traditional", nameKo: "동양화/채색화", nameEn: "Asian Traditional Paint" },
    ],
  },
  {
    code: "paper-drawing",
    number: "02",
    nameKo: "종이와 드로잉",
    nameEn: "Paper & Drawing",
    types: [
      { code: "graphite-charcoal", nameKo: "연필/목탄/콩테", nameEn: "Graphite/Charcoal" },
      { code: "pastel", nameKo: "파스텔/오일파스텔", nameEn: "Pastel" },
      { code: "pen-ink", nameKo: "펜 & 잉크", nameEn: "Pen & Ink" },
      { code: "calligraphy", nameKo: "서예/캘리그라피", nameEn: "Calligraphy" },
    ],
  },
  {
    code: "edition-print",
    number: "03",
    nameKo: "판화 & 에디션",
    nameEn: "Edition & Print",
    types: [
      { code: "etching-woodcut", nameKo: "오목/볼록판화", nameEn: "Etching/Woodcut" },
      { code: "lithography-silkscreen", nameKo: "석판화/실크스크린", nameEn: "Lithography/Silkscreen" },
      { code: "giclee-print", nameKo: "파인아트 프린트", nameEn: "Giclée Print" },
    ],
  },
  {
    code: "sculpture-object",
    number: "04",
    nameKo: "조각 & 입체",
    nameEn: "Sculpture & Object",
    types: [
      { code: "metal-bronze", nameKo: "금속/브론즈", nameEn: "Metal/Bronze" },
      { code: "stone-marble", nameKo: "대리석/석재", nameEn: "Stone/Marble" },
      { code: "wood-carving", nameKo: "목조각", nameEn: "Wood" },
      { code: "resin", nameKo: "레진/합성수지", nameEn: "Resin" },
    ],
  },
  {
    code: "craft-texture",
    number: "05",
    nameKo: "공예 & 입체질감",
    nameEn: "Craft & Texture",
    types: [
      { code: "ceramics", nameKo: "도자기/세라믹", nameEn: "Ceramics" },
      { code: "glass-art", nameKo: "유리 조형", nameEn: "Glass Art" },
      { code: "fiber-tapestry", nameKo: "섬유/텍스타일", nameEn: "Fiber/Tapestry" },
      { code: "ottchil-mop", nameKo: "옻칠/자개", nameEn: "Ottchil/Mother-of-Pearl" },
    ],
  },
  {
    code: "mixed-collage",
    number: "06",
    nameKo: "복합 매체",
    nameEn: "Mixed & Collage",
    types: [
      { code: "collage", nameKo: "평면 콜라주", nameEn: "Collage" },
      { code: "assemblage", nameKo: "입체 앙상블라주", nameEn: "Assemblage" },
      { code: "mixed-media", nameKo: "혼합재료", nameEn: "Mixed Media" },
    ],
  },
  {
    code: "photo-digital",
    number: "07",
    nameKo: "사진 & 디지털",
    nameEn: "Photo & Digital",
    types: [
      { code: "fine-art-photo", nameKo: "파인아트 사진", nameEn: "Fine Art Photo" },
      { code: "digital-painting", nameKo: "디지털 일러스트", nameEn: "Digital Painting" },
      { code: "three-d-generative", nameKo: "3D 그래픽/제너러티브", nameEn: "3D/Generative" },
    ],
  },
  {
    code: "space-newmedia",
    number: "08",
    nameKo: "공간 & 미디어",
    nameEn: "Space & New Media",
    types: [
      { code: "video-art", nameKo: "미디어 아트/영상", nameEn: "Video Art" },
      { code: "light-neon", nameKo: "라이트/네온 아트", nameEn: "Light/Neon Art" },
      { code: "kinetic-art", nameKo: "키네틱 아트", nameEn: "Kinetic Art" },
    ],
  },
];

interface ResolvedMediumType extends MediumType {
  categoryCode: string;
  categoryNameKo: string;
  categoryNameEn: string;
}

const MEDIUM_TYPE_INDEX: Record<string, ResolvedMediumType> = Object.fromEntries(
  MEDIUM_CATEGORIES.flatMap((category) =>
    category.types.map((type) => [
      type.code,
      {
        ...type,
        categoryCode: category.code,
        categoryNameKo: category.nameKo,
        categoryNameEn: category.nameEn,
      },
    ])
  )
);

export function getMediumType(code: string): ResolvedMediumType | undefined {
  return MEDIUM_TYPE_INDEX[code];
}

export function getMediumTypeLabel(code: string): string {
  return getMediumType(code)?.nameKo ?? code;
}
