export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  database: {
    connected: boolean;
    provider: 'postgresql';
    message?: string;
  };
  environment: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  imageUrl?: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  inventory?: number;
  category?: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'credit_card';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  customerNote?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  couponCode?: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  customerNote?: string;
  couponCode?: string;
  paymentMethod?: PaymentMethod;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  userId?: string;
  status?: OrderStatus;
  search?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}
