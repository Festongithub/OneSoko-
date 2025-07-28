from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, Shop, Product, Category
import json

class UserAPITestCase(APITestCase):
    """Test cases for User Registration API"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_registration_url = '/api/users/'
        self.shopowner_registration_url = '/api/shopowners/'
        self.token_url = '/api/token/'
        self.token_refresh_url = '/api/token/refresh/'
        self.userprofile_url = '/api/userprofiles/'
        
        # Test data
        self.valid_user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'testpass123'
        }
        
        self.valid_shopowner_data = {
            'username': 'shopowner',
            'email': 'shopowner@example.com',
            'password': 'shopowner123'
        }
        
        self.invalid_user_data = {
            'username': '',
            'email': 'invalid-email',
            'password': '123'  # Too short
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.user_registration_url, self.valid_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        
        user = User.objects.first()
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertTrue(user.check_password('testpass123'))
        
        # Check that UserProfile was created with is_shopowner=False
        profile = UserProfile.objects.get(user=user)
        self.assertFalse(profile.is_shopowner)
        
        # Check response data
        self.assertIn('id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertNotIn('password', response.data)  # Password should not be returned

    def test_shopowner_registration_success(self):
        """Test successful shop owner registration"""
        response = self.client.post(self.shopowner_registration_url, self.valid_shopowner_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        
        user = User.objects.first()
        self.assertEqual(user.username, 'shopowner')
        self.assertEqual(user.email, 'shopowner@example.com')
        self.assertTrue(user.check_password('shopowner123'))
        
        # Check that UserProfile was created with is_shopowner=True
        profile = UserProfile.objects.get(user=user)
        self.assertTrue(profile.is_shopowner)
        
        # Check response data
        self.assertIn('id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertNotIn('password', response.data)

    def test_user_registration_duplicate_username(self):
        """Test user registration with duplicate username"""
        # Create first user
        User.objects.create_user(
            username='testuser',
            email='existing@example.com',
            password='pass123'
        )
        
        # Try to register with same username
        response = self.client.post(self.user_registration_url, self.valid_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
        self.assertEqual(User.objects.count(), 1)  # Only one user should exist

    def test_user_registration_duplicate_email(self):
        """Test user registration with duplicate email"""
        # Create first user
        User.objects.create_user(
            username='existinguser',
            email='testuser@example.com',
            password='pass123'
        )
        
        # Try to register with same email
        response = self.client.post(self.user_registration_url, self.valid_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_user_registration_invalid_data(self):
        """Test user registration with invalid data"""
        response = self.client.post(self.user_registration_url, self.invalid_user_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
        
        # Check for specific validation errors
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertIn('password', response.data)

    def test_user_registration_missing_fields(self):
        """Test user registration with missing required fields"""
        incomplete_data = {'username': 'testuser'}
        response = self.client.post(self.user_registration_url, incomplete_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_user_registration_weak_password(self):
        """Test user registration with weak password"""
        weak_password_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': '123'  # Too short
        }
        response = self.client.post(self.user_registration_url, weak_password_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_user_registration_invalid_email_format(self):
        """Test user registration with invalid email format"""
        invalid_email_data = {
            'username': 'testuser',
            'email': 'invalid-email-format',
            'password': 'testpass123'
        }
        response = self.client.post(self.user_registration_url, invalid_email_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_user_registration_get_method_not_allowed(self):
        """Test that GET method is not allowed for user registration"""
        response = self.client.get(self.user_registration_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_shopowner_registration_get_method_not_allowed(self):
        """Test that GET method is not allowed for shop owner registration"""
        response = self.client.get(self.shopowner_registration_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class AuthenticationAPITestCase(APITestCase):
    """Test cases for Authentication APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.token_url = '/api/token/'
        self.token_refresh_url = '/api/token/refresh/'
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.valid_credentials = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        self.invalid_credentials = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }

    def test_token_obtain_success(self):
        """Test successful token obtain"""
        response = self.client.post(self.token_url, self.valid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify tokens are valid
        access_token = response.data['access']
        refresh_token = response.data['refresh']
        
        # Test that we can use the access token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/userprofiles/')
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_obtain_invalid_credentials(self):
        """Test token obtain with invalid credentials"""
        response = self.client.post(self.token_url, self.invalid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_token_obtain_missing_credentials(self):
        """Test token obtain with missing credentials"""
        response = self.client.post(self.token_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_refresh_success(self):
        """Test successful token refresh"""
        # First obtain tokens
        token_response = self.client.post(self.token_url, self.valid_credentials)
        refresh_token = token_response.data['refresh']
        
        # Refresh the token
        response = self.client.post(self.token_refresh_url, {'refresh': refresh_token})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertNotIn('refresh', response.data)  # Should not return new refresh token

    def test_token_refresh_invalid_token(self):
        """Test token refresh with invalid refresh token"""
        response = self.client.post(self.token_refresh_url, {'refresh': 'invalid-token'})
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_missing_token(self):
        """Test token refresh with missing refresh token"""
        response = self.client.post(self.token_refresh_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_obtain_get_method_not_allowed(self):
        """Test that GET method is not allowed for token obtain"""
        response = self.client.get(self.token_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_token_refresh_get_method_not_allowed(self):
        """Test that GET method is not allowed for token refresh"""
        response = self.client.get(self.token_refresh_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class UserProfileAPITestCase(APITestCase):
    """Test cases for User Profile APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.userprofile_url = '/api/userprofiles/'
        
        # Create test users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='pass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='pass123'
        )
        
        # Create user profiles
        self.profile1 = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio for user1',
            address='123 Test St',
            is_shopowner=False
        )
        self.profile2 = UserProfile.objects.create(
            user=self.user2,
            bio='Test bio for user2',
            address='456 Test Ave',
            is_shopowner=True
        )
        
        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)

    def test_list_userprofiles_authenticated(self):
        """Test listing user profiles when authenticated"""
        response = self.client.get(self.userprofile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Should return all profiles

    def test_list_userprofiles_unauthenticated(self):
        """Test listing user profiles when not authenticated"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.userprofile_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_userprofile(self):
        """Test retrieving a specific user profile"""
        response = self.client.get(f'{self.userprofile_url}{self.profile1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Test bio for user1')
        self.assertEqual(response.data['address'], '123 Test St')
        self.assertFalse(response.data['is_shopowner'])

    def test_create_userprofile(self):
        """Test creating a new user profile"""
        new_user = User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='pass123'
        )
        
        profile_data = {
            'user': new_user.id,
            'bio': 'New user bio',
            'address': '789 New St',
            'is_shopowner': False
        }
        
        response = self.client.post(self.userprofile_url, profile_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserProfile.objects.count(), 3)
        
        new_profile = UserProfile.objects.get(user=new_user)
        self.assertEqual(new_profile.bio, 'New user bio')
        self.assertEqual(new_profile.address, '789 New St')

    def test_update_userprofile(self):
        """Test updating a user profile"""
        update_data = {
            'bio': 'Updated bio',
            'address': 'Updated address'
        }
        
        response = self.client.patch(f'{self.userprofile_url}{self.profile1.id}/', update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.profile1.refresh_from_db()
        self.assertEqual(self.profile1.bio, 'Updated bio')
        self.assertEqual(self.profile1.address, 'Updated address')

    def test_delete_userprofile(self):
        """Test deleting a user profile"""
        response = self.client.delete(f'{self.userprofile_url}{self.profile1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserProfile.objects.count(), 1)  # profile2 should still exist

    def test_userprofile_validation(self):
        """Test user profile validation"""
        invalid_data = {
            'bio': 'A' * 1001,  # Too long bio
            'address': 'A' * 256  # Too long address
        }
        
        response = self.client.post(self.userprofile_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_userprofile_shopowner_flag(self):
        """Test that shop owner flag is properly handled"""
        # Test profile with is_shopowner=True
        response = self.client.get(f'{self.userprofile_url}{self.profile2.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_shopowner'])


class UserAPIIntegrationTestCase(APITestCase):
    """Integration tests for user APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_registration_url = '/api/users/'
        self.token_url = '/api/token/'
        self.userprofile_url = '/api/userprofiles/'

    def test_complete_user_workflow(self):
        """Test complete user registration and profile workflow"""
        # 1. Register a new user
        user_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'integration123'
        }
        
        registration_response = self.client.post(self.user_registration_url, user_data)
        self.assertEqual(registration_response.status_code, status.HTTP_201_CREATED)
        
        # 2. Login to get token
        login_data = {
            'username': 'integrationuser',
            'password': 'integration123'
        }
        
        token_response = self.client.post(self.token_url, login_data)
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        
        access_token = token_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # 3. Access user profiles with token
        profile_response = self.client.get(self.userprofile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        
        # 4. Update user profile
        user = User.objects.get(username='integrationuser')
        profile = UserProfile.objects.get(user=user)
        
        update_data = {
            'bio': 'Integration test bio',
            'address': 'Integration test address'
        }
        
        update_response = self.client.patch(f'{self.userprofile_url}{profile.id}/', update_data)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        
        # 5. Verify the update
        profile.refresh_from_db()
        self.assertEqual(profile.bio, 'Integration test bio')
        self.assertEqual(profile.address, 'Integration test address')

    def test_shopowner_workflow(self):
        """Test shop owner registration and verification"""
        # 1. Register a shop owner
        shopowner_data = {
            'username': 'shopowner_integration',
            'email': 'shopowner_integration@example.com',
            'password': 'shopowner123'
        }
        
        registration_response = self.client.post('/api/shopowners/', shopowner_data)
        self.assertEqual(registration_response.status_code, status.HTTP_201_CREATED)
        
        # 2. Verify user profile was created with is_shopowner=True
        user = User.objects.get(username='shopowner_integration')
        profile = UserProfile.objects.get(user=user)
        self.assertTrue(profile.is_shopowner)
        
        # 3. Login and verify access
        login_data = {
            'username': 'shopowner_integration',
            'password': 'shopowner123'
        }
        
        token_response = self.client.post(self.token_url, login_data)
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        
        access_token = token_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # 4. Access user profiles
        profile_response = self.client.get(self.userprofile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        
        # 5. Verify profile data
        user_profile_response = self.client.get(f'{self.userprofile_url}{profile.id}/')
        self.assertEqual(user_profile_response.status_code, status.HTTP_200_OK)
        self.assertTrue(user_profile_response.data['is_shopowner'])
