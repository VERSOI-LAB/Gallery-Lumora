import { Suspense } from "react";
import SearchBrowser from "@/components/SearchBrowser";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      <h1 className="font-editorial mb-10 text-xl tracking-wide text-ink-soft">Search</h1>
      <Suspense fallback={null}>
        <SearchBrowser />
      </Suspense>
    </div>
  );
}
