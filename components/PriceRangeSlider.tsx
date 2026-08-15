"use client";

export default function PriceRangeSlider({
  steps,
  labelFor,
  value,
  onChange,
}: {
  steps: number[];
  labelFor: (amount: number) => string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [minIdx, maxIdx] = value;
  const lastIdx = steps.length - 1;
  const minPct = (minIdx / lastIdx) * 100;
  const maxPct = (maxIdx / lastIdx) * 100;

  function setMin(next: number) {
    onChange([Math.min(next, maxIdx), maxIdx]);
  }

  function setMax(next: number) {
    onChange([minIdx, Math.max(next, minIdx)]);
  }

  return (
    <div>
      <div className="dual-range">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-patina"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={lastIdx}
          value={minIdx}
          onChange={(e) => setMin(Number(e.target.value))}
          aria-label="최소 가격"
        />
        <input
          type="range"
          min={0}
          max={lastIdx}
          value={maxIdx}
          onChange={(e) => setMax(Number(e.target.value))}
          aria-label="최대 가격"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span>{labelFor(steps[minIdx])}</span>
        <span>{labelFor(steps[maxIdx])}</span>
      </div>
    </div>
  );
}
