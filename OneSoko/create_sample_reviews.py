#!/usr/bin/env python
"""
Test script to create sample review data for testing the review system.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append('/home/flamers/OneSoko-/OneSoko')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyOneSoko.settings')
django.setup()

from django.contrib.auth.models import User
from OneSokoApp.models import Shop, ShopReview, ShopRatingSummary
import random

def create_sample_reviews():
    """Create sample reviews for testing."""
    
    # Get or create a test user
    test_customer, created = User.objects.get_or_create(
        username='test_customer',
        defaults={
            'email': 'customer@test.com',
            'first_name': 'Test',
            'last_name': 'Customer'
        }
    )
    
    # Get the first shop for testing
    try:
        shop = Shop.objects.first()
        if not shop:
            print("No shops found. Please create a shop first.")
            return
        
        print(f"Creating sample reviews for shop: {shop.name}")
        
        # Sample review data
        sample_reviews = [
            {
                'rating': 5,
                'title': 'Excellent service!',
                'review_text': 'Really happy with my purchase. Fast delivery and great quality products.',
            },
            {
                'rating': 4,
                'title': 'Good quality',
                'review_text': 'Products were as described. Shipping could be faster but overall satisfied.',
            },
            {
                'rating': 5,
                'title': 'Highly recommend',
                'review_text': 'Amazing shop with great customer service. Will definitely buy again!',
            },
            {
                'rating': 3,
                'title': 'Average experience',
                'review_text': 'Products are okay, nothing special. Room for improvement in packaging.',
            },
            {
                'rating': 4,
                'title': 'Good value for money',
                'review_text': 'Fair prices and decent quality. Had one small issue but was resolved quickly.',
            }
        ]
        
        # Create additional test customers
        for i in range(len(sample_reviews)):
            customer, created = User.objects.get_or_create(
                username=f'customer_{i+1}',
                defaults={
                    'email': f'customer{i+1}@test.com',
                    'first_name': f'Customer',
                    'last_name': f'{i+1}'
                }
            )
            
            # Check if review already exists
            existing_review = ShopReview.objects.filter(customer=customer, shop=shop).first()
            if not existing_review:
                review_data = sample_reviews[i]
                review = ShopReview.objects.create(
                    customer=customer,
                    shop=shop,
                    rating=review_data['rating'],
                    title=review_data['title'],
                    review_text=review_data['review_text'],
                    status='approved'
                )
                print(f"Created review: {review.title} - {review.rating} stars")
            else:
                print(f"Review already exists for customer {customer.username}")
        
        # Update rating summary
        summary, created = ShopRatingSummary.objects.get_or_create(shop=shop)
        summary.update_rating_summary()
        
        print(f"\nShop Rating Summary:")
        print(f"Total Reviews: {summary.total_reviews}")
        print(f"Average Rating: {summary.average_rating}")
        print(f"Rating Distribution:")
        print(f"  5 stars: {summary.rating_5_count} ({summary.rating_percentages[5]}%)")
        print(f"  4 stars: {summary.rating_4_count} ({summary.rating_percentages[4]}%)")
        print(f"  3 stars: {summary.rating_3_count} ({summary.rating_percentages[3]}%)")
        print(f"  2 stars: {summary.rating_2_count} ({summary.rating_percentages[2]}%)")
        print(f"  1 star: {summary.rating_1_count} ({summary.rating_percentages[1]}%)")
        
    except Exception as e:
        print(f"Error creating sample reviews: {e}")

if __name__ == '__main__':
    create_sample_reviews()
