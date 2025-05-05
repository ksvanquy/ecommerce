export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: string;
}

export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Order Shipped',
    message: 'Your order #1234 has been shipped!',
    type: 'order',
    isRead: false,
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'New Promotion',
    message: 'Get 20% off on all electronics this week!',
    type: 'promotion',
    isRead: false,
    createdAt: '2024-06-02T09:00:00Z',
  },
  {
    id: 3,
    title: 'System Update',
    message: 'We have updated our privacy policy.',
    type: 'system',
    isRead: true,
    createdAt: '2024-05-30T08:00:00Z',
  },
];
