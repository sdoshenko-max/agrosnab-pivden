import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { productImageCodes, productImageSlugs } from "@/lib/_image-manifest";

type Props = {
  product: Product;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

// Маніфест формується скриптом scripts/_generate_image_manifest.mjs (запускається у prebuild),
// тож src вибирається синхронно при SSR — без post-mount onError-fallback, який ламався при гонці гідратації:
// 404 від <img> прилітав до того, як React встигав прив'язати обробник, і fallback не спрацьовував.
export function ProductImage({ product, alt, size = "md", className, priority = false }: Props) {
  const src = productImageCodes.has(product.code)
    ? `/products/${product.code}.jpg`
    : productImageSlugs.has(product.slug)
      ? `/products/${product.slug}.jpg`
      : null;

  if (!src) {
    return <ProductPlaceholder product={product} size={size} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
