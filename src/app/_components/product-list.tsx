"use client";

import { api } from "~/trpc/react";
// import { ProductCard, ProductCardSkeleton } from "./product-card";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card";

export function ProductList() {
  const { data: products, isLoading, error } = api.product.getAll.useQuery();

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">An error occurred while loading products: {error.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-gray-500">No products are currently available.</div>;
  }

  return (
    <div>
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Products
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
  );
}
