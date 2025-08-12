# Wishlist API Documentation

## Overview
The Wishlist API allows users to create and manage their personal wishlists of products. Users can add products to their wishlist, remove products, and view their wishlist items.

## Base URL
```
http://localhost:8000/api/wishlists/
```

## Authentication
All Wishlist API endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## API Endpoints

### 1. Create Wishlist
**POST** `/api/wishlists/`

Creates a new wishlist for the authenticated user.

**Request Body:**
```json
{
    "products": []
}
```
*Note: The `user` field is automatically assigned to the authenticated user and cannot be modified.*

**Response (201 Created):**
```json
{
    "id": 1,
    "user": "username",
    "products": []
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:8000/api/wishlists/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"products": []}'
```

### 2. Get User's Wishlist
**GET** `/api/wishlists/my_wishlist/`

Retrieves the current user's wishlist.

**Response (200 OK):**
```json
{
    "id": 1,
    "user": "username",
    "products": [
        {
            "productId": "uuid-here",
            "name": "Product Name",
            "description": "Product description",
            "price": "29.99",
            "quantity": 10,
            "image": "http://localhost:8000/media/products/images/product.jpg",
            "category": null,
            "tags": [],
            "discount": "0.00",
            "promotional_price": null,
            "is_active": true,
            "deleted_at": null
        }
    ]
}
```

**Example with cURL:**
```bash
curl -X GET http://localhost:8000/api/wishlists/my_wishlist/ \
  -H "Authorization: Bearer <your_access_token>"
```

### 3. List All User's Wishlists
**GET** `/api/wishlists/`

Retrieves all wishlists belonging to the authenticated user.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "user": "username",
        "products": [...]
    }
]
```

**Example with cURL:**
```bash
curl -X GET http://localhost:8000/api/wishlists/ \
  -H "Authorization: Bearer <your_access_token>"
```

### 4. Get Specific Wishlist
**GET** `/api/wishlists/{id}/`

Retrieves a specific wishlist by ID (only if it belongs to the authenticated user).

**Response (200 OK):**
```json
{
    "id": 1,
    "user": "username",
    "products": [...]
}
```

**Example with cURL:**
```bash
curl -X GET http://localhost:8000/api/wishlists/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

### 5. Add Product to Wishlist
**POST** `/api/wishlists/{id}/add_product/`

Adds a product to a specific wishlist.

**Request Body:**
```json
{
    "product_id": "uuid-of-product"
}
```

**Response (200 OK):**
```json
{
    "detail": "Product Product Name added to wishlist"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:8000/api/wishlists/1/add_product/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "uuid-of-product"}'
```

### 6. Remove Product from Wishlist
**DELETE** `/api/wishlists/{id}/remove_product/{product_id}/`

Removes a product from a specific wishlist.

**Response (200 OK):**
```json
{
    "detail": "Product Product Name removed from wishlist"
}
```

**Example with cURL:**
```bash
curl -X DELETE http://localhost:8000/api/wishlists/1/remove_product/uuid-of-product/ \
  -H "Authorization: Bearer <your_access_token>"
```

### 7. Update Wishlist
**PUT/PATCH** `/api/wishlists/{id}/`

Updates a wishlist (limited functionality since products are managed through separate endpoints).

**Example with cURL:**
```bash
curl -X PATCH http://localhost:8000/api/wishlists/1/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 8. Delete Wishlist
**DELETE** `/api/wishlists/{id}/`

Deletes a wishlist.

**Response (204 No Content)**

**Example with cURL:**
```bash
curl -X DELETE http://localhost:8000/api/wishlists/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

## Complete Workflow Example

### Step 1: Get Authentication Token
```bash
# Register a new user (if needed)
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Login to get access token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Step 2: Create Wishlist
```bash
curl -X POST http://localhost:8000/api/wishlists/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"products": []}'
```

### Step 3: Add Products to Wishlist
```bash
# First, you need to have products in the system
# Then add them to your wishlist
curl -X POST http://localhost:8000/api/wishlists/1/add_product/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "uuid-of-product"}'
```

### Step 4: View Wishlist
```bash
curl -X GET http://localhost:8000/api/wishlists/my_wishlist/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 5: Remove Product from Wishlist
```bash
curl -X DELETE http://localhost:8000/api/wishlists/1/remove_product/uuid-of-product/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Step 6: Delete Wishlist (if needed)
```bash
curl -X DELETE http://localhost:8000/api/wishlists/1/ \
  -H "Authorization: Bearer <your_access_token>"
