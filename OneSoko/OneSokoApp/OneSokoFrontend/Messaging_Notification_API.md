# Messaging & Notification API Documentation

## Overview
The Messaging & Notification APIs provide comprehensive communication features for the OneSoko platform. Users can send messages to each other, manage conversations, and receive notifications for various events.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All Messaging & Notification API endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

# 📨 **MESSAGING API**

## Message Endpoints

### 1. Create Message
**POST** `/api/messages/`

Send a new message to another user.

**Request Body:**
```json
{
    "recipient": 2,
    "content": "Hello! I'm interested in your product.",
    "shop": null,
    "product": null
}
```

**Response (201 Created):**
```json
{
    "id": 1,
    "sender": "user1",
    "recipient": "user2",
    "content": "Hello! I'm interested in your product.",
    "is_read": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "shop": null,
    "product": null
}
```

### 2. List All Messages (Sent & Received)
**GET** `/api/messages/`

Get all messages sent and received by the current user.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "sender": "user1",
        "recipient": "user2",
        "content": "Hello! I'm interested in your product.",
        "is_read": false,
        "timestamp": "2024-01-15T10:30:00Z",
        "shop": null,
        "product": null
    }
]
```

### 3. Get Sent Messages
**GET** `/api/messages/sent/`

Get all messages sent by the current user.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "sender": "user1",
        "recipient": "user2",
        "content": "Hello! I'm interested in your product.",
        "is_read": false,
        "timestamp": "2024-01-15T10:30:00Z",
        "shop": null,
        "product": null
    }
]
```

### 4. Get Received Messages
**GET** `/api/messages/received/`

Get all messages received by the current user.

**Response (200 OK):**
```json
[
    {
        "id": 2,
        "sender": "user2",
        "recipient": "user1",
        "content": "Thanks for your interest! Here are the details...",
        "is_read": false,
        "timestamp": "2024-01-15T11:00:00Z",
        "shop": null,
        "product": null
    }
]
```

### 5. Get Unread Message Count
**GET** `/api/messages/unread_count/`

Get the count of unread messages.

**Response (200 OK):**
```json
{
    "unread_count": 5
}
```

### 6. Mark Message as Read
**PATCH** `/api/messages/{id}/mark_as_read/`

Mark a specific message as read.

**Response (200 OK):**
```json
{
    "detail": "Message marked as read"
}
```

### 7. Mark All Messages as Read
**PATCH** `/api/messages/mark_all_as_read/`

Mark all received messages as read.

**Response (200 OK):**
```json
{
    "detail": "All messages marked as read"
}
```

### 8. Get Conversations List
**GET** `/api/messages/conversations/`

Get a list of all conversations (unique users) for the current user.

**Response (200 OK):**
```json
[
    {
        "user_id": 2,
        "username": "user2",
        "latest_message": {
            "id": 2,
            "sender": "user2",
            "recipient": "user1",
            "content": "Thanks for your interest!",
            "is_read": false,
            "timestamp": "2024-01-15T11:00:00Z"
        },
        "unread_count": 2
    }
]
```

### 9. Get Conversation with Specific User
**GET** `/api/messages/with_user/?user_id=2`

Get the complete conversation with a specific user.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "sender": "user1",
        "recipient": "user2",
        "content": "Hello! I'm interested in your product.",
        "is_read": true,
        "timestamp": "2024-01-15T10:30:00Z"
    },
    {
        "id": 2,
        "sender": "user2",
        "recipient": "user1",
        "content": "Thanks for your interest! Here are the details...",
        "is_read": false,
        "timestamp": "2024-01-15T11:00:00Z"
    }
]
```

### 10. Get Specific Message
**GET** `/api/messages/{id}/`

Get a specific message by ID.

**Response (200 OK):**
```json
{
    "id": 1,
    "sender": "user1",
    "recipient": "user2",
    "content": "Hello! I'm interested in your product.",
    "is_read": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "shop": null,
    "product": null
}
```

### 11. Update Message
**PUT/PATCH** `/api/messages/{id}/`

Update a message (only if you're the sender).

**Request Body:**
```json
{
    "content": "Updated message content"
}
```

### 12. Delete Message
**DELETE** `/api/messages/{id}/`

Delete a message (only if you're the sender).

**Response (204 No Content)**

---

# 🔔 **NOTIFICATION API**

## Notification Endpoints

### 1. Create Notification
**POST** `/api/notifications/`

Create a new notification (typically done by the system).

**Request Body:**
```json
{
    "message": "New order received!",
    "type": "order",
    "shop": null,
    "product": null,
    "order": null
}
```

**Response (201 Created):**
```json
{
    "id": 1,
    "user": "shopowner1",
    "message": "New order received!",
    "type": "order",
    "is_read": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "shop": null,
    "product": null,
    "order": null
}
```

### 2. List All Notifications
**GET** `/api/notifications/`

Get all notifications for the current user.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "user": "shopowner1",
        "message": "New order received!",
        "type": "order",
        "is_read": false,
        "timestamp": "2024-01-15T10:30:00Z",
        "shop": null,
        "product": null,
        "order": null
    }
]
```

