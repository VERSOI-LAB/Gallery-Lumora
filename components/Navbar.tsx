"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/works", label: "Exhibition" },
  { href: "/artists", label: "Artists" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/commission", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const displayName = (session?.user.user_metadata?.name as string | undefined) || session?.user.email || "";

  return (
    <header className="sticky top-0 z-30 border-b border-board-line bg-board">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" className="font-editorial text-lg tracking-[0.08em] text-board-ink">
          GALLERY <span className="text-board-accent">LUMORA</span>
        </Link>

        <nav className="font-editorial hidden items-center gap-8 text-sm tracking-wide text-board-ink-soft md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-board-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <div className="flex items-center gap-3 text-sm text-board-ink-soft">
              <span className="max-w-[10rem] truncate">{displayName} 님</span>
              <button type="button" onClick={handleLogout} className="hover:text-board-ink">
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-board-ink-soft">
              <Link href="/login" className="hover:text-board-ink">
                로그인
              </Link>
              <Link href="/signup" className="hover:text-board-ink">
                회원가입
              </Link>
            </div>
          )}
        </div>

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
              className="font-editorial px-1 py-2.5 text-sm tracking-wide text-board-ink-soft"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-1 py-2.5 text-left text-sm text-board-ink-soft"
            >
              로그아웃 ({displayName})
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-1 py-2.5 text-sm text-board-ink-soft"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="px-1 py-2.5 text-sm text-board-ink-soft"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
