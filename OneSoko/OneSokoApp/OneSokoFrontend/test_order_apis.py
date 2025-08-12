#!/usr/bin/env python3
"""
Order API Testing Script for OneSoko
This script tests all order-related API endpoints
"""

import requests
import json
import time
from typing import Dict, Any, List

class OrderAPITester:
    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        
    def login(self, username: str, password: str) -> bool:
        """Login and get access token"""
        try:
            response = self.session.post(f"{self.base_url}/token/", {
                "username": username,
                "password": password
            })
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access")
                self.refresh_token = data.get("refresh")
                
                # Set authorization header
                self.session.headers.update({
                    "Authorization": f"Bearer {self.access_token}"
                })
                
                print(f"✅ Login successful for user: {username}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def test_get_all_orders(self) -> Dict[str, Any]:
        """Test getting all orders"""
        print("\n🔍 Testing: Get All Orders")
        try:
            response = self.session.get(f"{self.base_url}/orders/")
            
            if response.status_code == 200:
                orders = response.json()
                print(f"✅ Success: Found {len(orders)} orders")
                return {"success": True, "data": orders, "count": len(orders)}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_get_my_orders(self) -> Dict[str, Any]:
        """Test getting user's orders"""
        print("\n🔍 Testing: Get My Orders")
        try:
            response = self.session.get(f"{self.base_url}/orders/my_orders/")
            
            if response.status_code == 200:
                orders = response.json()
                print(f"✅ Success: Found {len(orders)} orders")
                return {"success": True, "data": orders, "count": len(orders)}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_get_order_details(self, order_id: int) -> Dict[str, Any]:
        """Test getting specific order details"""
        print(f"\n🔍 Testing: Get Order Details (ID: {order_id})")
        try:
            response = self.session.get(f"{self.base_url}/orders/{order_id}/")
            
            if response.status_code == 200:
                order = response.json()
                print(f"✅ Success: Order #{order_id} details retrieved")
                return {"success": True, "data": order}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_get_order_details_alt(self, order_id: int) -> Dict[str, Any]:
        """Test getting order details using alternative endpoint"""
        print(f"\n🔍 Testing: Get Order Details Alt (ID: {order_id})")
        try:
            response = self.session.get(f"{self.base_url}/orders/{order_id}/order_details/")
            
            if response.status_code == 200:
                order = response.json()
                print(f"✅ Success: Order #{order_id} details (alt) retrieved")
                return {"success": True, "data": order}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_create_order_from_cart(self) -> Dict[str, Any]:
        """Test creating order from cart"""
        print("\n🔍 Testing: Create Order from Cart")
        try:
            response = self.session.post(f"{self.base_url}/orders/create_from_cart/")
            
            if response.status_code == 201:
                orders = response.json()
                print(f"✅ Success: Created {len(orders)} orders from cart")
                return {"success": True, "data": orders, "count": len(orders)}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_create_direct_order(self, shop_id: str, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Test creating order directly"""
        print(f"\n🔍 Testing: Create Direct Order (Shop: {shop_id})")
        try:
            order_data = {
                "shop": shop_id,
                "products": products
            }
            
            response = self.session.post(f"{self.base_url}/orders/", json=order_data)
            
            if response.status_code == 201:
                order = response.json()
                print(f"✅ Success: Created order #{order.get('id')}")
                return {"success": True, "data": order}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_update_order_status(self, order_id: int, new_status: str) -> Dict[str, Any]:
        """Test updating order status"""
        print(f"\n🔍 Testing: Update Order Status (ID: {order_id}, Status: {new_status})")
        try:
            response = self.session.patch(f"{self.base_url}/orders/{order_id}/update_status/", 
                                        json={"status": new_status})
            
            if response.status_code == 200:
                order = response.json()
                print(f"✅ Success: Updated order #{order_id} status to {new_status}")
                return {"success": True, "data": order}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_get_available_shops(self) -> Dict[str, Any]:
        """Test getting available shops"""
        print("\n🔍 Testing: Get Available Shops")
        try:
            response = self.session.get(f"{self.base_url}/shops/")
            
            if response.status_code == 200:
                shops = response.json()
                print(f"✅ Success: Found {len(shops.get('results', shops))} shops")
                return {"success": True, "data": shops}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def test_get_available_products(self) -> Dict[str, Any]:
        """Test getting available products"""
        print("\n🔍 Testing: Get Available Products")
        try:
            response = self.session.get(f"{self.base_url}/products/")
            
            if response.status_code == 200:
                products = response.json()
                print(f"✅ Success: Found {len(products.get('results', products))} products")
                return {"success": True, "data": products}
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def run_comprehensive_test(self, username: str, password: str):
        """Run comprehensive order API tests"""
        print("🚀 Starting Comprehensive Order API Tests")
        print("=" * 50)
        
        # Login first
        if not self.login(username, password):
            print("❌ Cannot proceed without login")
            return
        
        results = []
        
        # Test 1: Get available shops and products
        shops_result = self.test_get_available_shops()
        products_result = self.test_get_available_products()
        results.extend([shops_result, products_result])
        
        # Test 2: Get all orders
        all_orders_result = self.test_get_all_orders()
        results.append(all_orders_result)
        
        # Test 3: Get my orders
        my_orders_result = self.test_get_my_orders()
        results.append(my_orders_result)
        
        # Test 4: Create order from cart (if cart has items)
        cart_order_result = self.test_create_order_from_cart()
        results.append(cart_order_result)
        
        # Test 5: Create direct order (if we have shops and products)
        if shops_result["success"] and products_result["success"]:
            shops_data = shops_result["data"].get("results", shops_result["data"])
            products_data = products_result["data"].get("results", products_result["data"])
            
            if shops_data and products_data:
                # Use first shop and first product
                shop_id = shops_data[0]["shopId"]
                product_id = products_data[0]["productId"]
                
                direct_order_result = self.test_create_direct_order(
                    shop_id, 
                    [{"product": product_id, "quantity": 1}]
                )
                results.append(direct_order_result)
                
                # Test 6: Update order status (if order was created)
                if direct_order_result["success"]:
                    order_id = direct_order_result["data"]["id"]
                    update_status_result = self.test_update_order_status(order_id, "paid")
                    results.append(update_status_result)
                    
                    # Test 7: Get order details
                    order_details_result = self.test_get_order_details(order_id)
                    results.append(order_details_result)
                    
                    # Test 8: Get order details (alternative endpoint)
                    order_details_alt_result = self.test_get_order_details_alt(order_id)
                    results.append(order_details_alt_result)
        
        # Test 9: Test with existing orders (if any)
        if all_orders_result["success"] and all_orders_result["count"] > 0:
            orders = all_orders_result["data"]
            first_order = orders[0]
            order_id = first_order["id"]
            
            print(f"\n🔍 Testing with existing order #{order_id}")
            existing_order_details = self.test_get_order_details(order_id)
            results.append(existing_order_details)
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        successful_tests = sum(1 for r in results if r["success"])
        total_tests = len(results)
        
        print(f"Total Tests: {total_tests}")
        print(f"Successful: {successful_tests}")
        print(f"Failed: {total_tests - successful_tests}")
        print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if total_tests - successful_tests > 0:
            print("\n❌ Failed Tests:")
            for i, result in enumerate(results, 1):
                if not result["success"]:
                    print(f"  {i}. {result.get('error', 'Unknown error')}")
        
        print("\n✅ All tests completed!")

def main():
    """Main function to run the tests"""
    print("OneSoko Order API Testing Tool")
    print("=" * 40)
    
    # Configuration
    base_url = input("Enter API base URL (default: http://localhost:8000/api): ").strip()
    if not base_url:
        base_url = "http://localhost:8000/api"
    
    username = input("Enter username: ").strip()
    password = input("Enter password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required")
        return
    
    # Create tester and run tests
    tester = OrderAPITester(base_url)
    tester.run_comprehensive_test(username, password)

if __name__ == "__main__":
    main() 