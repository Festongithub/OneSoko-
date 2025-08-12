# Django CORS Configuration Guide

## 🔧 **Fix Network Connection Issue**

The "Network error. Please check your connection" error is likely caused by CORS (Cross-Origin Resource Sharing) not being properly configured in your Django backend.

### **1. Install Django CORS Headers**

```bash
pip install django-cors-headers
```

### **2. Update Django Settings**

Add these configurations to your Django `settings.py` file:

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

# Add to MIDDLEWARE (MUST be at the top)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first!
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allow all headers
CORS_ALLOW_ALL_HEADERS = True

# Allow all methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# For development only - allow all origins
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

### **3. Restart Django Server**

After making these changes:

```bash
# Stop the current Django server (Ctrl+C)
# Then restart it
python manage.py runserver
```

### **4. Test the Connection**

1. **Visit the API test page**: `http://localhost:3000/api-test`
2. **Click "Test Backend Connection"**
3. **Check the result**

### **5. Alternative: Quick CORS Test**

If you want to test CORS quickly, you can temporarily add this to your Django views:

```python
# In your views.py or urls.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_cors(request):
    return JsonResponse({
        "message": "CORS is working!",
        "status": "success"
    })
```

### **6. Browser Console Check**

Open your browser's Developer Tools (F12) and check the Console tab for CORS errors:

```
Access to fetch at 'http://localhost:8000/api/users/' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

If you see this error, it confirms CORS is the issue.

### **7. Production CORS Settings**

For production, replace the development settings with:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

CORS_ALLOW_ALL_ORIGINS = False  # Set to False for production
```

### **8. Testing Steps**

1. **Update Django settings** with CORS configuration
2. **Restart Django server**
3. **Visit** `http://localhost:3000/api-test`
4. **Test the connection**
5. **Try registration** at `http://localhost:3000/register`

### **9. Common Issues**

- **CORS middleware order**: Must be at the top of MIDDLEWARE
- **Missing package**: Make sure `django-cors-headers` is installed
- **Wrong origins**: Check that `localhost:3000` is in CORS_ALLOWED_ORIGINS
- **Server not restarted**: Django must be restarted after settings changes

### **10. Verification**

After fixing CORS, you should see:
- ✅ "Backend is accessible!" message
- ✅ Successful registration
- ✅ No CORS errors in browser console

This should resolve the "Network error. Please check your connection" issue! 🚀 