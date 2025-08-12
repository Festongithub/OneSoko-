# 🔒 Shop Security and Access Control Implementation

## Overview

This document outlines the comprehensive security measures implemented to ensure that **only shop owners can access their own shops** and related resources in the OneSoko platform.

## 🎯 Security Objectives

1. **Shop Ownership Validation**: Only shop owners can manage their own shops
2. **Resource Isolation**: Shop owners cannot access other shop owners' resources
3. **Authentication Enforcement**: All shop management operations require authentication
4. **Permission Granularity**: Different permission levels for different operations
5. **Security Logging**: Monitor and log access attempts for security analysis

## 🛡️ Security Implementation

### 1. Enhanced Permission Classes

#### `IsShopOwner`
```python
# Location: permissions.py
class IsShopOwner(permissions.BasePermission):
    """
    Ensures only authenticated users with shop owner status can access resources.
    Includes object-level permissions to validate shop ownership.
    """
```

**Features:**
- ✅ Validates user authentication
- ✅ Checks `is_shopowner` flag in user profile
- ✅ Object-level ownership validation
- ✅ Security logging for unauthorized access attempts

#### `IsShopOwnerForManagement`
```python
# Location: permissions.py
class IsShopOwnerForManagement(permissions.BasePermission):
    """
    Strict permission for shop management operations.
    No read-only access for non-owners.
    """
```

**Features:**
- ✅ Stricter than `IsShopOwner`
- ✅ No fallback to read-only access
- ✅ Comprehensive ownership validation
- ✅ Enhanced security logging

### 2. ViewSet Security Enhancements

#### ShopViewSet Dynamic Permissions
```python
def get_permissions(self):
    """Dynamic permissions based on action type"""
    if self.action == 'create':
        permission_classes = [IsShopOwner]
    elif self.action in ['update', 'partial_update', 'destroy']:
        permission_classes = [IsShopOwner]
    elif self.action in ['my_shops', 'add_product', 'delete_product', 'products']:
        permission_classes = [IsShopOwnerForManagement]
    elif self.action in ['public_list', 'public_detail', 'search']:
        permission_classes = [permissions.AllowAny]
    else:
        permission_classes = [IsShopOwner]
```

#### Filtered QuerySets
```python
def get_queryset(self):
    """Filter queryset based on user permissions and action"""
    if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
        # Management operations: only user's own shops
        return Shop.objects.filter(shopowner=self.request.user)
    elif self.action == 'my_shops':
        # Explicitly for user's own shops
        return Shop.objects.filter(shopowner=self.request.user)
    else:
        # Public endpoints: all active shops
        return Shop.objects.all()
```

### 3. API Endpoint Security

#### Public Endpoints (No Authentication Required)
- `GET /api/shops/public_list/` - Browse all active shops
- `GET /api/shops/public_detail/{shop_id}/` - View shop details
- `GET /api/shops/search/` - Search shops
- `GET /api/shops/by_category/` - Filter shops by category
- `GET /api/shops/nearby/` - Find nearby shops

#### Shop Owner Only Endpoints (Authentication + Shop Owner Status Required)
- `POST /api/shops/` - Create shop
- `GET /api/shops/my_shops/` - Get user's shops
- `PUT/PATCH /api/shops/{shop_id}/` - Update own shop
- `DELETE /api/shops/{shop_id}/` - Delete own shop

#### Shop Management Endpoints (Ownership Validation Required)
- `GET /api/shops/{shop_id}/products/` - View shop products
- `POST /api/shops/{shop_id}/add_product/` - Add product to shop
- `DELETE /api/shops/{shop_id}/products/{product_id}/` - Remove product from shop

### 4. Security Middleware

#### `ShopAccessSecurityMiddleware`
```python
# Location: shop_security.py
class ShopAccessSecurityMiddleware(MiddlewareMixin):
    """Additional security validation for shop operations"""
```

**Features:**
- ✅ Pre-request validation for shop operations
- ✅ Authentication enforcement
- ✅ Shop owner status validation
- ✅ Access pattern logging
- ✅ Failed attempt monitoring

### 5. Access Control Decorators

#### `@shop_owner_required`
```python
# Location: shop_access_control.py
@shop_owner_required
def my_view(request):
    # Only shop owners can access this view
```

#### `@shop_ownership_required`
```python
@shop_ownership_required('shop_id')
def shop_specific_view(request, shop_id):
    # Only the shop owner can access their specific shop
```

#### `@secure_shop_operation`
```python
@secure_shop_operation("product_management")
def manage_products(request):
    # Comprehensive security for shop operations
```

## 🔍 Security Validation Flow

### 1. Request Processing
```
1. Request arrives at endpoint
2. Middleware validates shop-related operations
3. Authentication check
4. Shop owner status validation
5. Object-level ownership check
6. Action execution or access denial
7. Security logging
```

