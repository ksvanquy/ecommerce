export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingMethod: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  orders: Order[];
  totalSpent: number;
  shippingAddress: string;
  billingAddress: string;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  recentOrders: Order[];
  wishlist: {
    id: number;
    name: string;
    price: number;
    image: string;
    dateAdded: string;
  }[];
}

export const mockUserProfile: UserProfile = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  joinDate: '2024-01-01',
  orders: [
    {
      id: 'ORD-2024-001',
      date: '2024-03-15',
      status: 'delivered',
      items: [
        {
          id: 1,
          name: 'Wireless Headphones',
          price: 99.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        },
        {
          id: 2,
          name: 'Smart Watch',
          price: 199.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        },
      ],
      total: 299.98,
      shippingMethod: 'Express Shipping',
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'Credit Card',
    },
    {
      id: 'ORD-2024-002',
      date: '2024-03-20',
      status: 'processing',
      items: [
        {
          id: 3,
          name: 'Laptop',
          price: 999.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        },
      ],
      total: 999.99,
      shippingMethod: 'Standard Shipping',
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'PayPal',
    },
  ],
  totalSpent: 1299.97,
  shippingAddress: '123 Main St, New York, NY 10001',
  billingAddress: '123 Main St, New York, NY 10001',
  preferences: {
    newsletter: true,
    notifications: true,
  },
  recentOrders: [
    {
      id: 'ORD-2024-002',
      date: '2024-03-20',
      status: 'processing',
      items: [
        {
          id: 3,
          name: 'Laptop',
          price: 999.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        },
      ],
      total: 999.99,
      shippingMethod: 'Standard Shipping',
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'PayPal',
    },
  ],
  wishlist: [
    {
      id: 4,
      name: 'Smartphone',
      price: 799.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      dateAdded: '2024-03-18',
    },
  ],
}; 