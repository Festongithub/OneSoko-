# 🏪 Shop Creation Guide - OneSoko

## **Complete Process to Create a Shop**

### **Step 1: Register as a Shop Owner**

**API Endpoint:** `POST /api/shopowners/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "myshopowner",
  "email": "shopowner@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 40,
  "username": "myshopowner",
  "email": "shopowner@example.com"
}
```

---

### **Step 2: Get JWT Authentication Token**

**API Endpoint:** `POST /api/token/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "myshopowner",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Step 3: Create User Profile (Optional but Recommended)**

**API Endpoint:** `POST /api/userprofiles/`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bio": "I'm a shop owner passionate about quality products",
  "address": "123 Business Street, City, Country"
}
```

---

### **Step 4: Create the Shop**

**API Endpoint:** `POST /api/shops/`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Amazing Shop",
  "description": "We offer the best products with excellent customer service",
  "location": "123 Main Street, Downtown, City",
  "phone": "+1234567890",
  "email": "contact@myamazingshop.com",
  "social_link": "https://instagram.com/myamazingshop",
  "street": "123 Main Street",
  "city": "New York",
  "country": "USA",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "shopId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Amazing Shop",
  "description": "We offer the best products with excellent customer service",
  "location": "123 Main Street, Downtown, City",
  "logo": null,
  "status": "pending",
  "phone": "+1234567890",
  "email": "contact@myamazingshop.com",
  "social_link": "https://instagram.com/myamazingshop",
  "slug": "my-amazing-shop",
  "views": 0,
  "total_sales": 0.00,
  "total_orders": 0,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "street": "123 Main Street",
  "city": "New York",
  "country": "USA",
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true,
  "shopowner": "myshopowner",
  "products": []
}
```

---

## **📱 Postman Collection for Shop Creation**

### **Create a new collection with these requests:**

#### **1. Shop Owner Registration**
```http
POST {{base_url}}/api/shopowners/
Content-Type: application/json

{
  "username": "myshopowner",
  "email": "shopowner@example.com",
  "password": "securepassword123"
}
```

#### **2. Get JWT Token**
```http
POST {{base_url}}/api/token/
Content-Type: application/json

{
  "username": "myshopowner",
  "password": "securepassword123"
}
```

#### **3. Create Shop**
```http
POST {{base_url}}/api/shops/
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "My Amazing Shop",
  "description": "We offer the best products with excellent customer service",
  "location": "123 Main Street, Downtown, City",
  "phone": "+1234567890",
  "email": "contact@myamazingshop.com",
  "social_link": "https://instagram.com/myamazingshop",
  "street": "123 Main Street",
  "city": "New York",
  "country": "USA",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

## **🔧 Step-by-Step Testing in Postman**

### **Step 1: Set Environment Variables**
Create a new environment in Postman:
- `{{base_url}}` = `http://localhost:8000`
- `{{access_token}}` = (will be auto-filled)
- `{{shop_id}}` = (will be set after shop creation)

### **Step 2: Register Shop Owner**
1. Send the shop owner registration request
2. Note the user ID from the response

### **Step 3: Get Authentication Token**
1. Send the JWT token request
2. The token will be automatically saved to `{{access_token}}`

### **Step 4: Create Shop**
1. Send the shop creation request
2. Copy the `shopId` from the response
3. Set `{{shop_id}}` to the new shop ID

### **Step 5: Verify Shop Creation**
1. Send a GET request to `{{base_url}}/api/shops/{{shop_id}}/`
2. Verify all shop details are correct

---

## **⚠️ Important Notes**

### **Shop Owner Requirements:**
- Must register using the `/api/shopowners/` endpoint (not `/api/users/`)
- This automatically sets the user as a shop owner
- Only shop owners can create shops

### **Shop Status:**
- New shops start with `"status": "pending"`
- Admin approval may be required to change to `"active"`
- Only active shops can receive orders

### **Required Fields:**
- `name` - Shop name (required)
- `description` - Shop description (optional but recommended)
- `location` - Shop location (required)

### **Optional Fields:**
- `phone` - Contact phone number
- `email` - Contact email
- `social_link` - Social media link
- `street`, `city`, `country` - Structured address
- `latitude`, `longitude` - GPS coordinates

### **Auto-Generated Fields:**
- `shopId` - Unique identifier
- `slug` - URL-friendly name
- `created_at` - Creation timestamp
- `shopowner` - Owner username

---

## **🚀 Next Steps After Shop Creation**

### **1. Add Products to Shop**
```http
POST {{base_url}}/api/shops/{{shop_id}}/add_product/
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "This is a sample product",
  "price": 99.99,
  "quantity": 10
}
```

### **2. Upload Shop Logo**
```http
POST {{base_url}}/api/shops/{{shop_id}}/
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

logo: [select image file]
```

### **3. Update Shop Status (Admin Only)**
```http
PATCH {{base_url}}/api/shops/{{shop_id}}/
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "status": "active"
}
```

---

## ** Error Handling**

### **Common Errors:**

#### **User Already Exists:**
```json
{
  "username": ["A user with that username already exists."]
}
```

#### **Invalid Token:**
```json
{
  "detail": "Given token not valid for any token type"
}
```

#### **Permission Denied:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### **Missing Required Fields:**
```json
{
  "name": ["This field is required."]
}
```

---

## **✅ Success Checklist**

- [ ] Shop owner registered successfully
- [ ] JWT token obtained
- [ ] Shop created with all required fields
- [ ] Shop ID saved to environment variables
- [ ] Shop details verified
- [ ] Products added to shop (optional)
- [ ] Shop logo uploaded (optional)

---

## **🎉 Congratulations!**

Your shop is now created and ready for business! You can:
- Add products to your shop
- Manage shop information
- Handle customer orders
- Track shop analytics

The shop will be visible to customers once the status is changed to "active" by an administrator. 