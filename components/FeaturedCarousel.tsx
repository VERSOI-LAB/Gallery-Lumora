"use client";

import { useEffect, useState } from "react";

export interface FeaturedSlide {
  key: string;
  image: React.ReactNode;
  caption: React.ReactNode;
}

export default function FeaturedCarousel({ slides }: { slides: FeaturedSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div className="mb-12">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.key} className="grid w-full flex-none grid-cols-1 md:grid-cols-[1.3fr_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-[440px]">
                {slide.image}
              </div>
              <div className="flex flex-col justify-center gap-3 p-8 md:p-12">{slide.caption}</div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-5 py-3">
          <button
            type="button"
            onClick={prev}
            aria-label="이전 슬라이드"
            className="text-lg text-ink-faint hover:text-ink"
          >
            ‹
          </button>
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 슬라이드로 이동`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-ink" : "bg-line-strong"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="다음 슬라이드"
            className="text-lg text-ink-faint hover:text-ink"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
