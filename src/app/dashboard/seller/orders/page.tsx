"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Loader2, Package, Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const { data: orders, isLoading, error, refetch } = api.order.getForSeller.useQuery(
    undefined,
    { enabled: session?.user?.role === "seller" }
  );

  const updateOrderMutation = api.order.updateStatus.useMutation({
    onSuccess: () => {
      alert("Order status updated successfully!");
      refetch();
    },
    onError: (err) => {
      alert(`Failed to update order: ${err.message}`);
    },
  });

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "seller") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in as a seller to access this page.</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Orders</h1>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage your customer orders</p>
          </div>
          <Link
            href="/dashboard/seller"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">You haven't received any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                  <p className="text-gray-600">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Customer: {order.user?.fullName || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Items:</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.product?.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
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

              {/* Action buttons */}
              <div className="border-t pt-4 mt-4">
                <div className="flex space-x-3">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        disabled={updateOrderMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        disabled={updateOrderMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
