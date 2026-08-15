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
    <div className="mx-auto max-w-lg px-5 pb-24 md:px-8">
      <div className="mb-10 flex justify-center gap-8 border-b border-line">
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
