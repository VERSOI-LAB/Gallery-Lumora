import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/works", label: "Exhibition" },
  { href: "/artists", label: "Artists" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/commission", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 text-xs md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-ink-faint">Gallery Lumora — 완성작을 소장하거나, 작가에게 1:1로 의뢰하세요.</p>
          <nav className="flex flex-wrap gap-5 text-ink-soft">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 space-y-1 border-t border-line pt-6 leading-6 text-ink-faint">
          <p>
            통신판매중개업자: 베르소이 · 브랜드명: 갤러리 루모라 (Gallery Lumora) · 사업자등록번호:
            550-38-01564 · 대표자: 이재희
          </p>
          <p>
            사업장 주소: 경기도 성남시 수정구 창업로 18, 876호 · 이메일:{" "}
            <a href="mailto:Versoi.labs@gmail.com" className="hover:text-ink hover:underline">
              Versoi.labs@gmail.com
            </a>
          </p>
          <p>
            본 사이트에서 판매되는 상품의 판매자는 각 상품의 입점 작가이며, 갤러리 루모라는
            통신판매중개자입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
