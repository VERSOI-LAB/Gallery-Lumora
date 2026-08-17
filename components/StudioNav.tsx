"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/studio/works", label: "작품 관리" },
  { href: "/studio/inquiries", label: "커미션 요청함", badgeKey: "inquiries" as const },
  { href: "/studio/sales", label: "매출·정산" },
  { href: "/studio/profile", label: "프로필" },
];

export default function StudioNav({
  artistName,
  newInquiryCount = 0,
}: {
  artistName: string;
  newInquiryCount?: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-48 flex-none border-r border-line py-8 pr-6 md:block">
        <p className="mb-4 text-xs tracking-wide text-ink-faint uppercase">{artistName} 스튜디오</p>
        <nav className="space-y-1">
          {ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const badge = item.badgeKey === "inquiries" && newInquiryCount > 0 ? newInquiryCount : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between border-l-2 px-3 py-2 text-sm ${
                  active ? "border-patina font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
                {badge != null && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center bg-ink px-1.5 text-[11px] font-semibold text-paper">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <a
          href="/studio/logout"
          className="mt-4 block border-l-2 border-transparent px-3 py-2 text-sm text-ink-faint hover:text-ink"
        >
          로그아웃
        </a>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-line bg-paper md:hidden">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const badge = item.badgeKey === "inquiries" && newInquiryCount > 0 ? newInquiryCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 py-3 text-center text-xs whitespace-nowrap ${
                active ? "-mt-px border-t-2 border-patina font-semibold text-patina" : "text-ink-faint"
              }`}
            >
              {item.label}
              {badge != null && (
                <span className="absolute top-1 right-2 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[10px] font-semibold text-paper">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
