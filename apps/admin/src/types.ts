import { Order, PaymentTransaction, Product, User } from '@repo/shared-types';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingTransactions: number;
  lowStockCount: number;
  monthlyRevenue: { month: string; amount: number }[];
  categoryRevenue: { category: string; value: number }[];
}

export type AdminTab = 'dashboard' | 'orders' | 'products' | 'transactions';
