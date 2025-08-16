from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.oauth2.client import OAuth2Token
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.helpers import complete_social_login
from allauth.socialaccount import app_settings
from allauth.utils import get_user_model
import requests
import json

from .models import UserProfile, Shop
from .serializers import UserProfileSerializer, ShopSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that includes user profile information
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user from the validated data
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = authenticate(
                    request=request,
                    username=request.data.get('username') or request.data.get('email'),
                    password=request.data.get('password')
                )
                
                if user:
                    try:
                        profile = UserProfile.objects.get(user=user)
                        profile_data = UserProfileSerializer(profile).data
                        
                        response.data.update({
                            'user': {
                                'id': user.id,
                                'username': user.username,
                                'email': user.email,
                                'first_name': user.first_name,
                                'last_name': user.last_name,
                                'is_shopowner': profile.is_shopowner,
                            },
                            'profile': profile_data
                        })
                        
                        # If user is a shop owner, include shop information
                        if profile.is_shopowner:
                            try:
                                shop = Shop.objects.get(shopowner=user)
                                shop_data = ShopSerializer(shop).data
                                response.data['shop'] = shop_data
                            except Shop.DoesNotExist:
                                pass
                    except UserProfile.DoesNotExist:
                        pass
        
        return response

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new regular user
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'User with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        try:
            validate_password(data['password'])
        except ValidationError as e:
            return Response(
                {'error': e.messages}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user and profile in a transaction
        with transaction.atomic():
            user = User.objects.create_user(
                username=data['email'],  # Use email as username
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            
            # Create user profile
            profile = UserProfile.objects.create(
                user=user,
                phone_number=data.get('phone_number', ''),
                address=data.get('address', ''),
                date_of_birth=data.get('date_of_birth'),
                is_shopowner=False
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'message': 'User registered successfully',
            'access': str(access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_shopowner': False,
            },
            'profile': UserProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_shop_owner(request):
    """
    Register a new shop owner with shop details
    """
    try:
        data = request.data
        
        # Validate required fields for user
        user_required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in user_required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate required fields for shop
        shop_required_fields = ['shop_name', 'shop_description', 'shop_location', 'shop_phone']
        for field in shop_required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'User with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        try:
            validate_password(data['password'])
        except ValidationError as e:
            return Response(
                {'error': e.messages}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user, profile, and shop in a transaction
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                username=data['email'],  # Use email as username
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            
            # Create user profile
            profile = UserProfile.objects.create(
                user=user,
                phone_number=data.get('phone_number', ''),
                address=data.get('address', ''),
                date_of_birth=data.get('date_of_birth'),
                is_shopowner=True
            )
            
            # Create shop
            shop = Shop.objects.create(
                name=data['shop_name'],
                description=data['shop_description'],
                location=data['shop_location'],
                phone=data['shop_phone'],
                email=data.get('shop_email', data['email']),
                social_link=data.get('shop_social_link', ''),
                street=data.get('shop_street', ''),
                city=data.get('shop_city', ''),
                country=data.get('shop_country', ''),
                shopowner=user,
                status='pending',  # Shops start as pending approval
                is_active=True
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'message': 'Shop owner registered successfully',
            'access': str(access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_shopowner': True,
            },
            'profile': UserProfileSerializer(profile).data,
            'shop': ShopSerializer(shop).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_login(request):
    """
    Handle OAuth login from social providers
    """
    try:
        provider = request.data.get('provider')
        access_token = request.data.get('access_token')
        user_type = request.data.get('user_type', 'customer')  # 'customer' or 'shop_owner'
        
        if not provider or not access_token:
            return Response(
                {'error': 'Provider and access_token are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user info from social provider
        user_info = None
        
        if provider == 'google':
            user_info = get_google_user_info(access_token)
        elif provider == 'facebook':
            user_info = get_facebook_user_info(access_token)
        elif provider == 'github':
            user_info = get_github_user_info(access_token)
        else:
            return Response(
                {'error': 'Unsupported provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user_info:
            return Response(
                {'error': 'Failed to get user info from provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        email = user_info.get('email')
        if not email:
            return Response(
                {'error': 'Email not provided by social provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': user_info.get('first_name', ''),
                'last_name': user_info.get('last_name', ''),
            }
        )
        
        # Get or create user profile
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'is_shopowner': user_type == 'shop_owner'
            }
        )
        
        # If new shop owner, they need to complete shop setup
        shop = None
        if profile.is_shopowner:
            try:
                shop = Shop.objects.get(shopowner=user)
            except Shop.DoesNotExist:
                pass
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token_jwt = refresh.access_token
        
        response_data = {
            'access': str(access_token_jwt),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_shopowner': profile.is_shopowner,
            },
            'profile': UserProfileSerializer(profile).data,
            'is_new_user': created
        }
        
        if shop:
            response_data['shop'] = ShopSerializer(shop).data
        elif profile.is_shopowner:
            response_data['needs_shop_setup'] = True
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user's profile information
    """
    try:
        user = request.user
        profile = UserProfile.objects.get(user=user)
        
        response_data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_shopowner': profile.is_shopowner,
            },
            'profile': UserProfileSerializer(profile).data
        }
        
        # If user is a shop owner, include shop information
        if profile.is_shopowner:
            try:
                shop = Shop.objects.get(shopowner=user)
                response_data['shop'] = ShopSerializer(shop).data
            except Shop.DoesNotExist:
                response_data['needs_shop_setup'] = True
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Helper functions for OAuth providers
def get_google_user_info(access_token):
    """Get user info from Google OAuth"""
    try:
        response = requests.get(
            f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'email': data.get('email'),
                'first_name': data.get('given_name', ''),
                'last_name': data.get('family_name', ''),
                'picture': data.get('picture', ''),
            }
    except:
        pass
    return None

def get_facebook_user_info(access_token):
    """Get user info from Facebook OAuth"""
    try:
        response = requests.get(
            f'https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token={access_token}'
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'email': data.get('email'),
                'first_name': data.get('first_name', ''),
                'last_name': data.get('last_name', ''),
                'picture': data.get('picture', {}).get('data', {}).get('url', ''),
            }
    except:
        pass
    return None

def get_github_user_info(access_token):
    """Get user info from GitHub OAuth"""
    try:
        # Get user basic info
        headers = {'Authorization': f'token {access_token}'}
        response = requests.get('https://api.github.com/user', headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            
            # Get user email (GitHub emails are separate)
            email_response = requests.get('https://api.github.com/user/emails', headers=headers)
            email = None
            if email_response.status_code == 200:
                emails = email_response.json()
                for email_obj in emails:
                    if email_obj.get('primary'):
                        email = email_obj.get('email')
                        break
            
            name_parts = user_data.get('name', '').split(' ', 1)
            first_name = name_parts[0] if name_parts else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            return {
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'picture': user_data.get('avatar_url', ''),
            }
    except:
        pass
    return None
