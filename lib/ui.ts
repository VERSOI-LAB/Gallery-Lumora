type Variant = "primary" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none";

const filledSizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  sm: "px-3.5 py-2 text-xs",
};

const ghostSizes: Record<Size, string> = {
  md: "text-sm",
  sm: "text-xs",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  if (variant === "ghost") {
    return `${base} bg-transparent text-ink underline-offset-4 hover:underline ${ghostSizes[size]}`;
  }
  return `${base} bg-patina text-paper hover:opacity-90 ${filledSizes[size]}`;
}

/** Plain-text tab/filter treatment shared by tab bars and filter rows: an
 * underline on the active item, no box/fill, matching the rest of the site's
 * borderless, hairline-only visual language. */
export function tabClasses(active: boolean, size: Size = "md") {
  const sizeClass = size === "sm" ? "pb-2 text-xs" : "pb-3 text-sm";
  return `border-b-2 font-medium transition-colors ${sizeClass} ${
    active ? "border-patina text-ink" : "border-transparent text-ink-faint hover:text-ink"
  }`;
}
