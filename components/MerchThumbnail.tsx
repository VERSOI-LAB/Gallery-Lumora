import Image from "next/image";
import PlaceholderArt from "./PlaceholderArt";

/** Renders the product's first real uploaded photo when one exists, falling
 * back to the procedural PlaceholderArt for products without photos yet. */
export default function MerchThumbnail({
  imageUrls,
  hue,
  variant,
  seed,
  className = "",
  sizes = "(max-width: 768px) 50vw, 400px",
}: {
  imageUrls: string[];
  hue: number;
  variant: number;
  seed: string;
  className?: string;
  sizes?: string;
}) {
  if (imageUrls.length > 0) {
    return (
      <div className={`relative ${className}`}>
        <Image src={imageUrls[0]} alt="" fill sizes={sizes} className="object-cover" unoptimized />
      </div>
    );
  }

  return <PlaceholderArt hue={hue} variant={variant} seed={seed} className={className} />;
}
