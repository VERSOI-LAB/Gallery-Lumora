import Image from "next/image";

const LAYOUTS = [
  ["30% 20%", "75% 65%", "15% 80%"],
  ["70% 25%", "20% 60%", "80% 85%"],
  ["50% 15%", "15% 55%", "85% 70%"],
];

function pravatarUrl(seed: string) {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;
}

function picsumUrl(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/700`;
}

export default function PlaceholderArt({
  hue = 90,
  variant = 0,
  seed,
  kind = "scene",
  className = "",
}: {
  hue?: number;
  variant?: number;
  seed?: string;
  kind?: "scene" | "portrait";
  className?: string;
}) {
  void hue;
  const [p1, p2, p3] = LAYOUTS[variant % LAYOUTS.length];

  const backdropStyle = {
    backgroundColor: "#f2f2f2",
    backgroundImage: `radial-gradient(circle at ${p1}, #bfbfbf 0%, transparent 55%), radial-gradient(circle at ${p2}, #d9d9d9 0%, transparent 60%), radial-gradient(circle at ${p3}, #ececec 0%, transparent 65%)`,
  };

  if (!seed) {
    return <div aria-hidden className={className} style={backdropStyle} />;
  }

  return (
    <div aria-hidden className={`relative ${className}`} style={backdropStyle}>
      <Image
        src={kind === "portrait" ? pravatarUrl(seed) : picsumUrl(seed)}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 400px"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