```

## Postman Collection Setup

### 1. Environment Variables
Set up these environment variables in Postman:
- `base_url`: `http://localhost:8000`
- `access_token`: (will be set after login)

### 2. Collection Structure
```
Wishlist API
├── Authentication
│   ├── Register User
│   └── Login User
├── Wishlist Management
│   ├── Create Wishlist
│   ├── Get My Wishlist
│   ├── List All Wishlists
│   ├── Get Specific Wishlist
│   ├── Add Product to Wishlist
│   ├── Remove Product from Wishlist
│   ├── Update Wishlist
│   └── Delete Wishlist
```

### 3. Request Examples

#### Register User
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/register/`
- **Body** (raw JSON):
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
}
```

#### Login User
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login/`
- **Body** (raw JSON):
```json
{
    "username": "testuser",
    "password": "testpass123"
}
```
- **Tests** (to automatically set access token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('access_token', response.access);
}
```

#### Create Wishlist
- **Method**: POST
- **URL**: `{{base_url}}/api/wishlists/`
- **Headers**: 
  - `Authorization`: `Bearer {{access_token}}`
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
    "products": []
}
```

#### Get My Wishlist
- **Method**: GET
- **URL**: `{{base_url}}/api/wishlists/my_wishlist/`
- **Headers**: 
  - `Authorization`: `Bearer {{access_token}}`

#### Add Product to Wishlist
- **Method**: POST
- **URL**: `{{base_url}}/api/wishlists/1/add_product/`
- **Headers**: 
  - `Authorization`: `Bearer {{access_token}}`
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
    "product_id": "uuid-of-product"
}
```

#### Remove Product from Wishlist
- **Method**: DELETE
- **URL**: `{{base_url}}/api/wishlists/1/remove_product/uuid-of-product/`
- **Headers**: 
  - `Authorization`: `Bearer {{access_token}}`

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```
*Solution: Include valid JWT token in Authorization header*

#### 400 Bad Request
```json
{
    "detail": "product_id is required"
}
```
*Solution: Include product_id in request body*

#### 404 Not Found
```json
{
    "detail": "Product not found"
}
```
*Solution: Use valid product UUID*

#### 404 Not Found (Wishlist)
```json
{
    "detail": "No wishlist found. Create one first."
}
```
*Solution: Create a wishlist first*

## Recent Fix: IntegrityError Resolution

The `IntegrityError: (1048, "Column 'user_id' cannot be null")` error has been resolved by:

1. **Adding `perform_create` method** to `WishlistViewSet`:
```python
def perform_create(self, serializer):
    # Automatically assign the current user to the wishlist
    serializer.save(user=self.request.user)
```

2. **Adding `get_queryset` method** for proper filtering:
```python
def get_queryset(self):
    # Users can only see their own wishlists
    return Wishlist.objects.filter(user=self.request.user)
```

3. **Adding custom actions** for better product management:
   - `add_product`: Add products to wishlist
   - `remove_product`: Remove products from wishlist
   - `my_wishlist`: Get current user's wishlist

## Security Features

1. **User Isolation**: Users can only access their own wishlists
2. **Authentication Required**: All endpoints require valid JWT tokens
3. **Automatic User Assignment**: Wishlists are automatically assigned to the authenticated user
4. **Input Validation**: Product IDs are validated before adding/removing

## Best Practices

1. **Always include Authorization header** with valid JWT token
2. **Use the `my_wishlist` endpoint** to get the current user's wishlist
3. **Validate product IDs** before adding to wishlist
4. **Handle errors gracefully** in your application
5. **Use appropriate HTTP methods** (GET for retrieval, POST for creation, etc.)

## Testing Checklist

- [ ] Register a new user
- [ ] Login and obtain access token
- [ ] Create a new wishlist
- [ ] Add products to wishlist
- [ ] View wishlist contents
- [ ] Remove products from wishlist
- [ ] Update wishlist (if needed)
- [ ] Delete wishlist
- [ ] Test error scenarios (invalid tokens, missing products, etc.) 