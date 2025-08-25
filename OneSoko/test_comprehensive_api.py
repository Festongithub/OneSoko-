#!/usr/bin/env python3
"""
Comprehensive API testing script for OneSoko platform
Tests all major endpoints including wishlist and order management
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"

class OneSokoAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        
    def test_endpoint(self, method, endpoint, data=None, headers=None, auth_required=True):
        """Generic method to test API endpoints"""
        url = f"{API_BASE}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
            
        if auth_required and self.auth_token:
            default_headers["Authorization"] = f"Bearer {self.auth_token}"
        
        print(f"\n🧪 Testing {method} {endpoint}")
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=default_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=default_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=default_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=default_headers)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=default_headers)
            else:
                print(f"❌ Unsupported method: {method}")
                return None
                
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code >= 400:
                print(f"❌ Error Response: {response.text[:200]}...")
            else:
                print(f"✅ Success")
                if response.content:
                    try:
                        data = response.json()
                        if isinstance(data, dict):
                            print(f"📝 Keys: {list(data.keys())}")
                        elif isinstance(data, list):
                            print(f"📝 List length: {len(data)}")
                    except:
                        print(f"📝 Response length: {len(response.text)}")
            
            return response
            
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
            return None
    
    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("🔐 TESTING AUTHENTICATION")
        print("="*50)
        
        # Test user registration
        register_data = {
            "username": "testuser_api",
            "email": "testuser_api@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = self.test_endpoint("POST", "/auth/register/", register_data, auth_required=False)
        
        # Test login
        login_data = {
            "email": "testuser_api@example.com",
            "password": "testpass123"
        }
        
        response = self.test_endpoint("POST", "/auth/login/", login_data, auth_required=False)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.auth_token = data.get("access_token") or data.get("access") or data.get("token")
                self.user_id = data.get("user", {}).get("id")
                print(f"✅ Authentication successful! Token: {self.auth_token[:20]}..." if self.auth_token else "❌ No token in response")
            except:
                print("❌ Failed to parse login response")
    
    def test_wishlist_endpoints(self):
        """Test wishlist functionality"""
        print("\n" + "="*50)
        print("❤️ TESTING WISHLIST ENDPOINTS")
        print("="*50)
        
        # List wishlists
        self.test_endpoint("GET", "/wishlists/")
        
        # Get wishlist stats
        self.test_endpoint("GET", "/wishlists/stats/")
        
        # Clear wishlist
        self.test_endpoint("DELETE", "/wishlists/clear/")
        
        # Test adding products to wishlist (need product IDs)
        products_response = self.test_endpoint("GET", "/products/")
        if products_response and products_response.status_code == 200:
            try:
                products = products_response.json()
                if isinstance(products, list) and len(products) > 0:
                    product_id = products[0]["id"]
                    print(f"📦 Using product ID: {product_id}")
                    
                    # Add to wishlist
                    self.test_endpoint("POST", f"/wishlists/add_product/", {"product_id": product_id})
                    
                    # Check if product is in wishlist
                    self.test_endpoint("GET", f"/wishlists/check_product/{product_id}/")
                    
                    # Toggle wishlist item
                    self.test_endpoint("POST", f"/wishlists/toggle/", {"product_id": product_id})
                    
                    # Remove from wishlist
                    self.test_endpoint("DELETE", f"/wishlists/remove_product/", {"product_id": product_id})
                    
                elif isinstance(products, dict) and "results" in products and len(products["results"]) > 0:
                    product_id = products["results"][0]["id"]
                    print(f"📦 Using product ID: {product_id}")
                    
                    # Add to wishlist
                    self.test_endpoint("POST", f"/wishlists/add_product/", {"product_id": product_id})
                    
                    # Check if product is in wishlist
                    self.test_endpoint("GET", f"/wishlists/check_product/{product_id}/")
                    
                    # Toggle wishlist item
                    self.test_endpoint("POST", f"/wishlists/toggle/", {"product_id": product_id})
                    
                    # Remove from wishlist
                    self.test_endpoint("DELETE", f"/wishlists/remove_product/", {"product_id": product_id})
                else:
                    print("❌ No products found for wishlist testing")
            except Exception as e:
                print(f"❌ Error processing products: {e}")
    
    def test_order_management_endpoints(self):
        """Test enhanced order management"""
        print("\n" + "="*50)
        print("📦 TESTING ORDER MANAGEMENT ENDPOINTS")
        print("="*50)
        
        # List orders
        self.test_endpoint("GET", "/orders/")
        
        # Enhanced orders
        self.test_endpoint("GET", "/enhanced-orders/")
        
        # Order dashboard summary
        self.test_endpoint("GET", "/enhanced-orders/dashboard_summary/")
        
        # Order analytics
        self.test_endpoint("GET", "/enhanced-orders/analytics/")
        
        # Order reports
        self.test_endpoint("GET", "/orders/reports/")
    
    def test_product_endpoints(self):
        """Test product-related endpoints"""
        print("\n" + "="*50)
        print("🛍️ TESTING PRODUCT ENDPOINTS")
        print("="*50)
        
        # List products
        self.test_endpoint("GET", "/products/")
        
        # List categories
        self.test_endpoint("GET", "/categories/")
        
        # List shops
        self.test_endpoint("GET", "/shops/")
        
        # Featured shops
        self.test_endpoint("GET", "/shops/featured/")
        
        # Popular shops
        self.test_endpoint("GET", "/shops/popular/")
    
    def test_notification_endpoints(self):
        """Test notification system"""
        print("\n" + "="*50)
        print("🔔 TESTING NOTIFICATION ENDPOINTS")
        print("="*50)
        
        # Get notifications
        self.test_endpoint("GET", "/notifications/")
        
        # Notification summary
        self.test_endpoint("GET", "/notifications/summary/")
        
        # Unread count
        self.test_endpoint("GET", "/notifications/unread_count/")
        
        # Create test notifications
        self.test_endpoint("POST", "/notifications/create-test/")
    
    def test_loyalty_endpoints(self):
        """Test loyalty system"""
        print("\n" + "="*50)
        print("🎁 TESTING LOYALTY ENDPOINTS")
        print("="*50)
        
        # Get referral info
        self.test_endpoint("GET", "/loyalty/referral-info/")
    
    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting OneSoko API Comprehensive Testing")
        print(f"🔗 Base URL: {BASE_URL}")
        print(f"⏰ Started at: {datetime.now()}")
        
        # Test authentication first
        self.test_authentication()
        
        if not self.auth_token:
            print("\n❌ Authentication failed - skipping authenticated endpoints")
            return
            
        # Test all endpoints
        self.test_wishlist_endpoints()
        self.test_order_management_endpoints()
        self.test_product_endpoints()
        self.test_notification_endpoints()
        self.test_loyalty_endpoints()
        
        print("\n" + "="*50)
        print("✅ COMPREHENSIVE TESTING COMPLETED")
        print("="*50)

def main():
    tester = OneSokoAPITester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
