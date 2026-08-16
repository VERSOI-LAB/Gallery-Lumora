"use client";

import { useState } from "react";
import { tabClasses } from "@/lib/ui";
import GeneralInquiryForm from "./GeneralInquiryForm";
import ArtistApplicationForm from "./ArtistApplicationForm";

const TABS = [
  { key: "inquiry", label: "문의" },
  { key: "artist", label: "작가/작품 등록" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ContactTabs() {
  const [tab, setTab] = useState<TabKey>("inquiry");

  return (
    <div className="border border-line bg-paper-raised/60 p-6 shadow-[0_1px_3px_rgba(28,27,22,0.05)] md:p-10">
      <div className="mb-8 flex gap-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={tabClasses(tab === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "inquiry" ? <GeneralInquiryForm /> : <ArtistApplicationForm />}
    </div>
  );
}
