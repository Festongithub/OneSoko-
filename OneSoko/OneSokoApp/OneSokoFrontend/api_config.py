"""
Enhanced API Configuration for OneSoko Application
Provides performance optimizations, security settings, and caching strategies
"""

import os
from datetime import timedelta
from django.conf import settings

# API Performance Settings
API_PERFORMANCE_CONFIG = {
    # Database query optimization
    'SELECT_RELATED_FIELDS': {
        'shop': ['shopowner', 'shopowner__profile'],
        'product': ['shop', 'category', 'tags'],
        'order': ['customer', 'customer__profile', 'items', 'items__product'],
        'message': ['sender', 'sender__profile', 'recipient', 'recipient__profile'],
        'review': ['user', 'user__profile', 'product', 'shop'],
    },
    
    # Pagination settings
    'PAGINATION': {
        'DEFAULT_PAGE_SIZE': 20,
        'MAX_PAGE_SIZE': 100,
        'PAGE_SIZE_QUERY_PARAM': 'page_size',
    },
    
    # Cache settings
    'CACHE_TTL': {
        'SHOPS': 300,  # 5 minutes
        'PRODUCTS': 600,  # 10 minutes
        'CATEGORIES': 1800,  # 30 minutes
        'REVIEWS': 300,  # 5 minutes
        'CONVERSATIONS': 300,  # 5 minutes
        'USER_PROFILE': 600,  # 10 minutes
        'SEARCH_RESULTS': 180,  # 3 minutes
    },
    
    # Rate limiting
    'RATE_LIMITS': {
        'AUTH': 10,  # requests per minute
        'SHOPS': 100,
        'PRODUCTS': 200,
        'MESSAGES': 50,
        'ORDERS': 30,
        'REVIEWS': 20,
        'SEARCH': 60,
        'DEFAULT': 60,
    },
    
    # Response compression
    'COMPRESSION': {
        'ENABLED': True,
        'MIN_SIZE': 1024,  # bytes
        'ALGORITHMS': ['gzip', 'deflate'],
    },
    
    # Database connection pooling
    'DB_POOL': {
        'ENABLED': True,
        'MAX_CONNECTIONS': 20,
        'MIN_CONNECTIONS': 5,
        'CONNECTION_TIMEOUT': 30,
    },
}

# Security Configuration
API_SECURITY_CONFIG = {
    # Authentication settings
    'AUTH': {
        'JWT_EXPIRY': timedelta(hours=24),
        'JWT_REFRESH_EXPIRY': timedelta(days=7),
        'PASSWORD_MIN_LENGTH': 8,
        'PASSWORD_REQUIREMENTS': {
            'UPPERCASE': True,
            'LOWERCASE': True,
            'NUMBERS': True,
            'SPECIAL_CHARS': True,
        },
        'SESSION_TIMEOUT': timedelta(hours=2),
        'MAX_LOGIN_ATTEMPTS': 5,
        'LOCKOUT_DURATION': timedelta(minutes=15),
    },
    
    # CORS settings
    'CORS': {
        'ALLOWED_ORIGINS': [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://onesoko.com',
            'https://www.onesoko.com',
        ],
        'ALLOWED_METHODS': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'ALLOWED_HEADERS': [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-API-Key',
            'X-Request-Signature',
        ],
        'EXPOSE_HEADERS': [
            'X-Total-Count',
            'X-Page-Count',
            'X-Response-Time',
            'X-Cache-Status',
        ],
        'ALLOW_CREDENTIALS': True,
        'MAX_AGE': 86400,  # 24 hours
    },
    
    # API Key settings
    'API_KEYS': {
        'REQUIRED_FOR': [
            '/api/admin/',
            '/api/shops/create/',
            '/api/products/create/',
            '/api/orders/',
            '/api/payments/',
            '/api/analytics/',
        ],
        'VALID_KEYS': os.environ.get('VALID_API_KEYS', '').split(','),
    },
    
    # Request validation
    'REQUEST_VALIDATION': {
        'MAX_REQUEST_SIZE': 10 * 1024 * 1024,  # 10MB
        'ALLOWED_CONTENT_TYPES': [
            'application/json',
            'multipart/form-data',
            'application/x-www-form-urlencoded',
        ],
        'REQUIRE_SIGNATURE_FOR': [
            '/api/shops/',
            '/api/products/',
            '/api/orders/',
        ],
    },
    
    # Input sanitization
    'SANITIZATION': {
        'HTML_STRIP': True,
        'SCRIPT_REMOVAL': True,
        'SQL_INJECTION_PROTECTION': True,
        'XSS_PROTECTION': True,
    },
}

