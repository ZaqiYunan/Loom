"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { ArrowLeft, Package, User, Clock } from "lucide-react";
import Link from "next/link";
import Chat from "~/app/_components/chat";
import CustomOrderPayment from "~/app/_components/custom-order-payment";

export default function CustomOrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const customOrderId = parseInt(params.id as string);

  // Get conversation details
  const { data: conversationData, isLoading } = api.chat.getCustomOrderConversation.useQuery(
    { customOrderId },
    { enabled: !!customOrderId && !!session }
  );

  // Get or create conversation
  const createConversationMutation = api.chat.getOrCreateCustomOrderConversation.useMutation({
    onSuccess: () => {
      // Refetch conversation data
      window.location.reload();
    },
  });

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
          <h1 className="text-2xl font-bold mb-4">Please log in to view this chat</h1>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Custom Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            The custom order you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/orders/custom"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Custom Orders
          </Link>
        </div>
      </div>
    );
  }

  const { conversation, customOrder, otherUser } = conversationData;

  // Create conversation if it doesn't exist
  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Start Conversation</h1>
          <p className="text-gray-600 mb-6">
            No conversation exists for this custom order yet. Click below to start chatting.
          </p>
          <button
            onClick={() => createConversationMutation.mutate({ customOrderId })}
            disabled={createConversationMutation.isPending}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : 0;
  const isCustomer = customOrder.userId === currentUserId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Custom Order Chat</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start space-x-4">
            {/* Order Image */}
            {customOrder.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={customOrder.imageUrl}
                  alt="Custom order item"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Order Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold">Custom Order #{customOrder.id}</span>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  customOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                  customOrder.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  customOrder.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {customOrder.status.charAt(0).toUpperCase() + customOrder.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>
                    {isCustomer ? 'Designer' : 'Customer'}: {otherUser.fullName}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created: {new Date(customOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">
                {customOrder.description}
              </p>
            </div>
          </div>

          {/* Payment Section - show for customers when order is accepted and has final price */}
          {isCustomer && customOrder.status === 'accepted' && customOrder.finalPrice && (
            <div className="mt-4">
              <CustomOrderPayment
                orderId={customOrder.id}
                amount={customOrder.finalPrice}
                paymentStatus={customOrder.paymentStatus || 'PENDING'}
                onUpdate={() => window.location.reload()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Component */}
      <div className="h-96">
        <Chat
          conversationId={conversation.id}
          customOrderId={customOrder.id}
          otherUser={otherUser}
        />
      </div>
    </div>
  );
}
