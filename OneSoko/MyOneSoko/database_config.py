# Database Performance Settings
# Add these to your settings.py

# Connection pooling for better database performance
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'OneSokodb',
        'USER': 'flamers',
        'PASSWORD': 'Feston@01',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'use_unicode': True,
            # Connection pooling settings
            'sql_mode': 'traditional',
        },
        'CONN_MAX_AGE': 600,  # Keep connections alive for 10 minutes
        'CONN_HEALTH_CHECKS': True,  # Health check connections
        'TEST': {
            'CHARSET': 'utf8mb4',
            'COLLATION': 'utf8mb4_unicode_ci',
        }
    }
}

# Database connection pooling with django-db-pool
# Install: pip install django-db-pool
DATABASES['default']['ENGINE'] = 'django_db_pool.db.backends.mysql'
DATABASES['default']['POOL_OPTIONS'] = {
    'POOL_SIZE': 10,        # Number of connections to maintain
    'MAX_OVERFLOW': 20,     # Additional connections when needed
    'POOL_TIMEOUT': 30,     # Timeout when getting connection
    'POOL_RECYCLE': 3600,   # Recycle connections every hour
    'POOL_PRE_PING': True,  # Validate connections before use
}

# Query optimization
DATABASE_QUERY_TIMEOUT = 30  # 30 seconds timeout for queries

# Read/Write database splitting (for future scaling)
DATABASE_ROUTERS = ['path.to.db_router.DatabaseRouter']
