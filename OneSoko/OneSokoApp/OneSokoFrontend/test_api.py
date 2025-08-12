#!/usr/bin/env python3
"""
Simple API test script to debug order creation issues
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/token/"
ORDERS_URL = f"{BASE_URL}/orders/"

def test_api_connection():
    """Test basic API connectivity"""
    try:
        response = requests.get(f"{BASE_URL}/products/")
        print(f"✅ API Connection: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ API Connection Failed: {e}")
        return False

def test_database_tables():
    """Test if required database tables exist"""
    endpoints_to_test = [
        "/products/",
        "/shops/",
        "/orders/",
        "/cart/",
        "/users/",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"✅ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_order_creation():
    """Test order creation with sample data"""
    # First, get some sample data
    try:
        # Get shops
        shops_response = requests.get(f"{BASE_URL}/shops/")
        if shops_response.status_code == 200:
            shops = shops_response.json()
            if 'results' in shops:
                shops = shops['results']
            
            if shops:
                shop = shops[0]
                print(f"✅ Found shop: {shop.get('name', 'Unknown')}")
                
                # Get products for this shop
                products_response = requests.get(f"{BASE_URL}/shops/{shop['shopId']}/products/")
                if products_response.status_code == 200:
                    products = products_response.json()
                    if products:
                        product = products[0]
                        print(f"✅ Found product: {product.get('name', 'Unknown')}")
                        
                        # Test order creation
                        order_data = {
                            "shop_id": shop['shopId'],
                            "items": [
                                {
                                    "product_id": product['productId'],
                                    "quantity": 1
                                }
                            ]
                        }
                        
                        print(f"📦 Testing order creation with data: {json.dumps(order_data, indent=2)}")
                        
                        order_response = requests.post(
                            f"{BASE_URL}/orders/",
                            json=order_data,
                            headers={'Content-Type': 'application/json'}
                        )
                        
                        print(f"📦 Order creation response: {order_response.status_code}")
                        if order_response.status_code != 201:
                            print(f"📦 Error response: {order_response.text}")
                        else:
                            print(f"✅ Order created successfully!")
                            return True
                    else:
                        print("❌ No products found in shop")
                else:
                    print(f"❌ Failed to get products: {products_response.status_code}")
            else:
                print("❌ No shops found")
        else:
            print(f"❌ Failed to get shops: {shops_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing order creation: {e}")
    
    return False

if __name__ == "__main__":
    print("🔍 Testing OneSoko API...")
    print("=" * 50)
    
    # Test 1: API Connection
    if test_api_connection():
        print("\n📊 Testing Database Tables...")
        test_database_tables()
        
        print("\n🛒 Testing Order Creation...")
        test_order_creation()
    else:
        print("❌ Cannot proceed without API connection")
    
    print("\n" + "=" * 50)
    print("🏁 Testing complete!") 