"use client";

import { useState } from "react";
import { FAQ_SECTIONS } from "@/lib/faqContent";

export default function CustomerCenterFaq() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div>
      <nav className="mb-10 flex flex-wrap gap-x-4 gap-y-2 border-b border-line pb-6 text-xs text-ink-soft">
        {FAQ_SECTIONS.map((section) => (
          <a
            key={section.number}
            href={`#faq-${section.number}`}
            className="hover:text-patina hover:underline"
          >
            {section.number}. {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.number} id={`faq-${section.number}`} className="scroll-mt-24">
            <h2 className="mb-4 font-display text-lg">
              {section.number}. {section.title}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {section.items.map((item, i) => {
                const key = `${section.number}-${i}`;
                const open = openKeys.has(key);
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      aria-expanded={open}
                      className="flex w-full items-start justify-between gap-4 py-4 text-left text-sm"
                    >
                      <span className="flex-1 font-medium text-ink">Q. {item.q}</span>
                      <span
                        className={`mt-0.5 flex-none text-ink-faint transition-transform ${open ? "rotate-45" : ""}`}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>
                    {open && (
                      <p className="mb-4 -mt-1 text-sm leading-7 whitespace-pre-line text-ink-soft">
                        A. {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
