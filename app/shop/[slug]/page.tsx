import Link from "next/link";
import { notFound } from "next/navigation";
import MerchPurchaseForm from "@/components/MerchPurchaseForm";
import PlaceholderArt from "@/components/PlaceholderArt";
import {
  getMerchEditionsRemaining,
  getMerchProduct,
  getMerchProductSlugs,
  getMerchVariants,
} from "@/lib/queries";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";

export async function generateStaticParams() {
  const slugs = await getMerchProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function MerchProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getMerchProduct(slug);
  if (!product) notFound();

  const [variants, editionsRemaining] = await Promise.all([
    product.hasVariants ? getMerchVariants(product.id) : Promise.resolve([]),
    product.fulfillment === "edition" ? getMerchEditionsRemaining(product.id) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <p className="mb-6 text-xs text-ink-faint">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>{" "}
        / {getMerchCategoryLabel(product.category)}
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <PlaceholderArt
            hue={product.hue}
            variant={product.variant}
            seed={product.slug}
            className="aspect-square w-full"
          />
        </div>

        <div>
          <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
            {getMerchCategoryLabel(product.category)}
          </span>
          <h1 className="mt-2 mb-2 font-display text-2xl">{product.title}</h1>
          <Link
            href={`/works/${product.artworkSlug}`}
            className="text-sm text-patina hover:underline"
          >
            {product.artistName}의 «{product.artworkTitle}» 기반 →
          </Link>

          {product.description && (
            <p className="mt-4 text-sm leading-7 text-ink-soft">{product.description}</p>
          )}

          <div className="mt-8">
            <MerchPurchaseForm
              product={product}
              variants={variants}
              editionsRemaining={editionsRemaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