# Messaging Configuration
MESSAGING_CONFIG = {
    # Message settings
    'MESSAGE': {
        'MAX_LENGTH': 1000,
        'RATE_LIMIT': 20,  # messages per minute
        'ALLOWED_TYPES': ['text', 'inquiry', 'order_update', 'bulk', 'system'],
        'AUTO_DELETE_AFTER': timedelta(days=365),  # 1 year
        'ENCRYPTION_ENABLED': True,
    },
    
    # Real-time messaging
    'REALTIME': {
        'WEBSOCKET_ENABLED': True,
        'HEARTBEAT_INTERVAL': 30,  # seconds
        'CONNECTION_TIMEOUT': 300,  # 5 minutes
        'MAX_CONNECTIONS_PER_USER': 3,
    },
    
    # Notification settings
    'NOTIFICATIONS': {
        'EMAIL_ENABLED': True,
        'PUSH_ENABLED': True,
        'SMS_ENABLED': False,
        'IN_APP_ENABLED': True,
        'BATCH_PROCESSING': True,
        'BATCH_SIZE': 100,
        'BATCH_INTERVAL': 60,  # seconds
    },
    
    # Shop messaging
    'SHOP_MESSAGING': {
        'AUTO_RESPONSE_ENABLED': True,
        'BUSINESS_HOURS': {
            'START': '09:00',
            'END': '18:00',
            'TIMEZONE': 'Africa/Nairobi',
        },
        'AUTO_RESPONSE_MESSAGE': "Thank you for your message. We'll respond within 24 hours during business days.",
        'ESCALATION_THRESHOLD': 48,  # hours
        'ESCALATION_MESSAGE': "Your inquiry has been escalated to our support team.",
    },
}

# Shop Security Configuration
SHOP_SECURITY_CONFIG = {
    # Shop ownership validation
    'OWNERSHIP': {
        'REQUIRE_VERIFICATION': True,
        'VERIFICATION_METHODS': ['email', 'phone', 'document'],
        'AUTO_APPROVAL_THRESHOLD': 100,  # orders
        'MANUAL_REVIEW_THRESHOLD': 1000,  # orders
    },
    
    # Product management
    'PRODUCTS': {
        'MAX_PRODUCTS_PER_SHOP': 1000,
        'REQUIRE_APPROVAL': False,
        'AUTO_APPROVAL_THRESHOLD': 50,  # products
        'CONTENT_MODERATION': True,
        'DUPLICATE_DETECTION': True,
    },
    
    # Order management
    'ORDERS': {
        'AUTO_CANCELLATION': True,
        'CANCELLATION_WINDOW': timedelta(hours=24),
        'REFUND_WINDOW': timedelta(days=7),
        'DISPUTE_WINDOW': timedelta(days=30),
        'ESCALATION_THRESHOLD': timedelta(hours=48),
    },
    
    # Payment security
    'PAYMENTS': {
        'REQUIRE_VERIFICATION': True,
        'HOLD_PERIOD': timedelta(days=3),
        'MINIMUM_PAYOUT': 1000,  # KES
        'MAXIMUM_PAYOUT': 100000,  # KES
        'DAILY_LIMIT': 50000,  # KES
    },
    
    # Analytics and reporting
    'ANALYTICS': {
        'ENABLED': True,
        'RETENTION_PERIOD': timedelta(days=365),
        'REAL_TIME_UPDATES': True,
        'PRIVACY_COMPLIANT': True,
    },
}

