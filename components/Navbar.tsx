"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";

const LINKS = [
  { href: "/works", label: "Exhibition" },
  { href: "/artists", label: "Artists" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-board-line bg-board">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-board-ink">
          GALLERY <span className="text-board-accent">LUMORA</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-board-ink-soft md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-board-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/artists" className={`hidden md:inline-flex ${buttonClasses("primary", "sm")}`}>
          커미션 시작하기
        </Link>

        <button
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          className="text-xl leading-none text-board-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-board-line px-5 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-1 py-2.5 text-sm text-board-ink-soft"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/artists"
            onClick={() => setOpen(false)}
            className={`mt-2 justify-center ${buttonClasses("primary", "sm")}`}
          >
            커미션 시작하기
          </Link>
        </div>
      )}
    </header>
  );
}
