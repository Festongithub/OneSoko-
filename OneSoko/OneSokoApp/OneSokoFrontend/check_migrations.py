#!/usr/bin/env python3
"""
Check Django migration status and database tables
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/flamers/OneSoko-/OneSoko')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'OneSoko.settings')
django.setup()

from django.db import connection
from django.apps import apps
from django.core.management import execute_from_command_line

def check_migration_status():
    """Check the status of Django migrations"""
    print("🔍 Checking Django Migration Status...")
    print("=" * 50)
    
    try:
        # Run showmigrations command
        execute_from_command_line(['manage.py', 'showmigrations'])
    except Exception as e:
        print(f"❌ Error checking migrations: {e}")

def check_database_tables():
    """Check which database tables exist"""
    print("\n📊 Checking Database Tables...")
    print("=" * 50)
    
    try:
        with connection.cursor() as cursor:
            # Get all tables in the database
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            
            print(f"✅ Found {len(tables)} tables in database")
            
            # Check for required tables
            required_tables = [
                'OneSokoApp_product',
                'OneSokoApp_shop', 
                'OneSokoApp_order',
                'OneSokoApp_orderitem',
                'OneSokoApp_cart',
                'OneSokoApp_cartitem',
                'OneSokoApp_userprofile',
                'OneSokoApp_category',
                'OneSokoApp_tag',
                'OneSokoApp_review',
                'OneSokoApp_wishlist',
                'OneSokoApp_message',
                'OneSokoApp_notification',
                'OneSokoApp_payment',
                'auth_user',
                'django_migrations'
            ]
            
            missing_tables = []
            existing_tables = []
            
            for table in required_tables:
                if table in tables:
                    existing_tables.append(table)
                    print(f"✅ {table}")
                else:
                    missing_tables.append(table)
                    print(f"❌ {table} - MISSING")
            
            print(f"\n📈 Summary:")
            print(f"   Existing tables: {len(existing_tables)}")
            print(f"   Missing tables: {len(missing_tables)}")
            
            if missing_tables:
                print(f"\n⚠️  Missing tables that need to be created:")
                for table in missing_tables:
                    print(f"   - {table}")
                return False
            else:
                print(f"\n✅ All required tables exist!")
                return True
                
    except Exception as e:
        print(f"❌ Error checking database tables: {e}")
        return False

def check_model_registration():
    """Check if all models are properly registered"""
    print("\n🏗️  Checking Model Registration...")
    print("=" * 50)
    
    try:
        # Get all registered models
        models = apps.get_models()
        
        required_models = [
            'Product',
            'Shop', 
            'Order',
            'OrderItem',
            'Cart',
            'CartItem',
            'UserProfile',
            'Category',
            'Tag',
            'Review',
            'Wishlist',
            'Message',
            'Notification',
            'Payment'
        ]
        
        registered_models = [model.__name__ for model in models]
        
        for model_name in required_models:
            if model_name in registered_models:
                print(f"✅ {model_name}")
            else:
                print(f"❌ {model_name} - NOT REGISTERED")
                
    except Exception as e:
        print(f"❌ Error checking model registration: {e}")

if __name__ == "__main__":
    print("🔍 OneSoko Database Health Check")
    print("=" * 50)
    
    # Check model registration
    check_model_registration()
    
    # Check database tables
    tables_ok = check_database_tables()
    
    # Check migration status
    check_migration_status()
    
    print("\n" + "=" * 50)
    if tables_ok:
        print("✅ Database looks healthy!")
    else:
        print("❌ Database has issues - run migrations!")
        print("\n💡 To fix, run:")
        print("   source env/bin/activate")
        print("   python manage.py makemigrations")
        print("   python manage.py migrate")
    
    print("🏁 Health check complete!") 