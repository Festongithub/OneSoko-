#!/usr/bin/env python
"""
Test script to debug shop owner registration
"""
import os
import django
import sys

# Add the project directory to the path
sys.path.append('/home/flamers/OneSoko-/OneSoko')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

import json
from rest_framework.test import APIRequestFactory
from OneSokoApp.auth_views import register_shop_owner

def test_shop_owner_registration():
    """Test shop owner registration endpoint"""
    print("🔍 Testing Shop Owner Registration...")
    
    # Create test request factory
    factory = APIRequestFactory()
    
    # Test data for shop owner registration
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    test_data = {
        'email': f'testshopowner_{unique_id}@example.com',
        'password': 'SecurePassword123!',
        'first_name': 'Test',
        'last_name': 'Owner',
        'shop_name': f'Test Shop {unique_id}',
        'shop_description': 'A test shop for debugging',
        'shop_address': '123 Test Street',
        'phone_number': '+1234567890'
    }
    
    print(f"✅ Test data: {test_data}")
    
    # Create POST request
    request = factory.post(
        '/api/auth/register/shop-owner/',
        data=json.dumps(test_data),
        content_type='application/json'
    )
    
    print("✅ Request created")
    
    try:
        # Call the registration function
        response = register_shop_owner(request)
        print(f"✅ Response status: {response.status_code}")
        print(f"✅ Response data: {response.data}")
        
        if response.status_code == 201:
            print("🎉 Shop owner registration successful!")
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        import traceback
        print("Full traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    test_shop_owner_registration()
