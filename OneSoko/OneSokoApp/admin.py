from django.contrib import admin
from .models import (
    Product, Shop, ShopOwner, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, AuditLog, Wishlist, Message, Notification,
    ShopReview, ShopReviewResponse, ShopRatingSummary, ReviewHelpfulVote,
    OrderTracking, OrderAnalytics, ShippingAddress, EmailSubscription,
    UserFollow, UserPost, PostLike, PostReply
)

# Inline for ProductVariant in Product admin
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

# Inline for Review in Product admin
class ReviewInline(admin.TabularInline):
    model = Review
    extra = 1

# Product admin customization
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discount', 'promotional_price', 'is_active')
    search_fields = ('name', 'description')
    list_filter = ('category', 'is_active')
    ordering = ('name',)
    inlines = [ProductVariantInline, ReviewInline]

# Shop admin customization
@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_owner_name', 'shopowner_email', 'status', 'location', 'views', 'total_sales', 'is_active', 'created_at')
    search_fields = ('name', 'shopowner__username', 'shopowner__first_name', 'shopowner__last_name', 'shopowner__email', 'location', 'city', 'country')
    list_filter = ('status', 'is_active', 'city', 'country', 'created_at')
    readonly_fields = ('shopId', 'created_at', 'slug', 'owner_full_name')
    
    def get_owner_name(self, obj):
        """Display the full name of the shop owner."""
        return obj.owner_full_name
    get_owner_name.short_description = 'Owner Name'
    
    def shopowner_email(self, obj):
        """Display the email of the shop owner."""
        return obj.shopowner.email
    shopowner_email.short_description = 'Owner Email'
    
    def owner_full_name(self, obj):
        """Display full owner contact information in admin detail view."""
        info = obj.owner_contact_info
        return f"{info['name']} ({info['username']}) - {info['email']}"
    owner_full_name.short_description = 'Owner Details'
    ordering = ('-created_at',)
    prepopulated_fields = {"slug": ("name",)}

# OrderItem inline for Order admin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

# Enhanced Order Management Inlines
class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 1
    readonly_fields = ('timestamp',)

class OrderAnalyticsInline(admin.StackedInline):
    model = OrderAnalytics
    max_num = 1
    readonly_fields = ('created_at', 'updated_at')

class ShippingAddressInline(admin.StackedInline):
    model = ShippingAddress
    max_num = 1
    readonly_fields = ('created_at', 'updated_at')
    extra = 1

# Order admin customization with enhanced features
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'shop', 'status', 'total', 'created_at', 'has_tracking', 'has_analytics')
    list_filter = ('status', 'created_at', 'shop')
    search_fields = ('id', 'user__username', 'user__email', 'shop__name')
    readonly_fields = ('created_at',)
    inlines = [OrderItemInline, OrderTrackingInline, OrderAnalyticsInline, ShippingAddressInline]
    
    def has_tracking(self, obj):
        return obj.tracking_entries.exists()
    has_tracking.boolean = True
    has_tracking.short_description = 'Has Tracking'
    
    def has_analytics(self, obj):
        return hasattr(obj, 'analytics')
    has_analytics.boolean = True
    has_analytics.short_description = 'Has Analytics'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'shop').prefetch_related('tracking_entries')

# UserProfile admin customization
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'is_shopowner', 'is_verified', 'location', 'followers_count', 'following_count')
    list_filter = ('is_shopowner', 'is_verified', 'verification_type', 'is_public', 'is_email_verified')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'bio', 'location')
    readonly_fields = ('followers_count', 'following_count', 'profile_completion_percentage')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'bio', 'avatar', 'cover_photo')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'address', 'location', 'website')
        }),
        ('Personal Information', {
            'fields': ('date_of_birth',)
        }),
        ('Social Media Links', {
            'fields': ('twitter_url', 'facebook_url', 'instagram_url', 'linkedin_url'),
            'classes': ('collapse',)
        }),
        ('Account Settings', {
            'fields': ('is_shopowner', 'is_public', 'is_email_verified')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_type')
        }),
        ('Statistics', {
            'fields': ('followers_count', 'following_count', 'profile_completion_percentage'),
            'classes': ('collapse',)
        }),
    )

# User Follow admin
@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at', 'notifications_enabled')
    list_filter = ('notifications_enabled', 'created_at')
    search_fields = ('follower__username', 'following__username')
    raw_id_fields = ('follower', 'following')

# User Post admin
@admin.register(UserPost)
class UserPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_preview', 'post_type', 'likes_count', 'replies_count', 'created_at', 'is_deleted')
    list_filter = ('post_type', 'is_deleted', 'created_at')
    search_fields = ('user__username', 'content')
    raw_id_fields = ('user', 'related_product', 'related_shop')
    readonly_fields = ('likes_count', 'reposts_count', 'replies_count')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'

# Post Like admin
@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    raw_id_fields = ('user', 'post')

# Post Reply admin
@admin.register(PostReply)
class PostReplyAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'content_preview', 'created_at', 'is_deleted')
    list_filter = ('is_deleted', 'created_at')
    search_fields = ('user__username', 'content', 'post__content')
    raw_id_fields = ('user', 'post')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'

# Register other models with default admin
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(Review)
admin.site.register(ProductVariant)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(AuditLog)
admin.site.register(Wishlist)
admin.site.register(Message)
admin.site.register(Notification)

