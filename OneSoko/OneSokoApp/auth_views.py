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
import requests
import json
from .models import UserProfile, Shop
from .serializers import UserProfileSerializer, ShopSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that includes user profile and shop information in the response.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the user from the validated data
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = authenticate(
                    request=request,
                    username=request.data.get('email'),
                    password=request.data.get('password')
                )
                
                if user:
                    # Get user profile
                    try:
                        profile = UserProfile.objects.get(user=user)
                        profile_data = UserProfileSerializer(profile).data
                    except UserProfile.DoesNotExist:
                        profile_data = None
                    
                    # Get shop if user is a shop owner
                    shop_data = None
                    if profile_data and profile_data.get('is_shopowner'):
                        try:
                            shop = Shop.objects.get(owner=user)
                            shop_data = ShopSerializer(shop).data
                        except Shop.DoesNotExist:
                            shop_data = None
                    
                    # Add profile and shop data to response
                    response.data['user'] = {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    }
                    response.data['profile'] = profile_data
                    response.data['shop'] = shop_data
        
        return response

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new customer user.
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']
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
                {'error': list(e.messages)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user and profile in transaction
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
                phone_number=data['phone_number'],
                address=data.get('address', ''),
                date_of_birth=data.get('date_of_birth'),
                gender=data.get('gender', 'other'),
                profile_picture=data.get('profile_picture'),
                is_shopowner=False
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': UserProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_shop_owner(request):
    """
    Register a new shop owner user with shop details.
    """
    try:
        data = request.data
        
        # Validate required fields for user
        required_user_fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']
        for field in required_user_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate required fields for shop
        required_shop_fields = ['shop_name', 'shop_description', 'shop_address']
        for field in required_shop_fields:
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
        
        # Check if shop name already exists
        if Shop.objects.filter(name=data['shop_name']).exists():
            return Response(
                {'error': 'Shop with this name already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        try:
            validate_password(data['password'])
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user, profile, and shop in transaction
        with transaction.atomic():
            user = User.objects.create_user(
                username=data['email'],  # Use email as username
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            
            # Create user profile as shop owner
            profile = UserProfile.objects.create(
                user=user,
                phone_number=data['phone_number'],
                address=data.get('address', ''),
                date_of_birth=data.get('date_of_birth'),
                gender=data.get('gender', 'other'),
                profile_picture=data.get('profile_picture'),
                is_shopowner=True
            )
            
            # Create shop with comprehensive owner information
            shop = Shop.objects.create(
                shopowner=user,
                name=data['shop_name'],
                description=data['shop_description'],
                location=data['shop_address'],
                phone=data.get('shop_phone', data['phone_number']),
                email=data.get('shop_email', data['email']),
                status='active',  # Set as active since owner just registered
                is_active=True,
                # Initialize analytics
                views=0,
                total_sales=0,
                total_orders=0
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Shop owner registered successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}",
            },
            'profile': UserProfileSerializer(profile).data,
            'shop': {
                **ShopSerializer(shop).data,
                'owner_info': {
                    'owner_id': user.id,
                    'owner_name': f"{user.first_name} {user.last_name}",
                    'owner_email': user.email,
                    'registration_date': shop.created_at.isoformat(),
                }
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Shop owner registration failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the current user's profile information.
    """
    try:
        user = request.user
        
        # Get user profile
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            profile_data = None
        
        # Get shop if user is a shop owner
        shop_data = None
        if profile_data and profile_data.get('is_shopowner'):
            try:
                shop = Shop.objects.get(owner=user)
                shop_data = ShopSerializer(shop).data
            except Shop.DoesNotExist:
                shop_data = None
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': profile_data,
            'shop': shop_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get user profile: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_login(request):
    """
    Handle OAuth login for Google, Facebook, and GitHub.
    This is a simplified version for demonstration.
    """
    try:
        data = request.data
        provider = data.get('provider')  # 'google', 'facebook', 'github'
        access_token = data.get('access_token')
        user_type = data.get('user_type', 'customer')  # 'customer' or 'shop_owner'
        
        if not provider or not access_token:
            return Response(
                {'error': 'Provider and access_token are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user info from OAuth provider
        user_info = None
        if provider == 'google':
            user_info = get_google_user_info(access_token)
        elif provider == 'facebook':
            user_info = get_facebook_user_info(access_token)
        elif provider == 'github':
            user_info = get_github_user_info(access_token)
        else:
            return Response(
                {'error': 'Unsupported OAuth provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user_info:
            return Response(
                {'error': 'Failed to get user information from OAuth provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists
        email = user_info.get('email')
        if not email:
            return Response(
                {'error': 'Email not provided by OAuth provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = None
        is_new_user = False
        needs_shop_setup = False
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user
            is_new_user = True
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    first_name=user_info.get('given_name', ''),
                    last_name=user_info.get('family_name', ''),
                )
                
                # Create user profile
                profile = UserProfile.objects.create(
                    user=user,
                    phone_number='',  # Will need to be filled later
                    is_shopowner=(user_type == 'shop_owner')
                )
                
                # If registering as shop owner, they'll need to set up shop details
                if user_type == 'shop_owner':
                    needs_shop_setup = True
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Get profile and shop data
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            profile_data = None
        
        shop_data = None
        if profile_data and profile_data.get('is_shopowner'):
            try:
                shop = Shop.objects.get(owner=user)
                shop_data = ShopSerializer(shop).data
            except Shop.DoesNotExist:
                if not is_new_user:
                    needs_shop_setup = True
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': profile_data,
            'shop': shop_data,
            'is_new_user': is_new_user,
            'needs_shop_setup': needs_shop_setup
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'OAuth login failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_google_user_info(access_token):
    """Get user info from Google OAuth API."""
    try:
        response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error getting Google user info: {e}")
    return None

def get_facebook_user_info(access_token):
    """Get user info from Facebook Graph API."""
    try:
        response = requests.get(
            f'https://graph.facebook.com/me?fields=id,name,email,first_name,last_name&access_token={access_token}'
        )
        if response.status_code == 200:
            data = response.json()
            # Normalize the response to match Google's format
            return {
                'email': data.get('email'),
                'given_name': data.get('first_name', ''),
                'family_name': data.get('last_name', ''),
                'name': data.get('name', ''),
                'id': data.get('id')
            }
    except Exception as e:
        print(f"Error getting Facebook user info: {e}")
    return None

def get_github_user_info(access_token):
    """Get user info from GitHub API."""
    try:
        # Get user info
        user_response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {access_token}'}
        )
        
        if user_response.status_code == 200:
            user_data = user_response.json()
            
            # Get user emails (GitHub might not provide email in user endpoint)
            email_response = requests.get(
                'https://api.github.com/user/emails',
                headers={'Authorization': f'token {access_token}'}
            )
            
            email = user_data.get('email')
            if not email and email_response.status_code == 200:
                emails = email_response.json()
                # Find primary email
                for email_data in emails:
                    if email_data.get('primary'):
                        email = email_data.get('email')
                        break
                # If no primary email, use the first one
                if not email and emails:
                    email = emails[0].get('email')
            
            # Parse name
            name = user_data.get('name', '')
            name_parts = name.split(' ', 1) if name else ['', '']
            given_name = name_parts[0] if len(name_parts) > 0 else ''
            family_name = name_parts[1] if len(name_parts) > 1 else ''
            
            return {
                'email': email,
                'given_name': given_name,
                'family_name': family_name,
                'name': name,
                'id': user_data.get('id')
            }
    except Exception as e:
        print(f"Error getting GitHub user info: {e}")
    return None