### 3. Get Unread Notifications
**GET** `/api/notifications/unread/`

Get all unread notifications.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "user": "shopowner1",
        "message": "New order received!",
        "type": "order",
        "is_read": false,
        "timestamp": "2024-01-15T10:30:00Z"
    }
]
```

### 4. Get Unread Notification Count
**GET** `/api/notifications/unread_count/`

Get the count of unread notifications.

**Response (200 OK):**
```json
{
    "unread_count": 3
}
```

### 5. Mark Notification as Read
**PATCH** `/api/notifications/{id}/mark_as_read/`

Mark a specific notification as read.

**Response (200 OK):**
```json
{
    "detail": "Notification marked as read"
}
```

### 6. Mark All Notifications as Read
**PATCH** `/api/notifications/mark_all_as_read/`

Mark all notifications as read.

**Response (200 OK):**
```json
{
    "detail": "All notifications marked as read"
}
```

### 7. Get Notifications by Type
**GET** `/api/notifications/by_type/?type=order`

Get notifications filtered by type.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "user": "shopowner1",
        "message": "New order received!",
        "type": "order",
        "is_read": false,
        "timestamp": "2024-01-15T10:30:00Z"
    }
]
```

### 8. Clear Old Notifications
**DELETE** `/api/notifications/clear_old/`

Delete notifications older than 30 days.

**Response (200 OK):**
```json
{
    "detail": "Deleted 15 old notifications",
    "deleted_count": 15
}
```

### 9. Get Notification Statistics
**GET** `/api/notifications/stats/`

Get notification statistics for the current user.

**Response (200 OK):**
```json
{
    "total_notifications": 25,
    "unread_notifications": 3,
    "read_notifications": 22,
    "by_type": {
        "order": 10,
        "low_stock": 5,
        "payment": 8,
        "review": 2
    }
}
```

### 10. Get Specific Notification
**GET** `/api/notifications/{id}/`

Get a specific notification by ID.

**Response (200 OK):**
```json
{
    "id": 1,
    "user": "shopowner1",
    "message": "New order received!",
    "type": "order",
    "is_read": false,
    "timestamp": "2024-01-15T10:30:00Z",
    "shop": null,
    "product": null,
    "order": null
}
```

### 11. Delete Notification
**DELETE** `/api/notifications/{id}/`

Delete a notification.

**Response (204 No Content)**

---

# 🚀 **Complete Workflow Examples**

## **Messaging Workflow**

### Step 1: Send a Message
```bash
curl -X POST http://127.0.0.1:8000/api/messages/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": 2,
    "content": "Hello! I have a question about your product."
  }'
```

### Step 2: Check Unread Messages
```bash
curl -X GET http://127.0.0.1:8000/api/messages/unread_count/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 3: Get Conversations
```bash
curl -X GET http://127.0.0.1:8000/api/messages/conversations/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 4: Get Conversation with User
```bash
curl -X GET "http://127.0.0.1:8000/api/messages/with_user/?user_id=2" \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 5: Mark Messages as Read
```bash
curl -X PATCH http://127.0.0.1:8000/api/messages/1/mark_as_read/ \
  -H "Authorization: Bearer <your_access_token>"
```

## **Notification Workflow**

### Step 1: Check Unread Notifications
```bash
curl -X GET http://127.0.0.1:8000/api/notifications/unread_count/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 2: Get Unread Notifications
```bash
curl -X GET http://127.0.0.1:8000/api/notifications/unread/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 3: Mark Notification as Read
```bash
curl -X PATCH http://127.0.0.1:8000/api/notifications/1/mark_as_read/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 4: Get Notification Statistics
```bash
curl -X GET http://127.0.0.1:8000/api/notifications/stats/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 5: Clear Old Notifications
```bash
curl -X DELETE http://127.0.0.1:8000/api/notifications/clear_old/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

# 📱 **Postman Collection Setup**

