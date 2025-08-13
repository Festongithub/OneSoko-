from django.core.management.base import BaseCommand
from OneSokoApp.models import BusinessCategory


class Command(BaseCommand):
    help = 'Create initial business categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Electronics', 'description': 'Electronic devices, gadgets, and accessories', 'icon': 'fa-microchip'},
            {'name': 'Fashion & Clothing', 'description': 'Clothing, shoes, and fashion accessories', 'icon': 'fa-tshirt'},
            {'name': 'Food & Beverages', 'description': 'Restaurants, cafes, and food delivery', 'icon': 'fa-utensils'},
            {'name': 'Health & Beauty', 'description': 'Health products, cosmetics, and wellness services', 'icon': 'fa-heart'},
            {'name': 'Home & Garden', 'description': 'Home improvement, furniture, and gardening', 'icon': 'fa-home'},
            {'name': 'Sports & Fitness', 'description': 'Sports equipment, fitness gear, and outdoor activities', 'icon': 'fa-dumbbell'},
            {'name': 'Automotive', 'description': 'Car parts, accessories, and automotive services', 'icon': 'fa-car'},
            {'name': 'Books & Education', 'description': 'Books, stationery, and educational materials', 'icon': 'fa-book'},
            {'name': 'Jewelry & Accessories', 'description': 'Jewelry, watches, and fashion accessories', 'icon': 'fa-gem'},
            {'name': 'Services', 'description': 'Professional and personal services', 'icon': 'fa-handshake'},
        ]

        created_count = 0
        existing_count = 0

        for cat_data in categories:
            category, created = BusinessCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary: {created_count} categories created, {existing_count} already existed'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total categories in database: {BusinessCategory.objects.count()}')
        )