# Shop Review System Admin
@admin.register(ShopReview)
class ShopReviewAdmin(admin.ModelAdmin):
    list_display = ('shop', 'customer', 'rating', 'title', 'status', 'is_verified_purchase', 'created_at')
    list_filter = ('rating', 'status', 'is_verified_purchase', 'created_at')
    search_fields = ('shop__name', 'customer__username', 'title', 'review_text')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(ShopReviewResponse)
class ShopReviewResponseAdmin(admin.ModelAdmin):
    list_display = ('review', 'shop_owner', 'get_shop_name', 'created_at')
    search_fields = ('review__shop__name', 'shop_owner__username', 'response_text')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    def get_shop_name(self, obj):
        return obj.review.shop.name
    get_shop_name.short_description = 'Shop Name'

@admin.register(ShopRatingSummary)
class ShopRatingSummaryAdmin(admin.ModelAdmin):
    list_display = ('shop', 'total_reviews', 'average_rating', 'last_updated')
    search_fields = ('shop__name',)
    readonly_fields = ('last_updated',)
    ordering = ('-average_rating',)

@admin.register(ReviewHelpfulVote)
class ReviewHelpfulVoteAdmin(admin.ModelAdmin):
    list_display = ('review', 'customer', 'is_helpful', 'created_at')
    list_filter = ('is_helpful', 'created_at')
    search_fields = ('review__shop__name', 'customer__username')
    readonly_fields = ('created_at',)


# Enhanced Order Management Admin

@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'location', 'tracking_number', 'carrier', 'timestamp')
    list_filter = ('status', 'carrier', 'timestamp')
    search_fields = ('order__id', 'tracking_number', 'location', 'description')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order', 'order__user', 'order__shop')

@admin.register(OrderAnalytics)
class OrderAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('order', 'customer_type', 'order_source', 'rating', 'discount_amount', 'created_at')
    list_filter = ('customer_type', 'order_source', 'rating', 'created_at')
    search_fields = ('order__id', 'utm_source', 'utm_campaign')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'customer_type', 'order_source')
        }),
        ('Marketing Attribution', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign')
        }),
        ('Financial Metrics', {
            'fields': ('discount_amount', 'tax_amount', 'shipping_cost', 'refund_amount')
        }),
        ('Fulfillment Metrics', {
            'fields': ('processing_time', 'shipping_time', 'delivery_time')
        }),
        ('Customer Feedback', {
            'fields': ('rating', 'feedback', 'return_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ('order', 'recipient_name', 'city', 'state_province', 'country', 'created_at')
    list_filter = ('country', 'state_province', 'city', 'created_at')
    search_fields = ('recipient_name', 'recipient_email', 'address_line_1', 'city')
    readonly_fields = ('created_at', 'updated_at', 'full_address')
    
    fieldsets = (
        ('Recipient Information', {
            'fields': ('order', 'recipient_name', 'recipient_phone', 'recipient_email')
        }),
        ('Address Details', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country')
        }),
        ('Delivery Information', {
            'fields': ('delivery_instructions', 'latitude', 'longitude')
        }),
        ('Computed Fields', {
            'fields': ('full_address',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


# Email Subscription admin customization
@admin.register(EmailSubscription)
class EmailSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'is_confirmed', 'get_subscription_types', 'created_at', 'confirmed_at')
    search_fields = ('email', 'user__username', 'user__first_name', 'user__last_name')
    list_filter = ('is_active', 'subscription_types', 'created_at', 'confirmed_at')
    readonly_fields = ('subscriptionId', 'created_at', 'updated_at', 'confirmation_token')
    date_hierarchy = 'created_at'
    
    def get_subscription_types(self, obj):
        """Display subscription types as a comma-separated string"""
        return ', '.join(obj.subscription_types) if obj.subscription_types else 'None'
    get_subscription_types.short_description = 'Subscription Types'
    
    def is_confirmed(self, obj):
        """Display confirmation status"""
        return obj.is_confirmed()
    is_confirmed.boolean = True
    is_confirmed.short_description = 'Confirmed'
    
    actions = ['mark_as_unsubscribed', 'mark_as_active', 'confirm_subscriptions']
    
    def mark_as_unsubscribed(self, request, queryset):
        """Mark selected subscriptions as unsubscribed"""
        updated = 0
        for subscription in queryset:
            subscription.unsubscribe()
            updated += 1
        self.message_user(request, f'{updated} subscription(s) marked as unsubscribed.')
    mark_as_unsubscribed.short_description = 'Mark as unsubscribed'
    
    def mark_as_active(self, request, queryset):
        """Mark selected subscriptions as active"""
        updated = queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f'{updated} subscription(s) marked as active.')
    mark_as_active.short_description = 'Mark as active'
    
    def confirm_subscriptions(self, request, queryset):
        """Confirm selected subscriptions"""
        updated = 0
        for subscription in queryset.filter(confirmed_at__isnull=True):
            subscription.confirm_subscription()
            updated += 1
        self.message_user(request, f'{updated} subscription(s) confirmed.')
    confirm_subscriptions.short_description = 'Confirm subscriptions'
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('subscriptionId', 'email', 'subscription_types', 'is_active')
        }),
        ('User Information', {
            'fields': ('user',)
        }),
        ('Confirmation Details', {
            'fields': ('confirmation_token', 'confirmed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'unsubscribed_at', 'last_email_sent'),
            'classes': ('collapse',)
        })
    )
