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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-xs md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-ink-faint">Gallery Lumora — 완성작을 소장하거나, 작가에게 1:1로 의뢰하세요.</p>
        <nav className="flex flex-wrap gap-5 text-ink-soft">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
