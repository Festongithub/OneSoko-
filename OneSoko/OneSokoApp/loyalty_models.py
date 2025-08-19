from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
import uuid


class LoyaltyProgram(models.Model):
    """Shop-specific loyalty program configuration"""
    shop = models.OneToOneField('Shop', on_delete=models.CASCADE, related_name='loyalty_program')
    name = models.CharField(max_length=100, default="Loyalty Rewards")
    description = models.TextField(blank=True)
    
    # Program Settings
    is_active = models.BooleanField(default=True)
    points_per_dollar = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    minimum_spend_for_points = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    points_expiry_days = models.IntegerField(default=365)  # Points expire after 1 year
    
    # Tier System
    TIER_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'), 
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    # Tier Thresholds (annual spending)
    bronze_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    silver_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    gold_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=1500)
    platinum_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    
    # Tier Multipliers
    bronze_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)
    silver_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.25)
    gold_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.50)
    platinum_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=2.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} - {self.name}"
    
    def get_tier_for_spending(self, annual_spending):
        """Determine customer tier based on annual spending"""
        if annual_spending >= self.platinum_threshold:
            return 'platinum'
        elif annual_spending >= self.gold_threshold:
            return 'gold'
        elif annual_spending >= self.silver_threshold:
            return 'silver'
        else:
            return 'bronze'
    
    def get_tier_multiplier(self, tier):
        """Get points multiplier for a tier"""
        multipliers = {
            'bronze': self.bronze_multiplier,
            'silver': self.silver_multiplier,
            'gold': self.gold_multiplier,
            'platinum': self.platinum_multiplier,
        }
        return multipliers.get(tier, self.bronze_multiplier)


class CustomerLoyalty(models.Model):
    """Customer loyalty account for a specific shop"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loyalty_accounts')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='loyalty_customers')
    
    # Points Balance
    total_points_earned = models.IntegerField(default=0)
    total_points_redeemed = models.IntegerField(default=0)
    current_points_balance = models.IntegerField(default=0)
    
    # Tier Information
    current_tier = models.CharField(max_length=20, choices=LoyaltyProgram.TIER_CHOICES, default='bronze')
    annual_spending = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentage to next tier
    
    # Activity Tracking
    last_activity_date = models.DateTimeField(auto_now=True)
    total_orders = models.IntegerField(default=0)
    first_purchase_date = models.DateTimeField(null=True, blank=True)
    
    # Birthday Rewards
    birthday_date = models.DateField(null=True, blank=True)
    birthday_reward_claimed_year = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['customer', 'shop']
        verbose_name_plural = "Customer Loyalty Accounts"
    
    def __str__(self):
        return f"{self.customer.username} - {self.shop.name} ({self.current_tier.title()})"
    
    def add_points(self, points, transaction_type, reference_id=None, description=""):
        """Add points to customer's account"""
        self.total_points_earned += points
        self.current_points_balance += points
        self.save()
        
        # Create transaction record
        LoyaltyTransaction.objects.create(
            customer_loyalty=self,
            transaction_type=transaction_type,
            points_change=points,
            points_balance_after=self.current_points_balance,
            reference_id=reference_id,
            description=description
        )
    
    def redeem_points(self, points, transaction_type, reference_id=None, description=""):
        """Redeem points from customer's account"""
        if self.current_points_balance >= points:
            self.total_points_redeemed += points
            self.current_points_balance -= points
            self.save()
            
            # Create transaction record
            LoyaltyTransaction.objects.create(
                customer_loyalty=self,
                transaction_type=transaction_type,
                points_change=-points,
                points_balance_after=self.current_points_balance,
                reference_id=reference_id,
                description=description
            )
            return True
        return False
    
    def update_tier(self):
        """Update customer tier based on annual spending"""
        loyalty_program = self.shop.loyalty_program
        new_tier = loyalty_program.get_tier_for_spending(self.annual_spending)
        
        if new_tier != self.current_tier:
            old_tier = self.current_tier
            self.current_tier = new_tier
            self.save()
            
            # Create tier upgrade notification
            from .models import Notification
            Notification.objects.create(
                user=self.customer,
                message=f"Congratulations! You've been upgraded to {new_tier.title()} tier at {self.shop.name}!",
                type='milestone',
                priority='medium',
                shop=self.shop
            )
    
    def calculate_tier_progress(self):
        """Calculate progress to next tier as percentage"""
        loyalty_program = self.shop.loyalty_program
        current_spending = self.annual_spending
        
        if self.current_tier == 'bronze':
            next_threshold = loyalty_program.silver_threshold
            current_threshold = loyalty_program.bronze_threshold
        elif self.current_tier == 'silver':
            next_threshold = loyalty_program.gold_threshold
            current_threshold = loyalty_program.silver_threshold
        elif self.current_tier == 'gold':
            next_threshold = loyalty_program.platinum_threshold
            current_threshold = loyalty_program.gold_threshold
        else:  # platinum
            return 100.0
        
        progress = ((current_spending - current_threshold) / (next_threshold - current_threshold)) * 100
        return min(max(progress, 0), 100)


