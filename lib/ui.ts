type Variant = "primary" | "ghost" | "outline";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-medium tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-patina border border-patina text-paper hover:opacity-90",
  ghost: "bg-transparent border border-ink text-ink hover:bg-ink/5",
  outline: "bg-transparent border border-patina text-patina hover:bg-patina-soft",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3",
  sm: "px-3.5 py-2 text-xs",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
