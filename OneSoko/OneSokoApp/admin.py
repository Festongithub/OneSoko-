from django.contrib import admin
from .models import (
    Product, Shop, ShopOwner, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, AuditLog, Wishlist, Message, Notification,
    ShopReview, ShopReviewResponse, ShopRatingSummary, ReviewHelpfulVote
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

# Order admin customization
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'shop', 'status', 'total', 'created_at')
    search_fields = ('user__username', 'shop__name')
    list_filter = ('status', 'shop')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]

# UserProfile admin customization
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'address')
    search_fields = ('user__username', 'bio', 'address')

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