## **Environment Variables:**
```
base_url: http://127.0.0.1:8000
access_token: (leave empty, will be set after login)
```

## **Collection Structure:**

### **Messaging API**
```
📨 Messaging API
├── 🔐 Authentication
│   ├── Register User
│   └── Login User
├── 💬 Message Management
│   ├── Send Message
│   ├── List All Messages
│   ├── Get Sent Messages
│   ├── Get Received Messages
│   ├── Get Unread Count
│   ├── Mark as Read
│   ├── Mark All as Read
│   ├── Get Conversations
│   ├── Get Conversation with User
│   ├── Update Message
│   └── Delete Message
```

### **Notification API**
```
🔔 Notification API
├── 🔐 Authentication
│   ├── Register User
│   └── Login User
├── 📢 Notification Management
│   ├── Create Notification
│   ├── List All Notifications
│   ├── Get Unread Notifications
│   ├── Get Unread Count
│   ├── Mark as Read
│   ├── Mark All as Read
│   ├── Get by Type
│   ├── Clear Old Notifications
│   ├── Get Statistics
│   └── Delete Notification
```

## **Request Examples:**

### **Send Message**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/messages/`
- **Headers**: 
  - `Authorization: Bearer {{access_token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "recipient": 2,
    "content": "Hello! I'm interested in your product.",
    "shop": null,
    "product": null
}
```

### **Get Conversations**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/messages/conversations/`
- **Headers**: `Authorization: Bearer {{access_token}}`

### **Get Unread Notifications**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/notifications/unread/`
- **Headers**: `Authorization: Bearer {{access_token}}`

---

# 🔍 **Notification Types**

The system supports various notification types:

- **`order`**: New order received
- **`payment`**: Payment status updates
- **`low_stock`**: Product stock warnings
- **`review`**: New product reviews
- **`message`**: New messages received
- **`system`**: System announcements
- **`promotion`**: Promotional notifications

---

# 🛡️ **Security Features**

1. **User Isolation**: Users can only access their own messages and notifications
2. **Authentication Required**: All endpoints require valid JWT tokens
3. **Permission Checks**: Users can only modify their own messages/notifications
4. **Automatic User Assignment**: Messages and notifications are automatically assigned to the authenticated user
5. **Read Status Tracking**: Messages and notifications track read status

---

# 🎯 **Best Practices**

1. **Always include Authorization header** with valid JWT token
2. **Use conversations endpoint** to get a list of all chat partners
3. **Check unread counts** before fetching full lists for better UX
4. **Mark messages/notifications as read** when user views them
5. **Use notification types** to categorize and filter notifications
6. **Clear old notifications** periodically to maintain performance
7. **Handle errors gracefully** in your application

---

# 🧪 **Testing Checklist**

### **Messaging:**
- [ ] Send a message to another user
- [ ] View sent messages
- [ ] View received messages
- [ ] Check unread message count
- [ ] Mark message as read
- [ ] Mark all messages as read
- [ ] Get conversations list
- [ ] Get conversation with specific user
- [ ] Update a message
- [ ] Delete a message

### **Notifications:**
- [ ] Create a notification
- [ ] View all notifications
- [ ] View unread notifications
- [ ] Check unread notification count
- [ ] Mark notification as read
- [ ] Mark all notifications as read
- [ ] Filter notifications by type
- [ ] Clear old notifications
- [ ] Get notification statistics
- [ ] Delete a notification

### **Error Scenarios:**
- [ ] Try to access without authentication
- [ ] Try to modify another user's message/notification
- [ ] Try to send message to non-existent user
- [ ] Try to access non-existent message/notification

---

# 🔧 **Recent Enhancements**

## **Message API Enhancements:**
1. **Conversation Management**: Get list of all conversations
2. **Read Status Tracking**: Track which messages have been read
3. **User Filtering**: Users can only see their own messages
4. **Bulk Operations**: Mark all messages as read
5. **Context Support**: Messages can be linked to shops/products

## **Notification API Enhancements:**
1. **Type Filtering**: Filter notifications by type
2. **Statistics**: Get notification statistics
3. **Cleanup**: Clear old notifications automatically
4. **Read Status**: Track read/unread status
5. **Context Support**: Notifications can be linked to shops/products/orders

## **Security Improvements:**
1. **User Isolation**: Complete user data isolation
2. **Permission Checks**: Strict permission validation
3. **Automatic User Assignment**: No manual user assignment needed
4. **Error Handling**: Comprehensive error responses

This comprehensive Messaging & Notification API provides all the communication features needed for a modern e-commerce platform! 🎉 