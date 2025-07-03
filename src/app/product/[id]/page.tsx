"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const { data: product, isLoading } = api.product.getById.useQuery({ id: productId });

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

  const handleAddToCart = () => {
    if (!session) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    addToCartMutation.mutate({
      productId: product!.id,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button
            onClick={() => router.push("/")}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl ?? `https://placehold.co/500x500/E0E7FF/4F46E5?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">by {product.seller.user.fullName}</p>
          </div>

          <div className="text-3xl font-bold text-indigo-600">
            Rp {product.price.toLocaleString("id-ID")}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isAdding ? "Adding to Cart..." : "Add to Cart"}
              </button>
              
              <button
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => router.push("/cart"), 1000);
                }}
                disabled={isAdding}
                className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{product.seller.user.fullName}</p>
              <p className="text-gray-600 text-sm">{product.seller.storeName}</p>
              {product.seller.description && (
                <p className="text-gray-700 text-sm mt-2">{product.seller.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
