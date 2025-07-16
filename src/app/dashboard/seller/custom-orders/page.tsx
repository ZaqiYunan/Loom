"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function SellerCustomOrdersPage() {
  const { data: session, status } = useSession();
  const { data: customOrders, isLoading, refetch } = api.customOrder.getForSeller.useQuery(
    undefined,
    { enabled: session?.user?.role === "seller" }
  );

  const updateStatusMutation = api.customOrder.updateStatus.useMutation({
    onSuccess: () => {
      alert("Custom order status updated successfully!");
      refetch();
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateCourierMutation = api.customOrder.updateCourierStatus.useMutation({
    onSuccess: () => {
      alert("Courier status updated successfully!");
      refetch();
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleStatusUpdate = (customOrderId: number, status: string) => {
    updateStatusMutation.mutate({ 
      customOrderId, 
      status: status as "pending" | "accepted" | "rejected" | "completed" 
    });
  };

  const handleCourierUpdate = (courierRequestId: number, status: string) => {
    updateCourierMutation.mutate({ 
      courierRequestId, 
      status: status as "requested" | "picked_up" | "delivered" | "cancelled" 
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Custom Orders</h1>
          <p className="text-gray-600">Manage customer customization requests</p>
        </div>
        <Link
          href="/dashboard/seller"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {!customOrders || customOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Orders Yet</h3>
          <p className="text-gray-600">You haven't received any custom order requests yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {customOrders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Custom Order #{order.id}</h2>
                  <p className="text-gray-600">
                    Customer: {order.user?.fullName} ({order.user?.email})
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

              {/* Customer's Item Image */}
              {order.imageUrl && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Customer's Item:</h3>
                  <div className="relative inline-block">
                    <img
                      src={order.imageUrl}
                      alt="Customer item"
                      className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        // Fallback for broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {order.imageUrl.startsWith('http') && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customization Request */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Customization Request:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {order.description}
                  </p>
                </div>
              </div>

              {/* Courier Information */}
              {order.courierRequest && (
                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Courier Pickup Request</h3>
                    </div>
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
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
                    <p><strong>Address:</strong> {order.courierRequest.address}</p>
                    <p><strong>Requested Pickup:</strong> {new Date(order.courierRequest.pickupTime).toLocaleString()}</p>
                  </div>
                  
                  {/* Courier Action Buttons */}
                  {order.courierRequest.status === 'requested' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleCourierUpdate(order.courierRequest.id, 'picked_up')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        disabled={updateCourierMutation.isPending}
                      >
                        Mark as Picked Up
                      </button>
                      <button
                        onClick={() => handleCourierUpdate(order.courierRequest.id, 'cancelled')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        disabled={updateCourierMutation.isPending}
                      >
                        Cancel Pickup
                      </button>
                    </div>
                  )}
                  
                  {order.courierRequest.status === 'picked_up' && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleCourierUpdate(order.courierRequest.id, 'delivered')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        disabled={updateCourierMutation.isPending}
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-3">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject Order</span>
                      </button>
                    </>
                  )}

                  {order.status === 'accepted' && (
                    <>
                      <Link
                        href={`/chat/custom-order/${order.id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat with Customer</span>
                      </Link>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Completed</span>
                      </button>
                    </>
                  )}

                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
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
