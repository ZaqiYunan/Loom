"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import type { Order } from "~/types";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const { data: orders, isLoading } = api.order.getForUser.useQuery(
    undefined,
    { enabled: !!session }
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
          <a href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      
      {!orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-4">You haven&apos;t placed any orders yet</div>
          <a
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                  <p className="text-gray-600">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-sm rounded-full mt-2 ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Items:</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-gray-600 text-sm">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
