"""
Shop Security Test Script

This script tests the shop security implementation to ensure only shop owners
can access their own shops.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append('/home/flamers/OneSoko-/OneSoko')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from django.contrib.auth.models import User
from OneSokoApp.models import Shop, UserProfile
from OneSokoApp.permissions import IsShopOwner, IsShopOwnerForManagement
from OneSokoApp.shop_security import ShopOwnershipValidator
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MockRequest:
    """Mock request object for testing"""
    def __init__(self, user, method='GET'):
        self.user = user
        self.method = method

def test_shop_security():
    """Test shop security implementation"""
    print("🔒 Testing Shop Security Implementation")
    print("=" * 50)
    
    # Test 1: Permission validation for non-authenticated user
    print("\n1. Testing unauthenticated user access...")
    
    # Create a mock unauthenticated user
    from django.contrib.auth.models import AnonymousUser
    anon_user = AnonymousUser()
    request = MockRequest(anon_user)
    
    permission = IsShopOwner()
    has_permission = permission.has_permission(request, None)
    
    print(f"   ❌ Unauthenticated user access: {'DENIED' if not has_permission else 'ALLOWED'}")
    assert not has_permission, "Unauthenticated users should not have access"
    
    # Test 2: Permission validation for non-shop owner
    print("\n2. Testing regular user (non-shop owner) access...")
    
    # Create a regular user
    try:
        regular_user = User.objects.get(username='test_customer')
    except User.DoesNotExist:
        regular_user = User.objects.create_user(
            username='test_customer',
            email='customer@test.com',
            password='testpass123'
        )
    
    # Ensure user has profile but is not shop owner
    profile, created = UserProfile.objects.get_or_create(
        user=regular_user,
        defaults={'is_shopowner': False}
    )
    profile.is_shopowner = False
    profile.save()
    
    request = MockRequest(regular_user)
    has_permission = permission.has_permission(request, None)
    
    print(f"   ❌ Regular user access: {'DENIED' if not has_permission else 'ALLOWED'}")
    assert not has_permission, "Regular users should not have shop access"
    
    # Test 3: Permission validation for shop owner
    print("\n3. Testing shop owner access...")
    
    # Create a shop owner
    try:
        shop_owner = User.objects.get(username='test_shop_owner')
    except User.DoesNotExist:
        shop_owner = User.objects.create_user(
            username='test_shop_owner',
            email='shopowner@test.com',
            password='testpass123'
        )
    
    # Ensure user has shop owner profile
    profile, created = UserProfile.objects.get_or_create(
        user=shop_owner,
        defaults={'is_shopowner': True}
    )
    profile.is_shopowner = True
    profile.save()
    
    request = MockRequest(shop_owner)
    has_permission = permission.has_permission(request, None)
    
    print(f"   ✅ Shop owner access: {'ALLOWED' if has_permission else 'DENIED'}")
    assert has_permission, "Shop owners should have access"
    
    # Test 4: Object-level permission validation
    print("\n4. Testing object-level permissions...")
    
    # Create a shop owned by the shop owner
    shop, created = Shop.objects.get_or_create(
        name='Test Shop',
        shopowner=shop_owner,
        defaults={
            'description': 'Test shop for security testing',
            'location': 'Test Location',
            'email': 'shop@test.com'
        }
    )
    
    # Test shop owner accessing their own shop
    has_object_permission = permission.has_object_permission(request, None, shop)
    print(f"   ✅ Owner accessing own shop: {'ALLOWED' if has_object_permission else 'DENIED'}")
    assert has_object_permission, "Shop owners should access their own shops"
    
    # Create another shop owner
    try:
        other_shop_owner = User.objects.get(username='other_shop_owner')
    except User.DoesNotExist:
        other_shop_owner = User.objects.create_user(
            username='other_shop_owner',
            email='othershop@test.com',
            password='testpass123'
        )
    
    # Ensure other user has shop owner profile
    other_profile, created = UserProfile.objects.get_or_create(
        user=other_shop_owner,
        defaults={'is_shopowner': True}
    )
    other_profile.is_shopowner = True
    other_profile.save()
    
    # Test other shop owner accessing first shop owner's shop
    other_request = MockRequest(other_shop_owner)
    has_object_permission = permission.has_object_permission(other_request, None, shop)
    print(f"   ❌ Other owner accessing different shop: {'DENIED' if not has_object_permission else 'ALLOWED'}")
    assert not has_object_permission, "Shop owners should not access other shops"
    
    # Test 5: Shop ownership validator
    print("\n5. Testing ShopOwnershipValidator...")
    
    # Test valid access
    is_valid, error = ShopOwnershipValidator.validate_shop_access(shop_owner, shop.shopId)
    print(f"   ✅ Valid shop access: {'ALLOWED' if is_valid else f'DENIED - {error}'}")
    assert is_valid, "Valid shop access should be allowed"
    
    # Test invalid access
    is_valid, error = ShopOwnershipValidator.validate_shop_access(other_shop_owner, shop.shopId)
    print(f"   ❌ Invalid shop access: {'DENIED' if not is_valid else 'ALLOWED'} - {error}")
    assert not is_valid, "Invalid shop access should be denied"
    
    # Test getting user shops
    user_shops = ShopOwnershipValidator.get_user_shops(shop_owner)
    print(f"   📊 User shops count: {user_shops.count()}")
    assert user_shops.count() >= 1, "Shop owner should have at least one shop"
    
    # Test 6: Strict management permissions
    print("\n6. Testing strict management permissions...")
    
    strict_permission = IsShopOwnerForManagement()
    
    # Regular user should not have management access
    regular_request = MockRequest(regular_user)
    has_strict_permission = strict_permission.has_permission(regular_request, None)
    print(f"   ❌ Regular user management access: {'DENIED' if not has_strict_permission else 'ALLOWED'}")
    assert not has_strict_permission, "Regular users should not have management access"
    
    # Shop owner should have management access
    has_strict_permission = strict_permission.has_permission(request, None)
    print(f"   ✅ Shop owner management access: {'ALLOWED' if has_strict_permission else 'DENIED'}")
    assert has_strict_permission, "Shop owners should have management access"
    
    print("\n" + "=" * 50)
    print("🎉 All security tests passed!")
    print("✅ Shop access control is working correctly")
    print("🔒 Only shop owners can access their own shops")
    
    return True

if __name__ == "__main__":
    try:
        test_shop_security()
        print("\n🔒 Shop Security Implementation: VERIFIED ✅")
    except Exception as e:
        print(f"\n❌ Security test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