# Performance Monitoring
PERFORMANCE_CONFIG = {
    # Database monitoring
    'DATABASE': {
        'SLOW_QUERY_THRESHOLD': 1.0,  # seconds
        'QUERY_LOG_ENABLED': True,
        'CONNECTION_MONITORING': True,
        'DEADLOCK_DETECTION': True,
    },
    
    # API monitoring
    'API': {
        'RESPONSE_TIME_THRESHOLD': 2.0,  # seconds
        'ERROR_RATE_THRESHOLD': 0.05,  # 5%
        'REQUEST_LOG_ENABLED': True,
        'HEALTH_CHECK_ENABLED': True,
    },
    
    # Cache monitoring
    'CACHE': {
        'HIT_RATE_THRESHOLD': 0.8,  # 80%
        'MEMORY_USAGE_THRESHOLD': 0.9,  # 90%
        'EVICTION_MONITORING': True,
    },
    
    # External services
    'EXTERNAL': {
        'TIMEOUT': 10,  # seconds
        'RETRY_ATTEMPTS': 3,
        'CIRCUIT_BREAKER_ENABLED': True,
        'FALLBACK_ENABLED': True,
    },
}

# Caching Strategy
CACHE_STRATEGY = {
    # Cache keys
    'KEYS': {
        'SHOP': 'shop:{shop_id}',
        'SHOP_PRODUCTS': 'shop:{shop_id}:products',
        'SHOP_ORDERS': 'shop:{shop_id}:orders',
        'USER_PROFILE': 'user:{user_id}:profile',
        'USER_CONVERSATIONS': 'user:{user_id}:conversations',
        'CONVERSATION': 'conversation:{user1}:{user2}',
        'SEARCH_RESULTS': 'search:{query_hash}',
        'CATEGORY_PRODUCTS': 'category:{category_id}:products',
        'REVIEWS': 'reviews:{object_type}:{object_id}',
    },
    
    # Cache invalidation
    'INVALIDATION': {
        'SHOP_UPDATE': [
            'shop:{shop_id}',
            'shop:{shop_id}:products',
            'shop:{shop_id}:orders',
        ],
        'PRODUCT_UPDATE': [
            'product:{product_id}',
            'shop:{shop_id}:products',
            'category:{category_id}:products',
        ],
        'USER_UPDATE': [
            'user:{user_id}:profile',
            'user:{user_id}:conversations',
        ],
        'MESSAGE_SENT': [
            'conversation:{user1}:{user2}',
            'user:{user1}:conversations',
            'user:{user2}:conversations',
        ],
    },
    
    # Cache warming
    'WARMING': {
        'ENABLED': True,
        'STRATEGIES': {
            'POPULAR_SHOPS': 'cache_popular_shops',
            'ACTIVE_CONVERSATIONS': 'cache_active_conversations',
            'TRENDING_PRODUCTS': 'cache_trending_products',
        },
        'SCHEDULE': {
            'POPULAR_SHOPS': '0 */6 * * *',  # Every 6 hours
            'ACTIVE_CONVERSATIONS': '*/15 * * * *',  # Every 15 minutes
            'TRENDING_PRODUCTS': '0 */2 * * *',  # Every 2 hours
        },
    },
}

