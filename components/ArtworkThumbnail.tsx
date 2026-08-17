import Image from "next/image";
import PlaceholderArt from "./PlaceholderArt";

/** Renders the artwork's first real uploaded photo when one exists, falling
 * back to the procedural PlaceholderArt for artworks without photos yet. */
export default function ArtworkThumbnail({
  imageUrls,
  hue,
  variant,
  seed,
  className = "",
  sizes = "(max-width: 768px) 50vw, 400px",
  fit = "cover",
}: {
  imageUrls: string[];
  hue: number;
  variant: number;
  seed: string;
  className?: string;
  sizes?: string;
  fit?: "cover" | "contain";
}) {
  if (imageUrls.length > 0) {
    return (
      <div className={`relative ${fit === "contain" ? "bg-paper-raised" : ""} ${className}`}>
        <Image
          src={imageUrls[0]}
          alt=""
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          unoptimized
        />
      </div>
    );
  }

  return <PlaceholderArt hue={hue} variant={variant} seed={seed} className={className} />;
}
