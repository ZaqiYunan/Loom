"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "~/types";

export function CartView() {
  const router = useRouter();
  const { data: cartItems, isLoading, refetch } = api.cart.get.useQuery();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const updateQuantityMutation = api.cart.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsUpdating(null);
    },
  });

  const removeItemMutation = api.cart.remove.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const clearCartMutation = api.cart.clear.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleUpdateQuantity = (cartItemId: number, quantity: number) => {
    if (quantity <= 0) return;
    setIsUpdating(cartItemId);
    updateQuantityMutation.mutate({ cartItemId, quantity });
  };

  const handleRemoveItem = (cartItemId: number) => {
    removeItemMutation.mutate({ cartItemId });
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      clearCartMutation.mutate();
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
        <button
          onClick={() => router.push("/")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-sm border">
        {cartItems.map((item: CartItem) => (
          <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {item.product.imageUrl ? (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating === item.id || item.quantity <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating === item.id}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-600 hover:text-red-800 p-2"
                title="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-indigo-600">
            ${calculateTotal(cartItems).toFixed(2)}
          </span>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleClearCart}
            disabled={clearCartMutation.isPending}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Clear Cart
          </button>
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
