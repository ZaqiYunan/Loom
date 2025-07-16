"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, Plus } from "lucide-react";
import Link from "next/link";

export default function CustomOrdersPage() {
  const { data: session, status } = useSession();
  const { data: customOrders, isLoading } = api.customOrder.getForUser.useQuery(
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
          <h1 className="text-2xl font-bold mb-4">Please log in to view your custom orders</h1>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Custom Orders</h1>
          <p className="text-gray-600">Track your fashion customization requests</p>
        </div>
        <Link
          href="/orders/custom/new"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Custom Order</span>
        </Link>
      </div>

      {!customOrders || customOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Orders Yet</h3>
          <p className="text-gray-600 mb-6">You haven't submitted any custom fashion orders yet.</p>
          <Link
            href="/orders/custom/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Submit Your First Custom Order</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {customOrders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Custom Order #{order.id}</h2>
                  <p className="text-gray-600">
                    Designer: {order.seller?.storeName} ({order.seller?.user?.fullName})
                  </p>
                  <p className="text-gray-500 text-sm">
                    Submitted on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Image */}
              {order.imageUrl && (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={order.imageUrl}
                      alt="Custom order item"
                      className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        // Fallback for broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {order.imageUrl.startsWith('http') && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Description */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Customization Request:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {order.description}
                </p>
              </div>

              {/* Courier Information */}
              {order.courierRequest && (
                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Courier Pickup</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.courierRequest.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.courierRequest.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                      order.courierRequest.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.courierRequest.status.replace('_', ' ').charAt(0).toUpperCase() + 
                       order.courierRequest.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Address:</strong> {order.courierRequest.address}</p>
                    <p><strong>Pickup Time:</strong> {new Date(order.courierRequest.pickupTime).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  
                  {order.status === 'accepted' && (
                    <Link
                      href={`/chat/custom-order/${order.id}`}
                      className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                      <span>Chat with Designer</span>
                    </Link>
                  )}

                  {order.status === 'pending' && (
                    <span className="flex items-center space-x-2 text-yellow-600 px-4 py-2">
                      <Clock className="h-4 w-4" />
                      <span>Waiting for designer response</span>
                    </span>
                  )}

                  {order.status === 'completed' && (
                    <span className="flex items-center space-x-2 text-green-600 px-4 py-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Order completed</span>
                    </span>
                  )}

                  {order.status === 'rejected' && (
                    <span className="flex items-center space-x-2 text-red-600 px-4 py-2">
                      <XCircle className="h-4 w-4" />
                      <span>Order rejected</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
