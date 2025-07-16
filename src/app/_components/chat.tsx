"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Send, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  createdAt: Date;
  sender: {
    id: number;
    fullName: string;
  };
}

interface ChatProps {
  conversationId: number;
  orderId?: number;
  customOrderId?: number;
  otherUser: {
    id: number;
    fullName: string;
  };
}

export default function Chat({ conversationId, orderId, customOrderId, otherUser }: ChatProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : 0;

  // Get message history
  const { data: messageHistory } = api.chat.getHistory.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  // Send message mutation
  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      setMessage("");
      // Message will be added via subscription
    },
    onError: (error) => {
      alert(`Error sending message: ${error.message}`);
    },
  });

  // Poll for new messages instead of using subscriptions
  const { data: latestMessages } = api.chat.getHistory.useQuery(
    { conversationId },
    { 
      enabled: !!conversationId,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true,
    }
  );

  // Load message history when available
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  // Update messages when new ones are polled
  useEffect(() => {
    if (latestMessages && latestMessages.length > messages.length) {
      setMessages(latestMessages);
    }
  }, [latestMessages, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message,
      ...(orderId && { orderId }),
      ...(customOrderId && { customOrderId }),
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {otherUser.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
            <p className="text-sm text-gray-500">
              {customOrderId ? `Custom Order #${customOrderId}` : `Order #${orderId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-500'
                }`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || !message.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
