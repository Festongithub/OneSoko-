# Shop Search and Listing API Documentation

This document describes all the available APIs for searching and listing shops in the OneSoko application.

## Base URL
All shop endpoints are available under: `/api/shops/`

## Available Endpoints

### 1. General Shop Listing with Filters
**Endpoint:** `GET /api/shops/`
**Authentication:** Required (for full access)
**Description:** List all shops with advanced filtering and search capabilities

**Query Parameters:**
- `search` - Search across name, description, location, city, country, street, email
- `status` - Filter by shop status (`active`, `suspended`, `pending`)
- `city` - Filter by specific city
- `country` - Filter by specific country  
- `is_active` - Filter by active status (`true`/`false`)
- `ordering` - Sort by fields: `name`, `created_at`, `views`, `total_sales`, `total_orders`
  - Use `-` prefix for descending order (e.g., `-views`)

**Example:**
```
GET /api/shops/?search=electronics&city=Nairobi&ordering=-views
```

### 2. Public Shop Listing
**Endpoint:** `GET /api/shops/public_list/`
**Authentication:** None required
**Description:** Get all public active shops with optional filtering

**Query Parameters:**
- `city` - Filter by city name (case-insensitive)
- `country` - Filter by country name (case-insensitive)
- `has_products` - Only shops with products (`true`/`false`)
- `sort_by` - Sort field (`name`, `views`, `total_sales`, `created_at`, `total_orders`)
- `order` - Sort order (`asc` or `desc`)

**Example:**
```
GET /api/shops/public_list/?city=nairobi&has_products=true&sort_by=views&order=desc
```

### 3. Enhanced Shop Search
**Endpoint:** `GET /api/shops/search/`
**Authentication:** None required
**Description:** Advanced search with pagination and multiple filters

**Query Parameters:**
- `q` - General search query (searches name, description, location, email, street)
- `location` - Location-based search (city, country, location, street)
- `city` - Specific city filter
- `country` - Specific country filter
- `min_rating` - Minimum average product rating
- `sort_by` - Sort field (`name`, `views`, `total_sales`, `created_at`, `total_orders`)
- `order` - Sort order (`asc` or `desc`)
- `page` - Page number for pagination
- `page_size` - Items per page (max 100)

**Response Format:**
```json
{
  "count": 150,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "shopId": "uuid",
      "name": "Shop Name",
      "description": "Shop description",
      "city": "Nairobi",
      "country": "Kenya",
      // ... other shop fields
    }
  ]
}
```

**Example:**
```
GET /api/shops/search/?q=electronics&location=nairobi&min_rating=4.0&sort_by=views&order=desc&page=1&page_size=10
```

### 4. Shops by Category
**Endpoint:** `GET /api/shops/by_category/`
**Authentication:** None required
**Description:** Get shops that have products in a specific category

**Query Parameters:**
- `category_id` - Exact category ID
- `category_name` - Category name (case-insensitive partial match)

**Example:**
```
GET /api/shops/by_category/?category_name=electronics
GET /api/shops/by_category/?category_id=123
```

### 5. Nearby Shops
**Endpoint:** `GET /api/shops/nearby/`
**Authentication:** None required
**Description:** Get shops near a specific location (requires coordinates)

**Query Parameters:**
- `latitude` - Latitude coordinate (required)
- `longitude` - Longitude coordinate (required)
- `radius` - Search radius in kilometers (default: 10)

**Example:**
```
GET /api/shops/nearby/?latitude=-1.2921&longitude=36.8219&radius=5
```

### 6. Single Shop Details (Public)
**Endpoint:** `GET /api/shops/{shopId}/public_detail/`
**Authentication:** None required
**Description:** Get detailed information about a specific shop

**Example:**
```
GET /api/shops/550e8400-e29b-41d4-a716-446655440000/public_detail/
```

### 7. My Shops (Owner)
**Endpoint:** `GET /api/shops/my_shops/`
**Authentication:** Required
**Description:** Get all shops owned by the authenticated user

**Example:**
```
GET /api/shops/my_shops/
```

## Usage Examples

### Basic Search
```javascript
// Search for electronics shops in Nairobi
fetch('/api/shops/search/?q=electronics&city=nairobi')
  .then(response => response.json())
  .then(data => console.log(data.results));
```

### Advanced Filtering
```javascript
// Get highly rated electronics shops sorted by popularity
fetch('/api/shops/search/?q=electronics&min_rating=4.5&sort_by=views&order=desc&page_size=5')
  .then(response => response.json())
  .then(data => {
    console.log(`Found ${data.count} shops`);
    console.log(data.results);
  });
```

### Location-based Search
```javascript
// Get shops near a specific location
fetch('/api/shops/nearby/?latitude=-1.2921&longitude=36.8219&radius=10')
  .then(response => response.json())
  .then(data => console.log(data.results));
```

### Category-based Shop Discovery
```javascript
// Find all shops selling electronics
fetch('/api/shops/by_category/?category_name=electronics')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Response Fields

Each shop object in the response includes:
- `shopId` - Unique shop identifier
- `name` - Shop name
- `description` - Shop description
- `location` - General location string
- `city` - City name
- `country` - Country name
- `street` - Street address
- `email` - Contact email
- `phone` - Contact phone
- `logo` - Shop logo URL
- `views` - Number of views
- `total_sales` - Total sales amount
- `total_orders` - Total number of orders
- `created_at` - Creation timestamp
- `status` - Shop status
- `is_active` - Active status
- `latitude`/`longitude` - Geographic coordinates (if available)
- `social_link` - Social media link
- `slug` - SEO-friendly URL slug

## Error Responses

- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Shop not found
- `401 Unauthorized` - Authentication required (for protected endpoints)

## Rate Limiting

All public endpoints are rate-limited to prevent abuse. If you hit rate limits, you'll receive a `429 Too Many Requests` response.

## Notes

1. All search operations are case-insensitive
2. Search results only include active shops (`status="active"` and `is_active=True`)
3. Pagination is recommended for large result sets
4. Geographic search (nearby) requires shops to have latitude/longitude coordinates
5. Rating-based filtering depends on product reviews in the shop
