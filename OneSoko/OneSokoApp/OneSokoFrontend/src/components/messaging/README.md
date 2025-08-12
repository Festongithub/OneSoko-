# Enhanced Messaging System Documentation

## Overview

The OneSoko messaging system provides a comprehensive communication platform between customers and shop owners. The system includes direct messaging, product inquiries, real-time notifications, and conversation management.

## Features

### ✅ Core Messaging Features
- **Direct Messaging**: One-on-one conversations between users and shop owners
- **Product Inquiries**: Context-aware messaging about specific products
- **Shop Contact**: Direct communication with shop owners from shop pages
- **Real-time Notifications**: Unread message counters and badges
- **Conversation History**: Persistent message history and conversation threads
- **Message Status**: Read/unread status tracking

### ✅ User Interface Components

#### 1. MessagesCenter (`src/components/MessagesCenter.tsx`)
- Main messaging interface with conversation list and chat area
- Real-time message updates every 30 seconds
- Enhanced UI with message bubbles, timestamps, and context
- Support for shop/product context in messages

#### 2. MessageShopOwner (`src/components/messaging/MessageShopOwner.tsx`)
- Modal component for contacting shop owners
- Authentication check and login redirect
- Success confirmation and redirection to messages
- Support for shop context

#### 3. ProductInquiry (`src/components/messaging/ProductInquiry.tsx`)
- Product-specific inquiry modal
- Pre-filled message templates
- Product context display
- Direct integration with product cards

#### 4. MessageNotificationIcon (`src/components/messaging/MessageNotificationIcon.tsx`)
- Navbar notification icon with unread count badge
- Auto-updating unread count (polling every 30 seconds)
- Responsive design with 99+ overflow handling

### ✅ Integration Points

#### 1. Shop Details Page
- "Contact Shop Owner" button integrated into shop header
- Modal-based messaging without leaving the page
- Seamless authentication flow

#### 2. Product Cards
- "Ask Question" button on each product card
- Product-specific inquiry with context
- Enhanced product interaction

#### 3. Navigation
- Message icon in navbar with unread count
- Quick access to messaging center
- Sidebar navigation integration

## API Endpoints

### Backend Messaging API
```
/api/messages/                     - List/Create messages
/api/messages/conversations/       - Get conversation list
/api/messages/with_user/          - Get messages with specific user
/api/messages/unread_count/       - Get unread message count
/api/messages/{id}/mark_as_read/  - Mark specific message as read
/api/messages/mark_all_as_read/   - Mark all messages as read
/api/messages/sent/               - Get sent messages
```

### Frontend API Integration
```typescript
// messagesAPI from src/services/api.ts
messagesAPI.getConversations()           // Get all conversations
messagesAPI.getWithUser(userId)          // Get conversation with user
messagesAPI.send(messageData)            // Send new message
messagesAPI.markAsRead(messageId)        // Mark message as read
messagesAPI.markAllAsRead()              // Mark all as read
messagesAPI.getUnreadCount()             // Get unread count
```

## Message Data Structure

### Message Interface
```typescript
interface Message {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  is_read: boolean;
  timestamp: string;
  shop: Shop | null;      // Optional shop context
  product: Product | null; // Optional product context
}
```

### Conversation Interface
```typescript
interface Conversation {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  latest_message: {
    content: string;
    timestamp: string;
    is_from_me: boolean;
  };
  unread_count: number;
}
```

## Usage Examples

### 1. Contact Shop Owner
```tsx
import MessageShopOwner from '../components/messaging/MessageShopOwner';

const [showMessageModal, setShowMessageModal] = useState(false);

// In JSX
<button onClick={() => setShowMessageModal(true)}>
  Contact Shop Owner
</button>

<MessageShopOwner
  shop={shop}
  isOpen={showMessageModal}
  onClose={() => setShowMessageModal(false)}
/>
```

### 2. Product Inquiry
```tsx
import ProductInquiry from '../components/messaging/ProductInquiry';

const [showInquiry, setShowInquiry] = useState(false);

// In JSX
<button onClick={() => setShowInquiry(true)}>
  Ask Question
</button>

<ProductInquiry
  product={product}
  shop={shop}
  isOpen={showInquiry}
  onClose={() => setShowInquiry(false)}
/>
```

### 3. Message Notifications
```tsx
import MessageNotificationIcon from '../components/messaging/MessageNotificationIcon';

// In Navbar
<MessageNotificationIcon />
```

## Authentication & Security

### Authentication Requirements
- Users must be logged in to send messages
- Automatic redirect to login page for unauthenticated users
- JWT token-based authentication for API calls

### Security Features
- Rate limiting on message sending (backend)
- Content sanitization (backend)
- User permission validation (users can only see their own messages)
- CSRF protection and secure headers

## Performance Optimizations

### Frontend Optimizations
- Conversation caching (5-minute TTL)
- Debounced search functionality
- Lazy loading of message history
- Optimistic UI updates

### Backend Optimizations
- Database query optimization with proper indexing
- Cache layer for frequently accessed data
- Pagination for large conversation lists
- Background processing for notifications

## Future Enhancements

### Planned Features
1. **Real-time Messaging**: WebSocket integration for instant messaging
2. **File Attachments**: Support for image and document sharing
3. **Message Reactions**: Like/react to messages
4. **Typing Indicators**: Show when someone is typing
5. **Message Search**: Search within conversation history
6. **Group Messaging**: Multi-participant conversations
7. **Message Templates**: Pre-defined quick responses for shop owners
8. **Push Notifications**: Browser and mobile push notifications

### Technical Improvements
1. **Infinite Scroll**: Better pagination for long conversations
2. **Message Encryption**: End-to-end encryption for sensitive data
3. **Offline Support**: PWA features for offline message access
4. **Performance Monitoring**: Real-time performance metrics
5. **A/B Testing**: Testing different UI/UX approaches

## Testing

### Manual Testing Checklist
- [ ] Send message from shop details page
- [ ] Send product inquiry from product card
- [ ] View conversations in messages center
- [ ] Mark messages as read/unread
- [ ] Check unread count updates
- [ ] Test authentication flows
- [ ] Verify mobile responsiveness

### Automated Testing
```bash
# Run component tests
npm test messaging

# Run E2E tests
npm run e2e:messaging
```

## Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check authentication status
   - Verify API endpoint connectivity
   - Check browser console for errors

2. **Unread count not updating**
   - Check polling interval (30 seconds)
   - Verify API response format
   - Clear browser cache

3. **Conversation not loading**
   - Check user permissions
   - Verify conversation exists
   - Check network connectivity

### Debug Mode
Enable debug mode in development:
```typescript
localStorage.setItem('debug_messaging', 'true');
```

## Contributing

When contributing to the messaging system:

1. Follow existing code patterns and naming conventions
2. Add proper TypeScript types for new interfaces
3. Include error handling and loading states
4. Test authentication flows thoroughly
5. Update this documentation for any new features

## License

This messaging system is part of the OneSoko platform and follows the same licensing terms.
