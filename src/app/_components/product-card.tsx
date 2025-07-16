"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState } from "react";
import type { RouterOutputs } from "~/trpc/react";

type ProductWithSeller = RouterOutputs["product"]["getAll"][number];

export function ProductCard({ product }: { product: ProductWithSeller }) {
    const { data: session } = useSession();
    const [isAdding, setIsAdding] = useState(false);

    const addToCartMutation = api.cart.add.useMutation({
        onSuccess: () => {
            setIsAdding(false);
            alert("Product added to cart!");
        },
        onError: (error) => {
            setIsAdding(false);
            alert(`Error: ${error.message}`);
        },
    });

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!session) {
            alert("Please login to add items to cart");
            return;
        }

        setIsAdding(true);
        addToCartMutation.mutate({
            productId: product.id,
            quantity: 1,
        });
    };

    return (
        <div className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
            <Link href={`/product/${product.id}`}>
                <div className="relative h-56 w-full overflow-hidden">                <Image 
                    src={product.imageUrl ?? `https://placehold.co/400x300/E0E7FF/4F46E5?text=${encodeURIComponent(product.name)}`}
                    alt={`Image for ${product.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>
            <div className="p-4">
                <Link href={`/shop/${product.seller.id}`} className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    by {product.seller.user.fullName}
                </Link>
                <Link href={`/product/${product.id}`}>
                    <h3 className="mt-1 truncate text-lg font-semibold text-gray-900 hover:text-indigo-600">{product.name}</h3>
                </Link>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-indigo-600">
                        ${product.price.toLocaleString("en-US")}
                    </p>
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="h-56 w-full animate-pulse rounded-lg bg-gray-200"></div>
            <div className="mt-4 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-7 w-1/2 animate-pulse rounded bg-gray-200 pt-4"></div>
            </div>
        </div>
    );
}
