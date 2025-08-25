from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, generics
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.db import transaction
from .models import UserProfile, UserFollow, UserPost, PostLike, PostReply, Shop
from .serializers import (
    UserProfileSerializer, UserDetailSerializer, UserFollowSerializer,
    UserPostSerializer, PostLikeSerializer, PostReplySerializer
)
from .permissions import IsShopOwner

# Profile Management Views

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile_detail(request):
    """
    Get or update the current user's profile
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        profile = UserProfile.objects.create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = UserProfileSerializer(
            profile, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_profile_detail(request, username):
    """
    Get public profile by username
    """
    try:
        user = User.objects.get(username=username)
        profile = UserProfile.objects.get(user=user)
        
        # Check if profile is public or if user is viewing their own profile
        if not profile.is_public and request.user != user:
            return Response(
                {'error': 'This profile is private'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Include additional context for profile viewing
        profile_data = UserProfileSerializer(profile, context={'request': request}).data
        
        # Add follow status if user is authenticated
        if request.user.is_authenticated and request.user != user:
            is_following = UserFollow.objects.filter(
                follower=request.user, 
                following=user
            ).exists()
            profile_data['is_following'] = is_following
        else:
            profile_data['is_following'] = False
        
        # Add shop information if user is a shop owner
        if profile.is_shopowner:
            try:
                shop = Shop.objects.get(shopowner=user)
                from .serializers import ShopSerializer
                profile_data['shop'] = ShopSerializer(shop, context={'request': request}).data
            except Shop.DoesNotExist:
                profile_data['shop'] = None
        
        return Response(profile_data)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# Follow/Following System

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    """
    Follow a user
    """
    try:
        user_to_follow = User.objects.get(username=username)
        
        if user_to_follow == request.user:
            return Response(
                {'error': 'You cannot follow yourself'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        follow_relationship, created = UserFollow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )
        
        if created:
            # Update follower counts
            request.user.profile.following_count = UserFollow.objects.filter(
                follower=request.user
            ).count()
            request.user.profile.save()
            
            user_to_follow.profile.followers_count = UserFollow.objects.filter(
                following=user_to_follow
            ).count()
            user_to_follow.profile.save()
            
            return Response({
                'message': f'You are now following {user_to_follow.username}',
                'is_following': True
            })
        else:
            return Response({
                'message': f'You are already following {user_to_follow.username}',
                'is_following': True
            })
            
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, username):
    """
    Unfollow a user
    """
    try:
        user_to_unfollow = User.objects.get(username=username)
        
        follow_relationship = UserFollow.objects.filter(
            follower=request.user,
            following=user_to_unfollow
        )
        
        if follow_relationship.exists():
            follow_relationship.delete()
            
            # Update follower counts
            request.user.profile.following_count = UserFollow.objects.filter(
                follower=request.user
            ).count()
            request.user.profile.save()
            
            user_to_unfollow.profile.followers_count = UserFollow.objects.filter(
                following=user_to_unfollow
            ).count()
            user_to_unfollow.profile.save()
            
            return Response({
                'message': f'You have unfollowed {user_to_unfollow.username}',
                'is_following': False
            })
        else:
            return Response({
                'message': f'You are not following {user_to_unfollow.username}',
                'is_following': False
            })
            
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_followers(request, username):
    """
    Get user's followers list
    """
    try:
        user = User.objects.get(username=username)
        followers = UserFollow.objects.filter(following=user).select_related('follower')
        
        followers_data = []
        for follow in followers:
            follower_data = UserDetailSerializer(
                follow.follower, 
                context={'request': request}
            ).data
            
            # Add follow status for current user
            if request.user != follow.follower:
                is_following = UserFollow.objects.filter(
                    follower=request.user,
                    following=follow.follower
                ).exists()
                follower_data['is_following'] = is_following
            
            followers_data.append(follower_data)
        
        return Response({
            'followers': followers_data,
            'count': len(followers_data)
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following(request, username):
    """
    Get user's following list
    """
    try:
        user = User.objects.get(username=username)
        following = UserFollow.objects.filter(follower=user).select_related('following')
        
        following_data = []
        for follow in following:
            following_user_data = UserDetailSerializer(
                follow.following, 
                context={'request': request}
            ).data
            
            # Add follow status for current user
            if request.user != follow.following:
                is_following = UserFollow.objects.filter(
                    follower=request.user,
                    following=follow.following
                ).exists()
                following_user_data['is_following'] = is_following
            
            following_data.append(following_user_data)
        
        return Response({
            'following': following_data,
            'count': len(following_data)
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# Posts/Feed System

class UserPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user posts (like tweets)
    """
    serializer_class = UserPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserPost.objects.filter(
            is_deleted=False
        ).select_related('user').prefetch_related('likes', 'replies')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Only allow user to edit their own posts
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own posts")
        serializer.save()

    def perform_destroy(self, instance):
        # Soft delete instead of hard delete
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own posts")
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a post"""
        post = self.get_object()
        like, created = PostLike.objects.get_or_create(
            user=request.user, 
            post=post
        )
        
        if created:
            # Update like count
            post.likes_count = post.likes.count()
            post.save()
            return Response({'message': 'Post liked', 'is_liked': True})
        else:
            return Response({'message': 'Post already liked', 'is_liked': True})

    @action(detail=True, methods=['delete'])
    def unlike(self, request, pk=None):
        """Unlike a post"""
        post = self.get_object()
        try:
            like = PostLike.objects.get(user=request.user, post=post)
            like.delete()
            
            # Update like count
            post.likes_count = post.likes.count()
            post.save()
            return Response({'message': 'Post unliked', 'is_liked': False})
        except PostLike.DoesNotExist:
            return Response({'message': 'Post not liked', 'is_liked': False})

    @action(detail=True, methods=['get', 'post'])
    def replies(self, request, pk=None):
        """Get or create replies for a post"""
        post = self.get_object()
        
        if request.method == 'GET':
            replies = PostReply.objects.filter(
                post=post, 
                is_deleted=False
            ).select_related('user')
            serializer = PostReplySerializer(
                replies, 
                many=True, 
                context={'request': request}
            )
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = PostReplySerializer(
                data=request.data, 
                context={'request': request}
            )
            if serializer.is_valid():
                reply = serializer.save(user=request.user, post=post)
                
                # Update reply count
                post.replies_count = post.replies.filter(is_deleted=False).count()
                post.save()
                
                return Response(
                    PostReplySerializer(reply, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_feed(request):
    """
    Get personalized feed for the user (posts from followed users)
    """
    following_users = UserFollow.objects.filter(
        follower=request.user
    ).values_list('following', flat=True)
    
    # Include user's own posts and posts from followed users
    feed_posts = UserPost.objects.filter(
        Q(user=request.user) | Q(user__in=following_users),
        is_deleted=False
    ).select_related('user').prefetch_related('likes', 'replies').order_by('-created_at')
    
    # Pagination
    page_size = int(request.GET.get('page_size', 20))
    page = int(request.GET.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_posts = feed_posts[start:end]
    
    serializer = UserPostSerializer(
        paginated_posts, 
        many=True, 
        context={'request': request}
    )
    
    return Response({
        'posts': serializer.data,
        'page': page,
        'page_size': page_size,
        'has_next': len(feed_posts) > end
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def user_posts(request, username):
    """
    Get posts by a specific user
    """
    try:
        user = User.objects.get(username=username)
        posts = UserPost.objects.filter(
            user=user, 
            is_deleted=False
        ).select_related('user').prefetch_related('likes', 'replies').order_by('-created_at')
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_posts = posts[start:end]
        
        serializer = UserPostSerializer(
            paginated_posts, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'posts': serializer.data,
            'user': UserDetailSerializer(user, context={'request': request}).data,
            'page': page,
            'page_size': page_size,
            'has_next': len(posts) > end
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# Profile Stats and Analytics

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request, username=None):
    """
    Get profile statistics
    """
    user = request.user
    if username:
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    stats = {
        'posts_count': UserPost.objects.filter(user=user, is_deleted=False).count(),
        'followers_count': user.profile.followers_count,
        'following_count': user.profile.following_count,
        'total_likes_received': PostLike.objects.filter(post__user=user).count(),
        'profile_completion': user.profile.profile_completion_percentage,
    }
    
    # Add shop stats if user is a shop owner
    if user.profile.is_shopowner:
        try:
            shop = Shop.objects.get(shopowner=user)
            stats.update({
                'shop_views': shop.views,
                'shop_products': shop.products.count(),
                'shop_orders': shop.total_orders,
                'shop_sales': float(shop.total_sales),
            })
        except Shop.DoesNotExist:
            pass
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_users(request):
    """
    Search for users by name or username
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'users': []})
    
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).select_related('profile').filter(
        profile__is_public=True
    )[:20]  # Limit to 20 results
    
    users_data = []
    for user in users:
        user_data = UserDetailSerializer(user, context={'request': request}).data
        
        # Add follow status if user is authenticated
        if request.user.is_authenticated and request.user != user:
            is_following = UserFollow.objects.filter(
                follower=request.user,
                following=user
            ).exists()
            user_data['is_following'] = is_following
        
        users_data.append(user_data)
    
    return Response({'users': users_data})
