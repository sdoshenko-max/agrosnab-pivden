"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "./ProductPlaceholder";

type Props = {
  product: Product;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

// Ланцюг fallback для фото товару:
// 1) /products/<code>.jpg — фото конкретної фасовки (унікальне)
// 2) /products/<slug>.jpg — старе generic-фото товара (одне на всі фасовки)
// 3) <ProductPlaceholder /> — SVG-плашка з абревіатурою назви
export function ProductImage({ product, alt, size = "md", className }: Props) {
  type Tier = "code" | "slug" | "placeholder";
  const [tier, setTier] = useState<Tier>("code");

  if (tier === "placeholder") {
    return <ProductPlaceholder product={product} size={size} />;
  }

  const src = tier === "code"
    ? `/products/${product.code}.jpg`
    : `/products/${product.slug}.jpg`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setTier(tier === "code" ? "slug" : "placeholder")}
    />
  );
}
