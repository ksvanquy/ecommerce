'use client';

import { useState } from 'react';
import { mockNotifications, Notification } from '../../data/mockNotifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="space-y-4">
          {notifications.length === 0 && (
            <div className="text-gray-500">No notifications.</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded shadow flex justify-between items-center ${n.isRead ? 'bg-gray-100' : 'bg-indigo-50'
                }`}
            >
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div></div>
  );
} 