"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "개요", exact: true },
  { href: "/admin/applications", label: "작가 지원" },
  { href: "/admin/inquiries", label: "문의 관리" },
  { href: "/admin/orders", label: "주문 현황" },
  { href: "/admin/customers", label: "고객 조회" },
  { href: "/admin/artists", label: "작가 관리" },
  { href: "/admin/artworks", label: "작품 관리" },
  { href: "/admin/merch", label: "굿즈 관리" },
  { href: "/admin/journal", label: "저널 관리" },
  { href: "/admin/media", label: "사이트 미디어" },
  { href: "/admin/settlements", label: "정산 관리" },
  { href: "/admin/activity", label: "활동 로그" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-48 flex-none border-r border-line py-8 pr-6 md:block">
        <p className="mb-4 text-xs tracking-wide text-ink-faint uppercase">Lumora 어드민</p>
        <nav className="space-y-1">
          {ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block border-l-2 px-3 py-2 text-sm ${
                  active ? "border-patina font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <a
          href="/admin/logout"
          className="mt-4 block border-l-2 border-transparent px-3 py-2 text-sm text-ink-faint hover:text-ink"
        >
          로그아웃
        </a>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-line bg-paper px-1 md:hidden">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-none px-3 py-3 text-center text-xs whitespace-nowrap ${
                active ? "-mt-px border-t-2 border-patina font-semibold text-patina" : "text-ink-faint"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
