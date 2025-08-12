from django.contrib import admin
from .models import (
    Product, Shop, ShopOwner, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, AuditLog, Wishlist, Message, Notification
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
    list_display = ('name', 'shopowner', 'status', 'views', 'total_sales', 'is_active')
    search_fields = ('name', 'shopowner__username', 'location', 'city', 'country')
    list_filter = ('status', 'is_active', 'city', 'country')
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
