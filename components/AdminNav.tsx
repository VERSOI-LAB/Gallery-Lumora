"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/applications", label: "작가 지원" },
  { href: "/admin/inquiries", label: "문의 관리" },
  { href: "/admin/orders", label: "주문 현황" },
  { href: "/admin/journal", label: "저널 관리" },
  { href: "/admin/media", label: "사이트 미디어" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-48 flex-none border-r border-line py-8 pr-6 md:block">
        <p className="mb-4 text-xs tracking-wide text-ink-faint uppercase">Lumora 어드민</p>
        <nav className="space-y-1">
          {ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
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
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper md:hidden">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-3 text-center text-xs ${
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
