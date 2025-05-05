'use client';

import { useState } from 'react';
import { mockUserProfile } from '../../data/mockUserData';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'overview' | 'orders' | 'wishlist' | 'settings';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { name, email, avatar, joinDate, orders, totalSpent, shippingAddress, billingAddress, preferences, recentOrders, wishlist } = mockUserProfile;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24">
              <Image
                src={avatar}
                alt={name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-gray-500">{email}</p>
              <p className="text-sm text-gray-500">Member since {formatDate(joinDate)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'orders', label: 'Orders' },
                { id: 'wishlist', label: 'Wishlist' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Orders</span>
                      <span className="font-medium">{orders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Spent</span>
                      <span className="font-medium">${totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 2).map((order) => (
                      <div key={order.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{order.items[0].name}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                        </div>
                        <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="relative h-16 w-16">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-lg font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm font-medium text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Added on {formatDate(item.dateAdded)}</p>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm hover:bg-indigo-700">
                        Add to Cart
                      </button>
                      <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-300">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Addresses</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
                      <p className="text-sm text-gray-500">{shippingAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Billing Address</h3>
                      <p className="text-sm text-gray-500">{billingAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Notifications</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${preferences.notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {preferences.notifications ? 'Enabled' : 'Disabled'}
                      </span>
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
} 