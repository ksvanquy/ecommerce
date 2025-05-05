import { Product } from './mockData';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export const mockOrders: Order[] = [
  {
    id: 1,
    userId: 1,
    items: [
      {
        product: {
          id: 1,
          name: 'Smartphone X',
          price: 999.99,
          description: 'Latest smartphone with advanced features',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
          category: 'Electronics',
          rating: 4.5,
          reviews: 120,
        },
        quantity: 1,
      },
      {
        product: {
          id: 2,
          name: 'Wireless Earbuds',
          price: 129.99,
          description: 'High-quality wireless earbuds with noise cancellation',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
          category: 'Electronics',
          rating: 4.2,
          reviews: 85,
        },
        quantity: 2,
      },
    ],
    total: 1259.97,
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  },
  {
    id: 2,
    userId: 1,
    items: [
      {
        product: {
          id: 3,
          name: 'Laptop Pro',
          price: 1499.99,
          description: 'High-performance laptop for professionals',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
          category: 'Electronics',
          rating: 4.8,
          reviews: 92,
        },
        quantity: 1,
      },
    ],
    total: 1499.99,
    status: 'processing',
    createdAt: '2024-02-01T14:15:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  },
]; 