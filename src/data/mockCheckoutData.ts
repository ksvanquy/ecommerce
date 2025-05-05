export interface ShippingMethod {
  id: number;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface OrderStatus {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  description: string;
  date: string;
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: 1,
    name: 'Standard Shipping',
    description: 'Delivery within 3-5 business days',
    price: 5.99,
    estimatedDays: 4,
  },
  {
    id: 2,
    name: 'Express Shipping',
    description: 'Delivery within 1-2 business days',
    price: 12.99,
    estimatedDays: 2,
  },
  {
    id: 3,
    name: 'Free Shipping',
    description: 'Delivery within 5-7 business days',
    price: 0,
    estimatedDays: 6,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: 'Credit Card',
    description: 'Pay with your credit card',
    icon: 'credit-card',
  },
  {
    id: 2,
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: 'paypal',
  },
  {
    id: 3,
    name: 'Bank Transfer',
    description: 'Pay via bank transfer',
    icon: 'bank',
  },
];

export const orderStatuses: OrderStatus[] = [
  {
    id: 1,
    status: 'pending',
    description: 'Order received',
    date: '2024-03-20T10:00:00Z',
  },
  {
    id: 2,
    status: 'processing',
    description: 'Payment confirmed',
    date: '2024-03-20T10:05:00Z',
  },
  {
    id: 3,
    status: 'shipped',
    description: 'Order shipped',
    date: '2024-03-21T09:00:00Z',
  },
  {
    id: 4,
    status: 'delivered',
    description: 'Order delivered',
    date: '2024-03-23T14:30:00Z',
  },
]; 