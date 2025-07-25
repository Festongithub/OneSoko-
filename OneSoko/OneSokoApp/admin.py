from django.contrib import admin
from .models import (
    Product, Shop, ShopOwner, Category, Tag, Review, ProductVariant, UserProfile, Order, OrderItem, Payment, AuditLog, Wishlist, Message, Notification
)

# Register models for admin management
admin.site.register(Product)
admin.site.register(Shop)
admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(Review)
admin.site.register(ProductVariant)
admin.site.register(UserProfile)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(AuditLog)
admin.site.register(Wishlist)
admin.site.register(Message)
admin.site.register(Notification)
