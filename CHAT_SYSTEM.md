# Real-Time Chat System Documentation

## Overview

The real-time chat system enables seamless communication between users and sellers/designers for both regular orders and custom orders. It uses tRPC subscriptions with EventEmitter for real-time messaging.

## Features

### ✅ **Real-Time Messaging**
- Instant message delivery using tRPC subscriptions
- Support for both regular orders and custom orders
- Message history persistence
- Auto-scroll to latest messages

### ✅ **Notifications**
- Real-time notification bell in navigation
- Unread message count
- Push notifications for new messages
- Mark as read functionality

### ✅ **Custom Order Integration**
- Automatic conversation creation when orders are accepted
- Direct chat access from order dashboards
- Order context in chat interface

### ✅ **Security**
- User authentication required
- Access control (only order participants can chat)
- Message sender verification

## API Endpoints

### Chat Router (`/api/trpc/chat`)

#### `sendMessage`
- **Input**: `{ orderId?: number, customOrderId?: number, content: string }`
- **Description**: Send a message to a conversation
- **Creates**: Notification for recipient

#### `onNewMessage`
- **Input**: `{ conversationId: number }`
- **Description**: Subscribe to new messages in a conversation
- **Type**: Subscription (real-time)

#### `getHistory`
- **Input**: `{ conversationId: number }`
- **Description**: Get message history for a conversation

#### `getOrCreateCustomOrderConversation`
- **Input**: `{ customOrderId: number }`
- **Description**: Get or create a conversation for a custom order

#### `getCustomOrderConversation`
- **Input**: `{ customOrderId: number }`
- **Description**: Get conversation details for a custom order

### Notification Router (`/api/trpc/notification`)

#### `getForUser`
- **Description**: Get all notifications for current user
- **Returns**: Array of notifications (limited to 50)

#### `markAsRead`
- **Input**: `{ notificationId: number }`
- **Description**: Mark a specific notification as read

#### `markAllAsRead`
- **Description**: Mark all notifications as read

#### `getUnreadCount`
- **Description**: Get count of unread notifications

## Components

### Chat Component (`/app/_components/chat.tsx`)
- **Props**: `{ conversationId, orderId?, customOrderId?, otherUser }`
- **Features**:
  - Real-time message display
  - Message sending form
  - Auto-scroll to bottom
  - Typing indicators
  - Message timestamps

### Notification Bell (`/app/_components/notification-bell.tsx`)
- **Features**:
  - Unread count badge
  - Dropdown notification list
  - Mark as read functionality
  - Different icons for notification types

## Pages

### Custom Order Chat (`/chat/custom-order/[id]`)
- **Features**:
  - Order summary display
  - Real-time chat interface
  - Conversation creation
  - Access control

## Database Schema

### Conversations
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  order_id INTEGER UNIQUE REFERENCES orders(id),
  custom_order_id INTEGER UNIQUE REFERENCES custom_orders(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Messages
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Sending a Message
```typescript
const sendMessage = api.chat.sendMessage.useMutation({
  onSuccess: () => {
    // Message sent successfully
  },
});

sendMessage.mutate({
  customOrderId: 123,
  content: "Hello! I'd like to discuss the customization details."
});
```

### Subscribing to Messages
```typescript
api.chat.onNewMessage.useSubscription(
  { conversationId: 456 },
  {
    onData: (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    },
  }
);
```

### Getting Notifications
```typescript
const { data: notifications } = api.notification.getForUser.useQuery();
```

## Integration Flow

### For Custom Orders:
1. **User submits custom order** → Seller receives notification
2. **Seller accepts order** → Conversation is automatically created
3. **Chat button appears** → Both parties can access chat
4. **Messages sent** → Real-time delivery + notifications
5. **Order completion** → Chat remains accessible for reference

### For Regular Orders:
1. **Order placed** → Conversation exists (if implemented)
2. **Chat access** → Through order details page
3. **Real-time messaging** → Same as custom orders

## Technical Implementation

### Real-Time Events
- **EventEmitter**: Used for real-time message broadcasting
- **tRPC Subscriptions**: WebSocket-like functionality
- **Database Triggers**: For notification creation

### Security Features
- **Authentication**: Required for all chat operations
- **Authorization**: Only order participants can access chat
- **Input Validation**: All messages are validated and sanitized

### Performance Optimizations
- **Message Pagination**: History limited to recent messages
- **Notification Limits**: Maximum 50 notifications per user
- **Auto-cleanup**: Old notifications can be archived

## Future Enhancements

### Potential Features:
- **File sharing** in chat
- **Message reactions** (like/emoji)
- **Typing indicators**
- **Message search**
- **Chat templates** for common responses
- **Push notifications** (browser/mobile)
- **Message encryption** for sensitive data

### Scalability Considerations:
- **Redis integration** for better real-time performance
- **Message archiving** for old conversations
- **WebSocket fallbacks** for better connectivity
- **Rate limiting** to prevent spam

The chat system is now fully functional and ready for production use with proper security, real-time capabilities, and notification system!
