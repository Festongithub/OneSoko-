import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import {
  UserGroupIcon,
  TrophyIcon,
  GiftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  points_per_dollar: number;
  minimum_spend_for_points: number;
  points_expiry_days: number;
  tiers: {
    bronze: { threshold: number; multiplier: number };
    silver: { threshold: number; multiplier: number };
    gold: { threshold: number; multiplier: number };
    platinum: { threshold: number; multiplier: number };
  };
}

interface LoyaltyAnalytics {
  total_customers: number;
  active_customers: number;
  tier_distribution: Array<{ current_tier: string; count: number }>;
  points_statistics: {
    total_earned: number;
    total_redeemed: number;
    outstanding_balance: number;
  };
  top_customers: Array<{
    customer_name: string;
    tier: string;
    total_points_earned: number;
    current_balance: number;
    total_orders: number;
    annual_spending: number;
  }>;
}

const ShopOwnerLoyaltyDashboard: React.FC = () => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [analytics, setAnalytics] = useState<LoyaltyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { accessToken } = useAuthStore();

  // Form state for loyalty program
  const [programForm, setProgramForm] = useState({
    name: 'Loyalty Rewards',
    description: '',
    is_active: true,
    points_per_dollar: 1,
    minimum_spend_for_points: 0,
    points_expiry_days: 365,
    tiers: {
      bronze: { threshold: 0, multiplier: 1 },
      silver: { threshold: 500, multiplier: 1.25 },
      gold: { threshold: 1500, multiplier: 1.5 },
      platinum: { threshold: 5000, multiplier: 2 }
    }
  });

  useEffect(() => {
    fetchLoyaltyProgram();
    fetchAnalytics();
  }, []);

  const fetchLoyaltyProgram = async () => {
    try {
      const response = await fetch('/api/loyalty-programs/shop_program/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyProgram(data);
        setProgramForm(data);
      } else if (response.status === 404) {
        // No program configured yet
        setLoyaltyProgram(null);
      } else {
        setError('Failed to fetch loyalty program');
      }
    } catch (error) {
      setError('Error fetching loyalty program');
      console.error('Error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/loyalty-programs/customer_analytics/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLoyaltyProgram = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const method = loyaltyProgram ? 'PUT' : 'POST';
      const response = await fetch('/api/loyalty-programs/shop_program/', {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programForm),
      });

      if (response.ok) {
        setSuccess('Loyalty program saved successfully!');
        setShowProgramModal(false);
        await fetchLoyaltyProgram();
        await fetchAnalytics();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save loyalty program');
      }
    } catch (error) {
      setError('Error saving loyalty program');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'text-purple-600 bg-purple-100';
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <TrophyIcon className="h-5 w-5 text-purple-600" />;
      case 'gold':
        return <TrophyIcon className="h-5 w-5 text-yellow-600" />;
      case 'silver':
        return <TrophyIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <TrophyIcon className="h-5 w-5 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loyalty Program Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your customer loyalty program and analyze performance
              </p>
            </div>
            <button
              onClick={() => setShowProgramModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {loyaltyProgram ? <PencilIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
              <span>{loyaltyProgram ? 'Edit Program' : 'Create Program'}</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {!loyaltyProgram ? (
          /* No Program State */
          <div className="text-center py-12">
            <GiftIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Loyalty Program</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a loyalty program to reward your customers and increase retention.
              Offer points, tiers, and exclusive rewards.
            </p>
            <button
              onClick={() => setShowProgramModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Loyalty Program
            </button>
          </div>
        ) : (
          /* Program Exists - Show Dashboard */
          <div className="space-y-8">
            {/* Program Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{loyaltyProgram.name}</h2>
                  <p className="text-gray-600 mt-1">{loyaltyProgram.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    loyaltyProgram.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {loyaltyProgram.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {loyaltyProgram.points_per_dollar}x
                  </div>
                  <div className="text-sm text-gray-600">Points per $1</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${loyaltyProgram.minimum_spend_for_points}
                  </div>
                  <div className="text-sm text-gray-600">Minimum Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {loyaltyProgram.points_expiry_days}
                  </div>
                  <div className="text-sm text-gray-600">Days to Expire</div>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.total_customers}
                      </p>
                      <p className="text-gray-600">Total Members</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.active_customers}
                      </p>
                      <p className="text-gray-600">Active Members</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <GiftIcon className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.points_statistics.total_earned.toLocaleString()}
                      </p>
                      <p className="text-gray-600">Points Earned</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.points_statistics.total_redeemed.toLocaleString()}
                      </p>
                      <p className="text-gray-600">Points Redeemed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tier Distribution */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Tier Distribution</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analytics.tier_distribution.map((tier) => (
                        <div key={tier.current_tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTierIcon(tier.current_tier)}
                            <span className="font-medium capitalize">{tier.current_tier}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">{tier.count} members</span>
                            <span className={`px-2 py-1 rounded text-sm ${getTierColor(tier.current_tier)}`}>
                              {analytics.total_customers > 0 
                                ? Math.round((tier.count / analytics.total_customers) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
                  </div>
                  <div className="p-6">
                    {analytics.top_customers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No customers yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analytics.top_customers.slice(0, 5).map((customer, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {customer.customer_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{customer.customer_name}</p>
                                <div className="flex items-center space-x-2">
                                  {getTierIcon(customer.tier)}
                                  <span className="text-sm text-gray-600 capitalize">{customer.tier}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {customer.total_points_earned} pts
                              </p>
                              <p className="text-sm text-gray-600">
                                ${customer.annual_spending.toFixed(0)} spent
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Program Configuration Modal */}
        {showProgramModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loyaltyProgram ? 'Edit Loyalty Program' : 'Create Loyalty Program'}
                </h3>
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Name
                      </label>
                      <input
                        type="text"
                        value={programForm.name}
                        onChange={(e) => setProgramForm({...programForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points per Dollar
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={programForm.points_per_dollar}
                        onChange={(e) => setProgramForm({...programForm, points_per_dollar: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Spend for Points ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={programForm.minimum_spend_for_points}
                        onChange={(e) => setProgramForm({...programForm, minimum_spend_for_points: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points Expiry (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={programForm.points_expiry_days}
                        onChange={(e) => setProgramForm({...programForm, points_expiry_days: parseInt(e.target.value) || 365})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={programForm.description}
                      onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your loyalty program..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={programForm.is_active}
                        onChange={(e) => setProgramForm({...programForm, is_active: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Program is active</span>
                    </label>
                  </div>
                </div>

                {/* Tier Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Tier Settings</h4>
                  <div className="space-y-4">
                    {Object.entries(programForm.tiers).map(([tierName, tierData]) => (
                      <div key={tierName} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 capitalize mb-3 flex items-center space-x-2">
                          {getTierIcon(tierName)}
                          <span>{tierName} Tier</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Spending Threshold ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tierData.threshold}
                              onChange={(e) => setProgramForm({
                                ...programForm,
                                tiers: {
                                  ...programForm.tiers,
                                  [tierName]: {
                                    ...tierData,
                                    threshold: parseFloat(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Points Multiplier
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="0.1"
                              value={tierData.multiplier}
                              onChange={(e) => setProgramForm({
                                ...programForm,
                                tiers: {
                                  ...programForm.tiers,
                                  [tierName]: {
                                    ...tierData,
                                    multiplier: parseFloat(e.target.value) || 1
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowProgramModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveLoyaltyProgram}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Program'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOwnerLoyaltyDashboard;
