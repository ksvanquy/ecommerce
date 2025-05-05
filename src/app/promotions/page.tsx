'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Promotion {
  id: number;
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil: string;
  type: 'percentage' | 'fixed';
  minPurchase?: number;
}

interface LoyaltyTier {
  name: string;
  points: number;
  benefits: string[];
}

export default function PromotionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'promotions' | 'loyalty'>('promotions');

  // Mock promotions data
  const promotions: Promotion[] = [
    {
      id: 1,
      title: 'Spring Sale',
      description: 'Get 20% off on all spring collection items',
      code: 'SPRING20',
      discount: '20%',
      validUntil: '2024-04-30',
      type: 'percentage'
    },
    {
      id: 2,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      code: 'FREESHIP',
      discount: 'Free Shipping',
      validUntil: '2024-03-31',
      type: 'fixed',
      minPurchase: 50
    },
    {
      id: 3,
      title: 'New Customer Discount',
      description: 'Get $10 off your first purchase',
      code: 'WELCOME10',
      discount: '$10',
      validUntil: '2024-12-31',
      type: 'fixed'
    }
  ];

  // Mock loyalty tiers
  const loyaltyTiers: LoyaltyTier[] = [
    {
      name: 'Bronze',
      points: 0,
      benefits: [
        '1 point per $1 spent',
        'Birthday discount',
        'Early access to sales'
      ]
    },
    {
      name: 'Silver',
      points: 1000,
      benefits: [
        '1.5 points per $1 spent',
        'Birthday discount',
        'Early access to sales',
        'Free shipping on orders over $50',
        'Exclusive member-only deals'
      ]
    },
    {
      name: 'Gold',
      points: 5000,
      benefits: [
        '2 points per $1 spent',
        'Birthday discount',
        'Early access to sales',
        'Free shipping on all orders',
        'Exclusive member-only deals',
        'Priority customer service',
        'Exclusive product previews'
      ]
    }
  ];

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Promotions & Loyalty</h1>
          </div>

          <div className="border-t border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('promotions')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'promotions'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Current Promotions
              </button>
              <button
                onClick={() => setActiveTab('loyalty')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'loyalty'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Loyalty Program
              </button>
            </div>

            {activeTab === 'promotions' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {promotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className="bg-white border rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          {promotion.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {promotion.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              Code:
                            </span>
                            <span className="text-sm font-medium text-indigo-600">
                              {promotion.code}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              Discount:
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {promotion.discount}
                            </span>
                          </div>
                          {promotion.minPurchase && (
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-500">
                                Min. Purchase:
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                ${promotion.minPurchase}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              Valid Until:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(promotion.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <button
                            type="button"
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900">
                    Your Loyalty Status
                  </h2>
                  <div className="mt-4 bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Current Tier: Silver
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Points: 1,250
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Next Tier: Gold
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Points needed: 3,750
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                              Progress
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                              25%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                          <div
                            style={{ width: '25%' }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Loyalty Tiers
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {loyaltyTiers.map((tier) => (
                      <div
                        key={tier.name}
                        className="bg-white border rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {tier.name} Tier
                          </h3>
                          <p className="mt-2 text-sm text-gray-500">
                            {tier.points} points required
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              Benefits:
                            </h4>
                            <ul className="mt-2 space-y-2">
                              {tier.benefits.map((benefit, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-sm text-gray-500"
                                >
                                  <svg
                                    className="h-5 w-5 text-green-400 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 