"use client";

import { useState } from "react";
import type { Product } from "@/lib/data";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";

export function CityProductsList({ products }: { products: Product[] }) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<string>("");

  function openRequest(productName: string) {
    setRequestProduct(productName);
    setRequestOpen(true);
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCardFull key={p.slug} product={p} lang="uk" onRequest={openRequest} />
        ))}
      </div>
      <RequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        productName={requestProduct}
        lang="uk"
      />
    </>
  );
}