class LoyaltyTransaction(models.Model):
    """Record of all loyalty points transactions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_loyalty = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE, related_name='transactions')
    
    TRANSACTION_TYPES = [
        ('earned_purchase', 'Points Earned from Purchase'),
        ('earned_signup', 'Welcome Bonus'),
        ('earned_referral', 'Referral Bonus'),
        ('earned_review', 'Review Bonus'),
        ('earned_birthday', 'Birthday Bonus'),
        ('earned_bonus', 'Special Bonus'),
        ('redeemed_discount', 'Redeemed for Discount'),
        ('redeemed_product', 'Redeemed for Product'),
        ('expired', 'Points Expired'),
        ('adjustment', 'Manual Adjustment'),
    ]
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    points_change = models.IntegerField()  # Positive for earning, negative for spending
    points_balance_after = models.IntegerField()
    
    # Optional references
    reference_id = models.CharField(max_length=100, blank=True)  # Order ID, etc.
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        action = "earned" if self.points_change > 0 else "redeemed"
        return f"{self.customer_loyalty.customer.username} {action} {abs(self.points_change)} points"


class LoyaltyReward(models.Model):
    """Available rewards that customers can redeem"""
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='loyalty_rewards')
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    REWARD_TYPES = [
        ('discount_percentage', 'Percentage Discount'),
        ('discount_fixed', 'Fixed Amount Discount'),
        ('free_shipping', 'Free Shipping'),
        ('free_product', 'Free Product'),
        ('bonus_points', 'Bonus Points'),
    ]
    
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    points_cost = models.IntegerField()
    
    # Reward Value
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    free_product = models.ForeignKey('Product', on_delete=models.CASCADE, null=True, blank=True)
    bonus_points_amount = models.IntegerField(null=True, blank=True)
    
    # Availability
    is_active = models.BooleanField(default=True)
    max_redemptions_per_customer = models.IntegerField(default=1)
    total_available = models.IntegerField(null=True, blank=True)  # None = unlimited
    total_redeemed = models.IntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    minimum_tier_required = models.CharField(max_length=20, choices=LoyaltyProgram.TIER_CHOICES, default='bronze')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} - {self.name} ({self.points_cost} points)"
    
    def is_available(self, customer_loyalty):
        """Check if reward is available for redemption"""
        if not self.is_active:
            return False, "Reward is not active"
        
        if self.valid_until and timezone.now() > self.valid_until:
            return False, "Reward has expired"
        
        if timezone.now() < self.valid_from:
            return False, "Reward is not yet available"
        
        if customer_loyalty.current_points_balance < self.points_cost:
            return False, "Insufficient points"
        
        # Check tier requirement
        tier_levels = {'bronze': 0, 'silver': 1, 'gold': 2, 'platinum': 3}
        customer_tier_level = tier_levels.get(customer_loyalty.current_tier, 0)
        required_tier_level = tier_levels.get(self.minimum_tier_required, 0)
        
        if customer_tier_level < required_tier_level:
            return False, f"Requires {self.minimum_tier_required.title()} tier or higher"
        
        # Check total availability
        if self.total_available and self.total_redeemed >= self.total_available:
            return False, "Reward is out of stock"
        
        # Check per-customer limit
        customer_redemptions = LoyaltyRedemption.objects.filter(
            customer_loyalty=customer_loyalty,
            reward=self
        ).count()
        
        if customer_redemptions >= self.max_redemptions_per_customer:
            return False, "Maximum redemptions reached for this customer"
        
        return True, "Available"


class LoyaltyRedemption(models.Model):
    """Record of reward redemptions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_loyalty = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(LoyaltyReward, on_delete=models.CASCADE, related_name='redemptions')
    
    points_used = models.IntegerField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('redeemed', 'Redeemed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Generated coupon/code if applicable
    redemption_code = models.CharField(max_length=50, unique=True, blank=True)
    
    # Usage tracking
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.redemption_code:
            self.redemption_code = self.generate_redemption_code()
        super().save(*args, **kwargs)
    
    def generate_redemption_code(self):
        """Generate unique redemption code"""
        import random
        import string
        while True:
            code = 'REWARD' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not LoyaltyRedemption.objects.filter(redemption_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.customer_loyalty.customer.username} - {self.reward.name} - {self.redemption_code}"


class ReferralProgram(models.Model):
    """Referral program for customer acquisition"""
    shop = models.OneToOneField('Shop', on_delete=models.CASCADE, related_name='referral_program')
    
    is_active = models.BooleanField(default=True)
    referrer_reward_points = models.IntegerField(default=100)
    referee_reward_points = models.IntegerField(default=50)
    minimum_purchase_amount = models.DecimalField(max_digits=8, decimal_places=2, default=25.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.shop.name} Referral Program"


class CustomerReferral(models.Model):
    """Track customer referrals"""
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='referrals')
    
    referral_code = models.CharField(max_length=20, unique=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    first_purchase_order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
    
    def generate_referral_code(self):
        """Generate unique referral code"""
        import random
        import string
        while True:
            code = self.referrer.username[:4].upper() + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not CustomerReferral.objects.filter(referral_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username} - {self.referral_code}"
