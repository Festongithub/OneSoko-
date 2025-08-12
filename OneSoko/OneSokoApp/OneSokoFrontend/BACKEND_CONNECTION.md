# Backend Connection Guide

This guide will help you connect the OneSoko frontend with your Django backend.

## 🚀 Quick Setup

### 1. Start Your Django Backend

Make sure your Django backend is running on `http://localhost:8000`:

```bash
# Navigate to your Django project directory
cd /path/to/your/django/project

# Run migrations (if needed)
python manage.py migrate

# Start the development server
python manage.py runserver
```

### 2. Install Frontend Dependencies

```bash
# Navigate to the frontend directory
cd /home/flamers/OneSoko-/OneSoko/OneSokoApp

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

### 4. Start the Frontend

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 Backend Configuration

### Django CORS Settings

Make sure your Django backend has CORS properly configured. Add to your `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Allow all headers and methods for development
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

### Install Django CORS Headers

```bash
pip install django-cors-headers
```

## 🔌 API Endpoints Verification

### Test Your Backend API

You can test if your backend is accessible by visiting:

- **API Root**: `http://localhost:8000/api/`
- **Products**: `http://localhost:8000/api/products/`
- **Shops**: `http://localhost:8000/api/shops/`
- **Categories**: `http://localhost:8000/api/categories/`

### Expected Response Format

Your Django API should return data in this format:

```json
{
  "count": 10,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "productId": "uuid-string",
      "name": "Product Name",
      "description": "Product description",
      "price": "99.99",
      "quantity": 10,
      "image": "http://localhost:8000/media/products/image.jpg",
      "category": {
        "id": 1,
        "name": "Electronics",
        "slug": "electronics"
      },
      "tags": [
        {
          "id": 1,
          "name": "tech"
        }
      ],
      "discount": 0,
      "promotional_price": null,
      "is_active": true,
      "shops": [
        {
          "shopId": "uuid-string",
          "name": "Shop Name",
          "slug": "shop-name"
        }
      ]
    }
  ]
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
**Error**: `Access to fetch at 'http://localhost:8000/api/' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**: 
- Make sure `django-cors-headers` is installed and configured
- Check that `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
- Restart your Django server after making changes

#### 2. API Not Found
**Error**: `404 Not Found` when accessing API endpoints

**Solution**:
- Verify your Django URLs are properly configured
- Check that the API router is included in your main URLs
- Ensure your Django app is running on port 8000

#### 3. Authentication Issues
**Error**: `401 Unauthorized` for protected endpoints

**Solution**:
- Make sure JWT authentication is properly configured
- Check that tokens are being sent in the Authorization header
- Verify token refresh is working

#### 4. Network Errors
**Error**: `Network Error` or connection refused

**Solution**:
- Ensure Django server is running: `python manage.py runserver`
- Check if port 8000 is available
- Verify firewall settings

### Debug Steps

1. **Check Django Server Logs**
   ```bash
   python manage.py runserver --verbosity=2
   ```

2. **Test API with curl**
   ```bash
   curl -X GET http://localhost:8000/api/products/
   ```

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for network errors in the Console tab
   - Check the Network tab for failed requests

4. **Verify Environment Variables**
   ```bash
   # In your React app, add this to see the config
   console.log('API URL:', process.env.REACT_APP_API_URL);
   ```

## 🔐 Authentication Setup

### JWT Configuration

Make sure your Django backend has JWT authentication configured:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### Test Authentication

1. **Register a user**:
   ```bash
   curl -X POST http://localhost:8000/api/users/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"testpass123","first_name":"Test","last_name":"User"}'
   ```

2. **Get access token**:
   ```bash
   curl -X POST http://localhost:8000/api/token/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass123"}'
   ```

## 📱 Frontend Integration

### Testing the Connection

The frontend includes a `BackendConnectionTest` component that you can temporarily add to your app to verify the connection:

```tsx
import BackendConnectionTest from './components/BackendConnectionTest';

// Add this to your App.tsx or any page
<BackendConnectionTest />
```

### Environment Configuration

The frontend uses the following configuration:

- **API Base URL**: `http://localhost:8000/api`
- **Backend URL**: `http://localhost:8000`
- **Token Storage**: LocalStorage with keys `access_token`, `refresh_token`

### API Service Structure

The frontend API service is organized into modules:

- `authAPI` - Authentication (login, register, token refresh)
- `productsAPI` - Product management
- `shopsAPI` - Shop information
- `categoriesAPI` - Category management
- `ordersAPI` - Order processing
- `wishlistAPI` - Wishlist management
- `messagesAPI` - Messaging system
- `notificationsAPI` - Notifications
- `userProfileAPI` - User profile management

## 🚀 Production Deployment

For production, update your environment variables:

```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_BACKEND_URL=https://your-domain.com
REACT_APP_ENVIRONMENT=production
```

And update Django CORS settings:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Django server logs
3. Test API endpoints directly with curl or Postman
4. Ensure all dependencies are installed
5. Check network connectivity

---

**Happy coding! 🎉** 