### 2. Permission Validation
```python
# Step 1: User Authentication
if not request.user.is_authenticated:
    return 401 Unauthorized

# Step 2: Shop Owner Status
if not request.user.profile.is_shopowner:
    return 403 Forbidden

# Step 3: Object Ownership
if shop.shopowner != request.user:
    return 403 Forbidden

# Step 4: Action Allowed
return 200 OK
```

## 📊 Security Monitoring

### 1. Access Logging
- ✅ Successful shop operations logged
- ✅ Failed access attempts logged
- ✅ Unauthorized access attempts tracked
- ✅ Security patterns analyzed

### 2. Cache-based Monitoring
```python
# Recent access patterns stored in cache
cache_key = f"shop_access_{user_id}_{method}_{path}"
cache.set(cache_key, access_data, timeout=300)
```

### 3. Security Alerts
- Unauthorized access attempts to shops
- Multiple failed access attempts
- Suspicious access patterns
- Profile-related security issues

## 🛡️ Security Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| **Authentication Enforcement** | ✅ | All shop operations require login |
| **Shop Owner Validation** | ✅ | Only shop owners can manage shops |
| **Ownership Verification** | ✅ | Users can only access their own shops |
| **Dynamic Permissions** | ✅ | Permissions vary by operation type |
| **Security Logging** | ✅ | All access attempts are logged |
| **Middleware Protection** | ✅ | Additional security at middleware level |
| **Object-level Security** | ✅ | Fine-grained access control |
| **Public API Separation** | ✅ | Clear separation of public vs private APIs |

## 🔧 Configuration

### Security Settings
```python
# shop_security.py
SHOP_SECURITY_CONFIG = {
    'ENABLE_ACCESS_LOGGING': True,
    'LOG_FAILED_ATTEMPTS': True,
    'CACHE_ACCESS_PATTERNS': True,
    'MAX_FAILED_ATTEMPTS': 5,
    'LOCKOUT_DURATION': 3600,
}
```

### Django Settings Integration
```python
# settings.py
MIDDLEWARE = [
    # ... other middleware
    'OneSokoApp.shop_security.ShopAccessSecurityMiddleware',
    # ... rest of middleware
]

LOGGING = {
    'loggers': {
        'OneSokoApp.shop_security': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

## 🧪 Testing Shop Security

### 1. Authentication Tests
```python
# Test unauthenticated access
response = client.get('/api/shops/my_shops/')
assert response.status_code == 401

# Test non-shop-owner access
response = customer_client.get('/api/shops/my_shops/')
assert response.status_code == 403
```

### 2. Ownership Tests
```python
# Test accessing another shop owner's shop
response = shop_owner1_client.put(f'/api/shops/{shop_owner2_shop_id}/')
assert response.status_code == 403

# Test accessing own shop
response = shop_owner1_client.put(f'/api/shops/{shop_owner1_shop_id}/')
assert response.status_code == 200
```

### 3. Security Bypass Tests
```python
# Test direct object access bypass attempts
# Test parameter manipulation
# Test permission escalation attempts
```

## 📋 Security Checklist

- [x] **Authentication Required**: All shop management operations require login
- [x] **Shop Owner Validation**: Only users with `is_shopowner=True` can manage shops
- [x] **Ownership Verification**: Users can only access their own shops
- [x] **Dynamic Permissions**: Permissions change based on operation type
- [x] **Object-level Security**: Fine-grained access control for individual shops
- [x] **Security Logging**: All access attempts are logged for monitoring
- [x] **Middleware Protection**: Additional security layer at request level
- [x] **Public API Separation**: Clear distinction between public and private endpoints
- [x] **Error Handling**: Consistent error responses for security violations
- [x] **Input Validation**: Shop IDs and parameters are validated
- [x] **Access Pattern Monitoring**: Suspicious activities are tracked

## 🚀 Benefits

1. **Data Security**: Shop owners' data is completely isolated
2. **Business Logic Integrity**: Only authorized operations are allowed
3. **Audit Trail**: Complete logging of shop access patterns
4. **Scalable Security**: Permission system scales with application growth
5. **Developer Friendly**: Clear security patterns for future development
6. **Compliance Ready**: Comprehensive access control for regulatory requirements

## 🔄 Future Enhancements

1. **Rate Limiting**: Implement per-user rate limiting for shop operations
2. **Multi-factor Authentication**: Add MFA for sensitive shop operations
3. **API Key Authentication**: Alternative authentication for automated systems
4. **Advanced Monitoring**: Real-time security dashboard
5. **Security Analytics**: ML-based anomaly detection for access patterns

---

**Implementation Status**: ✅ Complete and Active
**Security Level**: 🔒 High
**Last Updated**: 2025-08-12
