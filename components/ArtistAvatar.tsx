import Image from "next/image";
import PlaceholderArt from "./PlaceholderArt";

/** Renders the artist's uploaded avatar photo when set, falling back to the
 * procedural portrait PlaceholderArt otherwise. */
export default function ArtistAvatar({
  avatarUrl,
  hue,
  seed,
  className = "",
  sizes = "(max-width: 768px) 50vw, 300px",
}: {
  avatarUrl: string | null;
  hue: number;
  seed: string;
  className?: string;
  sizes?: string;
}) {
  if (avatarUrl) {
    return (
      <div className={`relative ${className}`}>
        <Image src={avatarUrl} alt="" fill sizes={sizes} className="object-cover" unoptimized />
      </div>
    );
  }

  return <PlaceholderArt hue={hue} seed={seed} kind="portrait" className={className} />;
}
