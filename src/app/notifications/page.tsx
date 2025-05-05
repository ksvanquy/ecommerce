'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: number;
  type: 'order' | 'promotion' | 'product';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }

    // Mock notifications data
    setNotifications([
      {
        id: 1,
        type: 'order',
        title: 'Order #1234 has been shipped',
        message: 'Your order has been shipped and is on its way to you.',
        date: '2024-03-15T10:30:00',
        read: false,
        link: '/orders/1234'
      },
      {
        id: 2,
        type: 'promotion',
        title: 'Spring Sale - 20% Off',
        message: 'Get 20% off on all spring collection items. Use code: SPRING20',
        date: '2024-03-14T15:45:00',
        read: true
      },
      {
        id: 3,
        type: 'product',
        title: 'New Product Alert',
        message: 'Check out our new collection of summer dresses.',
        date: '2024-03-13T09:15:00',
        read: false,
        link: '/products/new'
      },
      {
        id: 4,
        type: 'order',
        title: 'Order #1235 has been delivered',
        message: 'Your order has been successfully delivered.',
        date: '2024-03-12T14:20:00',
        read: true,
        link: '/orders/1235'
      }
    ]);
  }, [router]);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notification =>
    activeFilter === 'all' ? true : !notification.read
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('unread')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'unread'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Unread
                </button>
              </div>

              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No notifications to display</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg ${
                        notification.read ? 'bg-white' : 'bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {notification.type === 'order' && (
                                <svg
                                  className="h-6 w-6 text-indigo-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                  />
                                </svg>
                              )}
                              {notification.type === 'promotion' && (
                                <svg
                                  className="h-6 w-6 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {notification.type === 'product' && (
                                <svg
                                  className="h-6 w-6 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(notification.date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      {notification.link && (
                        <div className="mt-4">
                          <Link
                            href={notification.link}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View details
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 