# API Endpoints Configuration
API_ENDPOINTS = {
    # Public endpoints (no authentication required)
    'PUBLIC': [
        '/api/shops/public/',
        '/api/products/public/',
        '/api/categories/',
        '/api/search/',
        '/api/health/',
    ],
    
    # Authenticated endpoints
    'AUTHENTICATED': [
        '/api/user/profile/',
        '/api/shops/my/',
        '/api/products/my/',
        '/api/orders/',
        '/api/messages/',
        '/api/notifications/',
        '/api/wishlist/',
        '/api/cart/',
    ],
    
    # Shop owner endpoints
    'SHOP_OWNER': [
        '/api/shops/create/',
        '/api/products/create/',
        '/api/orders/manage/',
        '/api/analytics/',
        '/api/bulk-messages/',
    ],
    
    # Admin endpoints
    'ADMIN': [
        '/api/admin/',
        '/api/moderation/',
        '/api/reports/',
        '/api/system/',
    ],
}

# Error Handling Configuration
ERROR_HANDLING = {
    # Error codes
    'CODES': {
        'VALIDATION_ERROR': 400,
        'AUTHENTICATION_ERROR': 401,
        'AUTHORIZATION_ERROR': 403,
        'NOT_FOUND_ERROR': 404,
        'RATE_LIMIT_ERROR': 429,
        'SERVER_ERROR': 500,
        'SERVICE_UNAVAILABLE': 503,
    },
    
    # Error messages
    'MESSAGES': {
        'VALIDATION_ERROR': 'The provided data is invalid.',
        'AUTHENTICATION_ERROR': 'Authentication is required.',
        'AUTHORIZATION_ERROR': 'You do not have permission to perform this action.',
        'NOT_FOUND_ERROR': 'The requested resource was not found.',
        'RATE_LIMIT_ERROR': 'Rate limit exceeded. Please try again later.',
        'SERVER_ERROR': 'An internal server error occurred.',
        'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable.',
    },
    
    # Error logging
    'LOGGING': {
        'ENABLED': True,
        'LEVEL': 'ERROR',
        'INCLUDE_STACK_TRACE': True,
        'SENSITIVE_DATA_MASKING': True,
    },
}

# Development and Testing Configuration
DEV_CONFIG = {
    # Development settings
    'DEVELOPMENT': {
        'DEBUG': True,
        'LOG_LEVEL': 'DEBUG',
        'CACHE_ENABLED': False,
        'RATE_LIMITING_ENABLED': False,
        'SECURITY_CHECKS_ENABLED': False,
    },
    
    # Testing settings
    'TESTING': {
        'USE_TEST_DATABASE': True,
        'CACHE_ENABLED': False,
        'RATE_LIMITING_ENABLED': False,
        'MOCK_EXTERNAL_SERVICES': True,
        'FAST_TESTS': True,
    },
    
    # Staging settings
    'STAGING': {
        'DEBUG': False,
        'LOG_LEVEL': 'INFO',
        'CACHE_ENABLED': True,
        'RATE_LIMITING_ENABLED': True,
        'SECURITY_CHECKS_ENABLED': True,
    },
}

# Environment-specific configuration
def get_config_for_environment():
    """Get configuration based on environment"""
    environment = os.environ.get('DJANGO_ENV', 'development')
    
    if environment == 'production':
        return {
            'DEBUG': False,
            'LOG_LEVEL': 'WARNING',
            'CACHE_ENABLED': True,
            'RATE_LIMITING_ENABLED': True,
            'SECURITY_CHECKS_ENABLED': True,
            'COMPRESSION_ENABLED': True,
            'DB_POOL_ENABLED': True,
        }
    elif environment == 'staging':
        return DEV_CONFIG['STAGING']
    elif environment == 'testing':
        return DEV_CONFIG['TESTING']
    else:
        return DEV_CONFIG['DEVELOPMENT']

# Export all configurations
__all__ = [
    'API_PERFORMANCE_CONFIG',
    'API_SECURITY_CONFIG',
    'MESSAGING_CONFIG',
    'SHOP_SECURITY_CONFIG',
    'PERFORMANCE_CONFIG',
    'CACHE_STRATEGY',
    'API_ENDPOINTS',
    'ERROR_HANDLING',
    'DEV_CONFIG',
    'get_config_for_environment',
] 