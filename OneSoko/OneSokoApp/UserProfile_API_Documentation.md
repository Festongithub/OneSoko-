# UserProfile API Documentation

## Overview
The UserProfile API provides comprehensive user profile management functionality for the OneSoko application. Users can create, view, update, and manage their profiles with various features including avatar upload, profile completion tracking, and statistics.

## Authentication
All endpoints require JWT authentication except for the public profile endpoint. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
/api/userprofiles/
```

## Endpoints

### 1. Get Own Profile
**GET** `/api/userprofiles/`

Returns the current user's profile information.

**Response:**
```json
[
  {
    "id": 1,
    "user": "testuser1",
    "username": "testuser1",
    "email": "test1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Test bio for user 1",
    "avatar": "/media/users/avatars/avatar.jpg",
    "address": "Test address 1",
    "is_shopowner": false,
    "date_joined": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T12:00:00Z"
  }
]
```

### 2. Get Current User Profile (Alternative)
**GET** `/api/userprofiles/me/`

Returns the current user's profile information (single object).

**Response:**
```json
{
  "id": 1,
  "user": "testuser1",
  "username": "testuser1",
  "email": "test1@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Test bio for user 1",
  "avatar": "/media/users/avatars/avatar.jpg",
  "address": "Test address 1",
  "is_shopowner": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

### 3. Create Profile
**POST** `/api/userprofiles/`

Creates a new profile for the current user.

**Request Body:**
```json
{
  "bio": "My bio description",
  "address": "My address"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user": "testuser1",
  "username": "testuser1",
  "email": "test1@example.com",
  "first_name": "",
  "last_name": "",
  "bio": "My bio description",
  "avatar": null,
  "address": "My address",
  "is_shopowner": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": null
}
```

### 4. Update Profile
**PUT** `/api/userprofiles/{id}/`

Updates the entire profile.

**Request Body:**
```json
{
  "bio": "Updated bio",
  "address": "Updated address"
}
```

### 5. Partial Update Profile
**PATCH** `/api/userprofiles/{id}/`

Updates specific fields of the profile.

**Request Body:**
```json
{
  "bio": "Updated bio only"
}
```

### 6. Update Bio Only
**PATCH** `/api/userprofiles/update_bio/`

Updates only the bio field.

**Request Body:**
```json
{
  "bio": "Updated bio content"
}
```

**Validation:**
- Bio cannot exceed 1000 characters

### 7. Update Address Only
**PATCH** `/api/userprofiles/update_address/`

Updates only the address field.

**Request Body:**
```json
{
  "address": "Updated address content"
}
```

**Validation:**
- Address cannot exceed 255 characters

### 8. Upload Avatar
**POST** `/api/userprofiles/upload_avatar/`

Uploads or updates the user's avatar image.

**Request:** `multipart/form-data`
```
avatar: [image file]
```

**Validation:**
- File size: Maximum 5MB
- File types: JPEG, PNG, GIF

**Response:**
```json
{
  "id": 1,
  "user": "testuser1",
  "username": "testuser1",
  "email": "test1@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Test bio",
  "avatar": "/media/users/avatars/avatar_123.jpg",
  "address": "Test address",
  "is_shopowner": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

### 9. Remove Avatar
**DELETE** `/api/userprofiles/remove_avatar/`

Removes the user's avatar image.

**Response:**
```json
{
  "id": 1,
  "user": "testuser1",
  "username": "testuser1",
  "email": "test1@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Test bio",
  "avatar": null,
  "address": "Test address",
  "is_shopowner": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

### 10. Profile Completion Status
**GET** `/api/userprofiles/completion_status/`

Returns the profile completion percentage and missing fields.

**Response:**
```json
{
  "completion_percentage": 66.7,
  "completed_fields": 2,
  "total_fields": 3,
  "missing_fields": ["avatar"]
}
```

### 11. Toggle Shopowner Status (Admin Only)
**PATCH** `/api/userprofiles/toggle_shopowner_status/`

Toggles the shopowner status (admin users only).

**Response:**
```json
{
  "message": "Shopowner status enabled successfully.",
  "profile": {
    "id": 1,
    "user": "testuser1",
    "username": "testuser1",
    "email": "test1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Test bio",
    "avatar": null,
    "address": "Test address",
    "is_shopowner": true,
    "date_joined": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T12:00:00Z"
  }
}
```

### 12. Search Users (Admin Only)
**GET** `/api/userprofiles/search/?username=search_term`

Searches for users by username (admin users only).

**Query Parameters:**
- `username` (required): Username search term

**Response:**
```json
[
  {
    "id": 1,
    "username": "testuser1",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Test bio",
    "avatar": "/media/users/avatars/avatar.jpg",
    "is_shopowner": false,
    "date_joined": "2024-01-01T00:00:00Z"
  }
]
```

### 13. User Statistics
**GET** `/api/userprofiles/stats/`

Returns user activity statistics.

**Response:**
```json
{
  "order_count": 5,
  "review_count": 3,
  "wishlist_count": 1,
  "shop_count": 2,
  "is_shopowner": true,
  "profile_created": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

### 14. Public Profile (No Authentication Required)
**GET** `/api/userprofiles/{id}/public/`

Returns public profile information without authentication.

**Response:**
```json
{
  "id": 1,
  "username": "testuser1",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Test bio",
  "avatar": "/media/users/avatars/avatar.jpg",
  "is_shopowner": false,
  "date_joined": "2024-01-01T00:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Bio cannot exceed 1000 characters."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "Only administrators can change shopowner status."
}
```

### 404 Not Found
```json
{
  "detail": "Profile not found. Create a profile first."
}
```

## Usage Examples

### cURL Examples

1. **Get own profile:**
```bash
curl -H "Authorization: Bearer <token>" \
     -X GET \
     http://localhost:8000/api/userprofiles/
```

2. **Update bio:**
```bash
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -X PATCH \
     -d '{"bio": "Updated bio"}' \
     http://localhost:8000/api/userprofiles/update_bio/
```

3. **Upload avatar:**
```bash
curl -H "Authorization: Bearer <token>" \
     -X POST \
     -F "avatar=@/path/to/image.jpg" \
     http://localhost:8000/api/userprofiles/upload_avatar/
```

4. **Get public profile:**
```bash
curl -X GET \
     http://localhost:8000/api/userprofiles/1/public/
```

### JavaScript Examples

1. **Get profile with fetch:**
```javascript
const response = await fetch('/api/userprofiles/me/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const profile = await response.json();
```

2. **Update profile:**
```javascript
const response = await fetch('/api/userprofiles/update_bio/', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Updated bio content'
  })
});
```

3. **Upload avatar:**
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('/api/userprofiles/upload_avatar/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Security Considerations

1. **Authentication Required:** Most endpoints require JWT authentication
2. **Profile Isolation:** Users can only access their own profiles
3. **Admin Privileges:** Only admin users can search users and toggle shopowner status
4. **File Validation:** Avatar uploads are validated for size and type
5. **Input Validation:** All text fields have length restrictions
6. **Public Access:** Public profile endpoint exposes only non-sensitive information

## Rate Limiting

Consider implementing rate limiting for:
- Avatar uploads
- Profile updates
- Search functionality

## Best Practices

1. **Error Handling:** Always handle API errors gracefully
2. **File Uploads:** Validate files on both client and server side
3. **Caching:** Cache public profile data for better performance
4. **Monitoring:** Monitor API usage and error rates
5. **Documentation:** Keep API documentation updated with changes 