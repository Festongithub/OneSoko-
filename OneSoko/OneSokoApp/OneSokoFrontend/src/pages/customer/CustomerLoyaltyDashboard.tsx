import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  GiftIcon,
  UserIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  InformationCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface LoyaltyAccount {
  shop_id: string;
  shop_name: string;
  shop_logo: string | null;
  current_tier: string;
  tier_progress: number;
  next_tier_spending_needed: number;
  points_balance: number;
  total_points_earned: number;
  total_orders: number;
  annual_spending: number;
  last_activity: string;
}

interface LoyaltyTransaction {
  id: string;
  type: string;
  points_change: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  reward_type: string;
  points_cost: number;
  minimum_tier_required: string;
  is_available: boolean;
  availability_message: string;
}

interface ShopLoyaltyData {
  account: {
    shop_name: string;
    current_tier: string;
    points_balance: number;
    total_points_earned: number;
    annual_spending: number;
    total_orders: number;
  };
  recent_transactions: LoyaltyTransaction[];
  available_rewards: LoyaltyReward[];
}

const CustomerLoyaltyDashboard: React.FC = () => {
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [shopLoyaltyData, setShopLoyaltyData] = useState<ShopLoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopLoading, setShopLoading] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoyaltyAccounts();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchShopLoyaltyData(selectedShop);
    }
  }, [selectedShop]);

  const fetchLoyaltyAccounts = async () => {
    try {
      const response = await fetch('/api/customer-loyalty/my_loyalty_accounts/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyAccounts(data);
        if (data.length > 0 && !selectedShop) {
          setSelectedShop(data[0].shop_id);
        }
      } else {
        setError('Failed to fetch loyalty accounts');
      }
    } catch (error) {
      setError('Error fetching loyalty accounts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopLoyaltyData = async (shopId: string) => {
    setShopLoading(true);
    try {
      const response = await fetch(`/api/customer-loyalty/shop_loyalty/?shop_id=${shopId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShopLoyaltyData(data);
      } else {
        setError('Failed to fetch shop loyalty data');
      }
    } catch (error) {
      setError('Error fetching shop loyalty data');
      console.error('Error:', error);
    } finally {
      setShopLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    if (!selectedShop) return;

    setRedeemingReward(rewardId);
    try {
      const response = await fetch('/api/customer-loyalty/redeem_reward/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reward_id: rewardId,
          shop_id: selectedShop,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Reward redeemed successfully! Code: ${data.redemption_code}`);
        // Refresh data
        fetchShopLoyaltyData(selectedShop);
        fetchLoyaltyAccounts();
      } else {
        const errorData = await response.json();
        alert(`Failed to redeem reward: ${errorData.error}`);
      }
    } catch (error) {
      alert('Error redeeming reward');
      console.error('Error:', error);
    } finally {
      setRedeemingReward(null);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <TrophyIcon className="h-6 w-6 text-purple-500" />;
      case 'gold':
        return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
      case 'silver':
        return <TrophyIcon className="h-6 w-6 text-gray-400" />;
      default:
        return <TrophyIcon className="h-6 w-6 text-amber-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-purple-500 to-indigo-600';
      case 'gold':
        return 'from-yellow-400 to-orange-500';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      default:
        return 'from-amber-400 to-orange-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned_purchase':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'earned_referral':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'redeemed_discount':
      case 'redeemed_product':
      case 'redeemed_service':
        return <GiftIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loyaltyAccounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Loyalty Accounts</h2>
          <p className="text-gray-600 mb-4">
            You don't have any loyalty accounts yet. Start shopping to earn rewards!
          </p>
          <button
            onClick={() => navigate('/shops')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Shops
          </button>
        </div>
      </div>
    );
  }

  const selectedAccount = loyaltyAccounts.find(account => account.shop_id === selectedShop);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty & Rewards</h1>
          <p className="mt-2 text-gray-600">
            Manage your loyalty accounts and redeem rewards from your favorite shops
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Shop Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Shops</h2>
              <div className="space-y-3">
                {loyaltyAccounts.map((account) => (
                  <button
                    key={account.shop_id}
                    onClick={() => setSelectedShop(account.shop_id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedShop === account.shop_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {account.shop_logo ? (
                        <img
                          src={account.shop_logo}
                          alt={account.shop_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {account.shop_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {account.shop_name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getTierIcon(account.current_tier)}
                          <span className="text-sm text-gray-600 capitalize">
                            {account.current_tier}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{account.points_balance} points</span>
                        <span>{account.total_orders} orders</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAccount && shopLoyaltyData && (
              <div className="space-y-6">
                {/* Account Overview */}
                <div className={`bg-gradient-to-r ${getTierColor(selectedAccount.current_tier)} rounded-lg p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedAccount.shop_name}</h2>
                      <div className="flex items-center space-x-2 mt-2">
                        {getTierIcon(selectedAccount.current_tier)}
                        <span className="text-lg font-semibold capitalize">
                          {selectedAccount.current_tier} Member
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{selectedAccount.points_balance}</div>
                      <div className="text-sm opacity-90">Available Points</div>
                    </div>
                  </div>

                  {/* Tier Progress */}
                  {selectedAccount.next_tier_spending_needed > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to next tier</span>
                        <span>${selectedAccount.next_tier_spending_needed.toFixed(2)} to go</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                        <div
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedAccount.tier_progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedAccount.total_points_earned}
                        </p>
                        <p className="text-gray-600">Total Points Earned</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          ${selectedAccount.annual_spending.toFixed(2)}
                        </p>
                        <p className="text-gray-600">Annual Spending</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CalendarIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedAccount.total_orders}
                        </p>
                        <p className="text-gray-600">Total Orders</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Rewards */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
                    </div>
                    <div className="p-6">
                      {shopLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : shopLoyaltyData.available_rewards.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <GiftIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No rewards available</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {shopLoyaltyData.available_rewards.map((reward) => (
                            <div
                              key={reward.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm font-medium text-blue-600">
                                      {reward.points_cost} points
                                    </span>
                                    <span className="text-sm text-gray-500 capitalize">
                                      {reward.minimum_tier_required}+ tier
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => redeemReward(reward.id)}
                                  disabled={!reward.is_available || redeemingReward === reward.id}
                                  className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium ${
                                    reward.is_available
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {redeemingReward === reward.id ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Redeeming...</span>
                                    </div>
                                  ) : reward.is_available ? (
                                    'Redeem'
                                  ) : (
                                    'Unavailable'
                                  )}
                                </button>
                              </div>
                              {!reward.is_available && (
                                <p className="text-sm text-red-600 mt-2">{reward.availability_message}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                      {shopLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : shopLoyaltyData.recent_transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No recent activity</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {shopLoyaltyData.recent_transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(transaction.created_at)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-sm font-medium ${
                                    transaction.points_change > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {transaction.points_change > 0 ? '+' : ''}
                                  {transaction.points_change}
                                </span>
                                <p className="text-xs text-gray-500">
                                  Balance: {transaction.balance_after}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoyaltyDashboard;
