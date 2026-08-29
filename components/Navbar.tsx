"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartContext";
import { getMyProfile } from "@/lib/queries";
import type { Session } from "@supabase/supabase-js";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/works", label: "Exhibition" },
  { href: "/artists", label: "Artists" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/commission", label: "Contact" },
];

const SOCIAL_LINKS = [
  {
    href: "https://youtube.com/channel/UC3e7gGAdudn59fMqE6Ju33w?si=i798e5zktdmqZ5qz",
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2.5" y="6" width="19" height="12" rx="3" />
        <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/gallery_lumora/",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/share/1djPqRT6br/",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          d="M14 21v-8h2.7l.4-3.1H14V8c0-.9.2-1.5 1.6-1.5H17V3.7C16.7 3.7 15.7 3.5 14.6 3.5c-2.3 0-3.9 1.4-3.9 4v2.4H8v3.1h2.7V21z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const router = useRouter();
  const { count: cartCount } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (active) setIsArtist(profile?.role === "artist");
      })
      .catch(() => {
        if (active) setIsArtist(false);
      });
    return () => {
      active = false;
    };
  }, [session]);

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
          <div className="flex items-center gap-3 border-r border-board-line pr-4">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-board-ink-soft hover:text-board-ink"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <Link href="/search" aria-label="검색" className="text-board-ink-soft hover:text-board-ink">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </Link>
          <Link href="/shop/cart" aria-label="장바구니" className="relative text-board-ink-soft hover:text-board-ink">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
              <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center bg-board-accent px-1 text-[10px] font-semibold text-board">
                {cartCount}
              </span>
            )}
          </Link>
          {session ? (
            <div className="flex items-center gap-3 text-sm text-board-ink-soft">
              <Link href="/mypage" className="max-w-[10rem] truncate hover:text-board-ink">
                {displayName} 님
              </Link>
              {isArtist && (
                <Link href="/studio/works" className="hover:text-board-ink">
                  스튜디오
                </Link>
              )}
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
          <div className="flex items-center gap-4 px-1 py-2.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-board-ink-soft hover:text-board-ink"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="font-editorial px-1 py-2.5 text-sm tracking-wide text-board-ink-soft"
          >
            검색
          </Link>
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
            <>
              <Link
                href="/mypage"
                onClick={() => setOpen(false)}
                className="font-editorial px-1 py-2.5 text-sm tracking-wide text-board-ink-soft"
              >
                마이페이지
              </Link>
              {isArtist && (
                <Link
                  href="/studio/works"
                  onClick={() => setOpen(false)}
                  className="font-editorial px-1 py-2.5 text-sm tracking-wide text-board-ink-soft"
                >
                  {displayName} 님의 스튜디오
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-1 py-2.5 text-left text-sm text-board-ink-soft"
              >
                로그아웃 ({displayName})
              </button>
            </>
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
