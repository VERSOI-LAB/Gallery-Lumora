const LAYOUTS = [
  ["30% 20%", "75% 65%", "15% 80%"],
  ["70% 25%", "20% 60%", "80% 85%"],
  ["50% 15%", "15% 55%", "85% 70%"],
];

export default function PlaceholderArt({
  hue = 90,
  variant = 0,
  className = "",
}: {
  hue?: number;
  variant?: number;
  className?: string;
}) {
  const c1 = `hsl(${hue} 38% 90%)`;
  const c2 = `hsl(${(hue + 40) % 360} 32% 74%)`;
  const c3 = `hsl(${(hue + 210) % 360} 26% 52%)`;
  const [p1, p2, p3] = LAYOUTS[variant % LAYOUTS.length];

  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundColor: "#efe9d8",
        backgroundImage: `radial-gradient(circle at ${p1}, ${c3} 0%, transparent 55%), radial-gradient(circle at ${p2}, ${c2} 0%, transparent 60%), radial-gradient(circle at ${p3}, ${c1} 0%, transparent 65%)`,
      }}
    />
  );
}
