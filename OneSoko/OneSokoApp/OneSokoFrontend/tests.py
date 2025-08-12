from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, Shop, Product, Category
import json
import tempfile
import os
from django.core.files.uploadedfile import SimpleUploadedFile

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
    """Test cases for User Profile APIs with improved POST method"""
    
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # Create test client
        self.client = APIClient()
        
        # Get JWT token for user1
        response = self.client.post('/api/token/', {
            'username': 'testuser1',
            'password': 'testpass123'
        })
        self.token1 = response.data['access']
        
        # Get JWT token for user2
        response = self.client.post('/api/token/', {
            'username': 'testuser2',
            'password': 'testpass123'
        })
        self.token2 = response.data['access']

    def test_create_user_profile_success(self):
        """Test successful creation of user profile"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        data = {
            'bio': 'This is my bio',
            'address': '123 Test Street, Test City',
            'is_shopowner': False
        }
        
        response = self.client.post('/api/userprofiles/', data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(UserProfile.objects.count(), 1)
        
        profile = UserProfile.objects.first()
        self.assertEqual(profile.user, self.user1)
        self.assertEqual(profile.bio, 'This is my bio')
        self.assertEqual(profile.address, '123 Test Street, Test City')
        self.assertFalse(profile.is_shopowner)

    def test_create_user_profile_duplicate(self):
        """Test that user cannot create multiple profiles"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        # Create first profile
        data1 = {'bio': 'First bio', 'address': 'Address 1'}
        response1 = self.client.post('/api/userprofiles/', data1)
        self.assertEqual(response1.status_code, 201)
        
        # Try to create second profile
        data2 = {'bio': 'Second bio', 'address': 'Address 2'}
        response2 = self.client.post('/api/userprofiles/', data2)
        
        self.assertEqual(response2.status_code, 400)
        self.assertIn('already exists', response2.data['detail'])

    def test_create_user_profile_validation(self):
        """Test validation errors for user profile creation"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        # Test bio too long
        data = {
            'bio': 'A' * 1001,  # Exceeds 1000 character limit
            'address': 'Test address'
        }
        response = self.client.post('/api/userprofiles/', data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('1000 characters', response.data['bio'][0])
        
        # Test address too long
        data = {
            'bio': 'Valid bio',
            'address': 'A' * 256  # Exceeds 255 character limit
        }
        response = self.client.post('/api/userprofiles/', data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('255 characters', response.data['address'][0])

    def test_get_user_profile_me(self):
        """Test getting current user's profile via /me endpoint"""
        # Create profile first
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio',
            address='Test address'
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.get('/api/userprofiles/me/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['bio'], 'Test bio')
        self.assertEqual(response.data['username'], 'testuser1')
        self.assertEqual(response.data['email'], 'test1@example.com')

    def test_update_user_profile_bio(self):
        """Test updating bio via custom endpoint"""
        # Create profile first
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Old bio',
            address='Test address'
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.patch('/api/userprofiles/update_bio/', {
            'bio': 'New bio'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['bio'], 'New bio')
        
        # Verify in database
        profile.refresh_from_db()
        self.assertEqual(profile.bio, 'New bio')

    def test_update_user_profile_address(self):
        """Test updating address via custom endpoint"""
        # Create profile first
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio',
            address='Old address'
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.patch('/api/userprofiles/update_address/', {
            'address': 'New address'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['address'], 'New address')
        
        # Verify in database
        profile.refresh_from_db()
        self.assertEqual(profile.address, 'New address')

    def test_user_profile_permissions(self):
        """Test that users can only access their own profiles"""
        # Create profiles for both users
        profile1 = UserProfile.objects.create(
            user=self.user1,
            bio='User 1 bio',
            address='User 1 address'
        )
        profile2 = UserProfile.objects.create(
            user=self.user2,
            bio='User 2 bio',
            address='User 2 address'
        )
        
        # User1 should only see their own profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.get('/api/userprofiles/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['bio'], 'User 1 bio')
        
        # User2 should only see their own profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        response = self.client.get('/api/userprofiles/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['bio'], 'User 2 bio')

    def test_user_profile_unauthorized(self):
        """Test that unauthorized requests are rejected"""
        response = self.client.post('/api/userprofiles/', {
            'bio': 'Test bio',
            'address': 'Test address'
        })
        
        self.assertEqual(response.status_code, 401)

    def test_user_profile_serializer_fields(self):
        """Test that serializer includes all expected fields"""
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio',
            address='Test address',
            is_shopowner=True
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.get(f'/api/userprofiles/{profile.id}/')
        
        self.assertEqual(response.status_code, 200)
        expected_fields = ['id', 'user', 'username', 'email', 'bio', 'avatar', 'address', 'is_shopowner']
        for field in expected_fields:
            self.assertIn(field, response.data)
        
        self.assertEqual(response.data['username'], 'testuser1')
        self.assertEqual(response.data['email'], 'test1@example.com')
        self.assertEqual(response.data['bio'], 'Test bio')
        self.assertEqual(response.data['address'], 'Test address')
        self.assertTrue(response.data['is_shopowner'])

    def test_list_userprofiles_unauthenticated(self):
        """Test listing user profiles when not authenticated"""
        response = self.client.get('/api/userprofiles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_userprofile(self):
        """Test retrieving a specific user profile"""
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio for user1',
            address='123 Test St',
            is_shopowner=False
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.get(f'/api/userprofiles/{profile.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Test bio for user1')
        self.assertEqual(response.data['address'], '123 Test St')
        self.assertFalse(response.data['is_shopowner'])

    def test_update_userprofile(self):
        """Test updating a user profile"""
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Old bio',
            address='Old address'
        )
        
        update_data = {
            'bio': 'Updated bio',
            'address': 'Updated address'
        }
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.patch(f'/api/userprofiles/{profile.id}/', update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        profile.refresh_from_db()
        self.assertEqual(profile.bio, 'Updated bio')
        self.assertEqual(profile.address, 'Updated address')

    def test_delete_userprofile(self):
        """Test deleting a user profile"""
        profile = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio',
            address='Test address'
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        response = self.client.delete(f'/api/userprofiles/{profile.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserProfile.objects.count(), 0)


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

# Add UserProfile tests at the end of the file
class UserProfileAPITests(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
        )
        
        # Create user profiles
        self.profile1 = UserProfile.objects.create(
            user=self.user1,
            bio='Test bio for user 1',
            address='Test address 1'
        )
        
        self.profile2 = UserProfile.objects.create(
            user=self.user2,
            bio='Test bio for user 2',
            address='Test address 2'
        )

    def test_get_own_profile(self):
        """Test getting own profile"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/userprofiles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testuser1')

    def test_get_me_endpoint(self):
        """Test getting own profile via /me endpoint"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/userprofiles/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser1')

    def test_create_profile(self):
        """Test creating a new profile"""
        new_user = User.objects.create_user(
            username='newuser',
            email='new@example.com',
            password='newpass123'
        )
        self.client.force_authenticate(user=new_user)
        
        data = {
            'bio': 'New user bio',
            'address': 'New user address'
        }
        response = self.client.post('/api/userprofiles/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['bio'], 'New user bio')

    def test_create_duplicate_profile(self):
        """Test creating duplicate profile should fail"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'bio': 'Another bio',
            'address': 'Another address'
        }
        response = self.client.post('/api/userprofiles/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_bio(self):
        """Test updating bio field"""
        self.client.force_authenticate(user=self.user1)
        data = {'bio': 'Updated bio'}
        response = self.client.patch('/api/userprofiles/update_bio/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Updated bio')

    def test_update_address(self):
        """Test updating address field"""
        self.client.force_authenticate(user=self.user1)
        data = {'address': 'Updated address'}
        response = self.client.patch('/api/userprofiles/update_address/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['address'], 'Updated address')

    def test_upload_avatar(self):
        """Test uploading avatar"""
        self.client.force_authenticate(user=self.user1)
        
        # Create a test image file
        image_content = b'fake-image-content'
        image_file = SimpleUploadedFile(
            'test_image.jpg',
            image_content,
            content_type='image/jpeg'
        )
        
        data = {'avatar': image_file}
        response = self.client.post('/api/userprofiles/upload_avatar/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['avatar'])

    def test_remove_avatar(self):
        """Test removing avatar"""
        self.client.force_authenticate(user=self.user1)
        
        # First upload an avatar
        image_content = b'fake-image-content'
        image_file = SimpleUploadedFile(
            'test_image.jpg',
            image_content,
            content_type='image/jpeg'
        )
        self.client.post('/api/userprofiles/upload_avatar/', {'avatar': image_file}, format='multipart')
        
        # Then remove it
        response = self.client.delete('/api/userprofiles/remove_avatar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['avatar'])

    def test_completion_status(self):
        """Test profile completion status"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/userprofiles/completion_status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('completion_percentage', response.data)
        self.assertIn('completed_fields', response.data)
        self.assertIn('total_fields', response.data)

    def test_toggle_shopowner_status_admin(self):
        """Test admin can toggle shopowner status"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch('/api/userprofiles/toggle_shopowner_status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_toggle_shopowner_status_non_admin(self):
        """Test non-admin cannot toggle shopowner status"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch('/api/userprofiles/toggle_shopowner_status/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_search_users_admin(self):
        """Test admin can search users"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/userprofiles/search/?username=test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_search_users_non_admin(self):
        """Test non-admin cannot search users"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/userprofiles/search/?username=test')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_stats(self):
        """Test getting user statistics"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/userprofiles/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('order_count', response.data)
        self.assertIn('review_count', response.data)
        self.assertIn('wishlist_count', response.data)
        self.assertIn('shop_count', response.data)

    def test_public_profile(self):
        """Test getting public profile information"""
        response = self.client.get(f'/api/userprofiles/{self.profile1.id}/public/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser1')
        # Should not include private fields
        self.assertNotIn('email', response.data)
        self.assertNotIn('address', response.data)

    def test_cannot_access_other_user_profile(self):
        """Test user cannot access another user's profile"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/userprofiles/{self.profile2.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_validation_bio_too_long(self):
        """Test bio validation"""
        self.client.force_authenticate(user=self.user1)
        data = {'bio': 'a' * 1001}  # Too long
        response = self.client.patch('/api/userprofiles/update_bio/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validation_address_too_long(self):
        """Test address validation"""
        self.client.force_authenticate(user=self.user1)
        data = {'address': 'a' * 256}  # Too long
        response = self.client.patch('/api/userprofiles/update_address/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access(self):
        """Test unauthorized access to profile endpoints"""
        response = self.client.get('/api/userprofiles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def tearDown(self):
        """Clean up test files"""
        # Clean up any uploaded files
        for profile in UserProfile.objects.all():
            if profile.avatar:
                if os.path.exists(profile.avatar.path):
                    os.remove(profile.avatar.path)
