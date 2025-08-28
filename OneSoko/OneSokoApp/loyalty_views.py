from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from .models import (
    Shop, User, Order, 
    LoyaltyProgram, CustomerLoyalty, LoyaltyTransaction, LoyaltyReward, LoyaltyRedemption,
    ReferralProgram, CustomerReferral
)
from .permissions import IsShopOwnerOrReadOnly


class LoyaltyProgramViewSet(viewsets.ViewSet):
    """Loyalty program management for shop owners"""
    permission_classes = [IsAuthenticated, IsShopOwnerOrReadOnly]

    @action(detail=False, methods=['get', 'post', 'put'])
    def shop_program(self, request):
        """Get or update shop's loyalty program"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            try:
                program = shop.loyalty_program
                return Response({
                    'id': program.id,
                    'name': program.name,
                    'description': program.description,
                    'is_active': program.is_active,
                    'points_per_dollar': float(program.points_per_dollar),
                    'minimum_spend_for_points': float(program.minimum_spend_for_points),
                    'points_expiry_days': program.points_expiry_days,
                    'tiers': {
                        'bronze': {
                            'threshold': float(program.bronze_threshold),
                            'multiplier': float(program.bronze_multiplier)
                        },
                        'silver': {
                            'threshold': float(program.silver_threshold),
                            'multiplier': float(program.silver_multiplier)
                        },
                        'gold': {
                            'threshold': float(program.gold_threshold),
                            'multiplier': float(program.gold_multiplier)
                        },
                        'platinum': {
                            'threshold': float(program.platinum_threshold),
                            'multiplier': float(program.platinum_multiplier)
                        }
                    }
                })
            except LoyaltyProgram.DoesNotExist:
                return Response({'message': 'No loyalty program configured'}, status=status.HTTP_404_NOT_FOUND)

        elif request.method in ['POST', 'PUT']:
            data = request.data
            
            program, created = LoyaltyProgram.objects.get_or_create(
                shop=shop,
                defaults={
                    'name': data.get('name', 'Loyalty Rewards'),
                    'description': data.get('description', ''),
                }
            )
            
            # Update program settings
            program.name = data.get('name', program.name)
            program.description = data.get('description', program.description)
            program.is_active = data.get('is_active', program.is_active)
            program.points_per_dollar = Decimal(str(data.get('points_per_dollar', program.points_per_dollar)))
            program.minimum_spend_for_points = Decimal(str(data.get('minimum_spend_for_points', program.minimum_spend_for_points)))
            program.points_expiry_days = data.get('points_expiry_days', program.points_expiry_days)
            
            # Update tier settings
            tiers = data.get('tiers', {})
            if 'bronze' in tiers:
                program.bronze_threshold = Decimal(str(tiers['bronze'].get('threshold', program.bronze_threshold)))
                program.bronze_multiplier = Decimal(str(tiers['bronze'].get('multiplier', program.bronze_multiplier)))
            if 'silver' in tiers:
                program.silver_threshold = Decimal(str(tiers['silver'].get('threshold', program.silver_threshold)))
                program.silver_multiplier = Decimal(str(tiers['silver'].get('multiplier', program.silver_multiplier)))
            if 'gold' in tiers:
                program.gold_threshold = Decimal(str(tiers['gold'].get('threshold', program.gold_threshold)))
                program.gold_multiplier = Decimal(str(tiers['gold'].get('multiplier', program.gold_multiplier)))
            if 'platinum' in tiers:
                program.platinum_threshold = Decimal(str(tiers['platinum'].get('threshold', program.platinum_threshold)))
                program.platinum_multiplier = Decimal(str(tiers['platinum'].get('multiplier', program.platinum_multiplier)))
            
            program.save()
            
            return Response({
                'message': 'Loyalty program updated successfully',
                'created': created
            })

    @action(detail=False, methods=['get'])
    def customer_analytics(self, request):
        """Get loyalty analytics for shop owner"""
        user = request.user
        
        try:
            shop = Shop.objects.get(owner=user)
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get loyalty customers
        customers = CustomerLoyalty.objects.filter(shop=shop)
        
        # Tier distribution
        tier_distribution = customers.values('current_tier').annotate(
            count=Count('id')
        ).order_by('current_tier')
        
        # Points statistics
        total_points_earned = customers.aggregate(Sum('total_points_earned'))['total_points_earned__sum'] or 0
        total_points_redeemed = customers.aggregate(Sum('total_points_redeemed'))['total_points_redeemed__sum'] or 0
        outstanding_points = customers.aggregate(Sum('current_points_balance'))['current_points_balance__sum'] or 0
        
        # Active customers (activity in last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_customers = customers.filter(last_activity_date__gte=thirty_days_ago).count()
        
        # Top customers by points
        top_customers = customers.order_by('-total_points_earned')[:10]
        top_customers_data = []
        for customer in top_customers:
            top_customers_data.append({
                'customer_name': f"{customer.customer.first_name} {customer.customer.last_name}".strip() or customer.customer.username,
                'tier': customer.current_tier,
                'total_points_earned': customer.total_points_earned,
                'current_balance': customer.current_points_balance,
                'total_orders': customer.total_orders,
                'annual_spending': float(customer.annual_spending)
            })
        
        return Response({
            'total_customers': customers.count(),
            'active_customers': active_customers,
            'tier_distribution': list(tier_distribution),
            'points_statistics': {
                'total_earned': total_points_earned,
                'total_redeemed': total_points_redeemed,
                'outstanding_balance': outstanding_points
            },
            'top_customers': top_customers_data
        })


class CustomerLoyaltyViewSet(viewsets.ViewSet):
    """Customer loyalty account management"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_loyalty_accounts(self, request):
        """Get customer's loyalty accounts across all shops"""
        user = request.user
        
        accounts = CustomerLoyalty.objects.filter(customer=user).select_related('shop')
        accounts_data = []
        
        for account in accounts:
            # Calculate tier progress
            try:
                program = account.shop.loyalty_program
                if account.current_tier == 'bronze':
                    next_threshold = program.silver_threshold
                    current_threshold = program.bronze_threshold
                elif account.current_tier == 'silver':
                    next_threshold = program.gold_threshold
                    current_threshold = program.silver_threshold
                elif account.current_tier == 'gold':
                    next_threshold = program.platinum_threshold
                    current_threshold = program.gold_threshold
                else:  # platinum
                    next_threshold = None
                    current_threshold = program.platinum_threshold
                
                if next_threshold:
                    progress = ((account.annual_spending - current_threshold) / (next_threshold - current_threshold)) * 100
                    progress = max(0, min(100, progress))
                    next_tier_spending_needed = max(0, next_threshold - account.annual_spending)
                else:
                    progress = 100
                    next_tier_spending_needed = 0
                
            except LoyaltyProgram.DoesNotExist:
                progress = 0
                next_tier_spending_needed = 0
            
            accounts_data.append({
                'shop_id': account.shop.id,
                'shop_name': account.shop.name,
                'shop_logo': account.shop.logo.url if account.shop.logo else None,
                'current_tier': account.current_tier,
                'tier_progress': round(progress, 1),
                'next_tier_spending_needed': float(next_tier_spending_needed),
                'points_balance': account.current_points_balance,
                'total_points_earned': account.total_points_earned,
                'total_orders': account.total_orders,
                'annual_spending': float(account.annual_spending),
                'last_activity': account.last_activity_date
            })
        
        return Response(accounts_data)

    @action(detail=False, methods=['get'])
    def shop_loyalty(self, request):
        """Get customer's loyalty account for a specific shop"""
        shop_id = request.query_params.get('shop_id')
        if not shop_id:
            return Response({'error': 'shop_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shop = Shop.objects.get(id=shop_id)
            account = CustomerLoyalty.objects.get(customer=request.user, shop=shop)
            
            # Get recent transactions
            recent_transactions = LoyaltyTransaction.objects.filter(
                customer_loyalty=account
            ).order_by('-created_at')[:10]
            
            transactions_data = []
            for transaction in recent_transactions:
                transactions_data.append({
                    'id': str(transaction.id),
                    'type': transaction.transaction_type,
                    'points_change': transaction.points_change,
                    'balance_after': transaction.points_balance_after,
                    'description': transaction.description,
                    'created_at': transaction.created_at
                })
            
            # Get available rewards
            available_rewards = LoyaltyReward.objects.filter(
                shop=shop,
                is_active=True,
                valid_from__lte=timezone.now()
            ).filter(
                Q(valid_until__isnull=True) | Q(valid_until__gte=timezone.now())
            )
            
            rewards_data = []
            for reward in available_rewards:
                is_available, message = reward.is_available(account)
                rewards_data.append({
                    'id': reward.id,
                    'name': reward.name,
                    'description': reward.description,
                    'reward_type': reward.reward_type,
                    'points_cost': reward.points_cost,
                    'minimum_tier_required': reward.minimum_tier_required,
                    'is_available': is_available,
                    'availability_message': message
                })
            
            return Response({
                'account': {
                    'shop_name': shop.name,
                    'current_tier': account.current_tier,
                    'points_balance': account.current_points_balance,
                    'total_points_earned': account.total_points_earned,
                    'annual_spending': float(account.annual_spending),
                    'total_orders': account.total_orders
                },
                'recent_transactions': transactions_data,
                'available_rewards': rewards_data
            })
            
        except Shop.DoesNotExist:
            return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
        except CustomerLoyalty.DoesNotExist:
            return Response({'error': 'No loyalty account found for this shop'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def redeem_reward(self, request):
        """Redeem a loyalty reward"""
        reward_id = request.data.get('reward_id')
        shop_id = request.data.get('shop_id')
        
        if not reward_id or not shop_id:
            return Response({'error': 'reward_id and shop_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shop = Shop.objects.get(id=shop_id)
            account = CustomerLoyalty.objects.get(customer=request.user, shop=shop)
            reward = LoyaltyReward.objects.get(id=reward_id, shop=shop)
            
            # Check if reward is available
            is_available, message = reward.is_available(account)
            if not is_available:
                return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
            
            # Process redemption
            success = account.redeem_points(
                reward.points_cost,
                'redeemed_' + reward.reward_type,
                reference_id=str(reward.id),
                description=f"Redeemed: {reward.name}"
            )
            
            if success:
                # Create redemption record
                redemption = LoyaltyRedemption.objects.create(
                    customer_loyalty=account,
                    reward=reward,
                    points_used=reward.points_cost,
                    expires_at=timezone.now() + timedelta(days=30)  # 30 days to use
                )
                
                # Update reward statistics
                reward.total_redeemed += 1
                reward.save()
                
                return Response({
                    'message': 'Reward redeemed successfully',
                    'redemption_code': redemption.redemption_code,
                    'expires_at': redemption.expires_at,
                    'remaining_points': account.current_points_balance
                })
            else:
                return Response({'error': 'Insufficient points'}, status=status.HTTP_400_BAD_REQUEST)
                
        except (Shop.DoesNotExist, CustomerLoyalty.DoesNotExist, LoyaltyReward.DoesNotExist):
            return Response({'error': 'Invalid shop, account, or reward'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_order_loyalty_points(request):
    """Process loyalty points for a completed order"""
    order_id = request.data.get('order_id')
    
    if not order_id:
        return Response({'error': 'order_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        order = Order.objects.get(id=order_id)
        
        # Only process points for delivered orders
        if order.status != 'delivered':
            return Response({'error': 'Order must be delivered to earn points'}, status=status.HTTP_400_BAD_REQUEST)
        
        shop = order.shop
        
        # Check if shop has loyalty program
        try:
            loyalty_program = shop.loyalty_program
            if not loyalty_program.is_active:
                return Response({'message': 'Loyalty program not active'})
        except LoyaltyProgram.DoesNotExist:
            return Response({'message': 'No loyalty program configured'})
        
        # Get or create customer loyalty account
        customer_loyalty, created = CustomerLoyalty.objects.get_or_create(
            customer=order.user,
            shop=shop,
            defaults={
                'first_purchase_date': order.created_at
            }
        )
        
        # Check if points already awarded for this order
        existing_transaction = LoyaltyTransaction.objects.filter(
            customer_loyalty=customer_loyalty,
            reference_id=str(order.id),
            transaction_type='earned_purchase'
        ).exists()
        
        if existing_transaction:
            return Response({'message': 'Points already awarded for this order'})
        
        # Calculate points
        order_total = order.total_amount
        if order_total >= loyalty_program.minimum_spend_for_points:
            base_points = int(order_total * loyalty_program.points_per_dollar)
            tier_multiplier = loyalty_program.get_tier_multiplier(customer_loyalty.current_tier)
            total_points = int(base_points * tier_multiplier)
            
            # Award points
            customer_loyalty.add_points(
                total_points,
                'earned_purchase',
                reference_id=str(order.id),
                description=f"Purchase order #{order.id}"
            )
            
            # Update customer statistics
            customer_loyalty.total_orders += 1
            customer_loyalty.annual_spending += order_total
            customer_loyalty.save()
            
            # Update tier if necessary
            customer_loyalty.update_tier()
            
            return Response({
                'message': 'Loyalty points awarded',
                'points_awarded': total_points,
                'total_balance': customer_loyalty.current_points_balance,
                'current_tier': customer_loyalty.current_tier
            })
        else:
            return Response({
                'message': f'Order total must be at least {loyalty_program.minimum_spend_for_points} to earn points'
            })
            
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_info(request):
    """Get customer's referral information"""
    user = request.user
    shop_id = request.query_params.get('shop_id')
    
    if not shop_id:
        return Response({'error': 'shop_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        shop = Shop.objects.get(id=shop_id)
        
        # Check if shop has referral program
        try:
            referral_program = shop.referral_program
            if not referral_program.is_active:
                return Response({'message': 'Referral program not active'})
        except ReferralProgram.DoesNotExist:
            return Response({'message': 'No referral program configured'})
        
        # Get customer's referral code
        referral_code = f"{user.username[:4].upper()}{shop.id}{user.id}"
        
        # Get referrals made by this customer
        referrals_made = CustomerReferral.objects.filter(
            referrer=user,
            shop=shop
        ).count()
        
        # Get total referral rewards earned
        referral_transactions = LoyaltyTransaction.objects.filter(
            customer_loyalty__customer=user,
            customer_loyalty__shop=shop,
            transaction_type='earned_referral'
        )
        
        total_referral_points = referral_transactions.aggregate(
            Sum('points_change')
        )['points_change__sum'] or 0
        
        return Response({
            'referral_code': referral_code,
            'referrals_made': referrals_made,
            'total_referral_points': total_referral_points,
            'referrer_reward_points': referral_program.referrer_reward_points,
            'referee_reward_points': referral_program.referee_reward_points,
            'minimum_purchase_amount': float(referral_program.minimum_purchase_amount)
        })
        
    except Shop.DoesNotExist:
        return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
