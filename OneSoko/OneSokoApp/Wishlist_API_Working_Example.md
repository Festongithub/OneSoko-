# Wishlist API - Working Example

## ✅ **Correct URLs Based on Your Django Setup**

From the error page, I can see your actual API endpoints are:

### **Authentication Endpoints:**
- **User Registration**: `POST /api/users/`
- **Shopowner Registration**: `POST /api/shopowners/`
- **Login (Get Token)**: `POST /api/token/`
- **Refresh Token**: `POST /api/token/refresh/`

### **Wishlist Endpoints:**
- **Create Wishlist**: `POST /api/wishlists/`
- **Get My Wishlist**: `GET /api/wishlists/my_wishlist/`
- **List Wishlists**: `GET /api/wishlists/`
- **Add Product**: `POST /api/wishlists/{id}/add_product/`
- **Remove Product**: `DELETE /api/wishlists/{id}/remove_product/{product_id}/`

## 🚀 **Complete Working Example**

### **Step 1: Register a New User**
```bash
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "wishlist_user",
    "email": "wishlist@example.com",
    "password": "securepass123"
  }'
```

**Expected Response:**
```json
{
    "id": 1,
    "username": "wishlist_user",
    "email": "wishlist@example.com"
}
```

### **Step 2: Login to Get Access Token**
```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "wishlist_user",
    "password": "securepass123"
  }'
```

**Expected Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2ODkzMDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.example_signature",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczNTc3NTcwMCwiaWF0IjoxNzM1Njg5MzAwLCJqdGkiOiI5ODc2NTQzMjEwIiwidXNlcl9pZCI6MX0.example_refresh_signature"
}
```

### **Step 3: Create a Wishlist**
```bash
curl -X POST http://127.0.0.1:8000/api/wishlists/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2ODkzMDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.example_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "products": []
  }'
```

**Expected Response:**
```json
{
    "id": 1,
    "user": "wishlist_user",
    "products": []
}
```

### **Step 4: View Your Wishlist**
```bash
curl -X GET http://127.0.0.1:8000/api/wishlists/my_wishlist/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2ODkzMDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.example_signature"
```

**Expected Response:**
```json
{
    "id": 1,
    "user": "wishlist_user",
    "products": []
}
```

### **Step 5: Add a Product to Wishlist**
```bash
curl -X POST http://127.0.0.1:8000/api/wishlists/1/add_product/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2ODkzMDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.example_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Expected Response:**
```json
{
    "detail": "Product iPhone 15 Pro added to wishlist"
}
```

### **Step 6: Remove a Product from Wishlist**
```bash
curl -X DELETE http://127.0.0.1:8000/api/wishlists/1/remove_product/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2ODkzMDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.example_signature"
```

**Expected Response:**
```json
{
    "detail": "Product iPhone 15 Pro removed from wishlist"
}
```

## 📱 **Postman Collection Setup**

### **Environment Variables:**
```
base_url: http://127.0.0.1:8000
access_token: (leave empty, will be set after login)
```

### **Collection Requests:**

#### **1. Register User**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/users/`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
}
```

#### **2. Login User**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/token/`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "username": "testuser",
    "password": "testpass123"
}
```
- **Tests** (to auto-set token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('access_token', response.access);
}
```

#### **3. Create Wishlist**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/wishlists/`
- **Headers**: 
  - `Authorization: Bearer {{access_token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "products": []
}
```

#### **4. Get My Wishlist**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/wishlists/my_wishlist/`
- **Headers**: `Authorization: Bearer {{access_token}}`

#### **5. Add Product to Wishlist**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/wishlists/1/add_product/`
- **Headers**: 
  - `Authorization: Bearer {{access_token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "product_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### **6. Remove Product from Wishlist**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/wishlists/1/remove_product/550e8400-e29b-41d4-a716-446655440000/`
- **Headers**: `Authorization: Bearer {{access_token}}`

## 🔍 **Testing Different Scenarios**

### **Scenario 1: Invalid URL (404 Error)**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/regsiter/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'
```
**Expected**: 404 Page not found

### **Scenario 2: Correct Registration URL**
```bash
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'
```
**Expected**: 201 Created with user data

### **Scenario 3: Login with Correct URL**
```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'
```
**Expected**: 200 OK with access and refresh tokens

## 🎯 **Key Differences from Previous Examples**

1. **Registration URL**: `/api/users/` (not `/api/auth/register/`)
2. **Login URL**: `/api/token/` (not `/api/auth/login/`)
3. **All other endpoints remain the same**

## 🚀 **Quick Test Commands**

Copy and paste these commands to test your API:

```bash
# 1. Register
curl -X POST http://127.0.0.1:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "test123"}'

# 2. Login
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'

# 3. Create wishlist (replace TOKEN with actual token from step 2)
curl -X POST http://127.0.0.1:8000/api/wishlists/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"products": []}'
```

This should work perfectly with your current Django setup! 🎉 