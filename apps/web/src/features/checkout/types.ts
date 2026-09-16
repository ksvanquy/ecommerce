import type { Product } from '../products/types.ts';
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  CreateOrderPayload as SharedCreateOrderPayload,
  OrderFilters,
  Coupon,
  PaymentTransaction,
  Review,
  ReviewSummary,
} from '@repo/shared-types';

export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderFilters,
  Coupon,
  PaymentTransaction,
  Review,
  ReviewSummary,
};

export interface CartItem {
  id: string; // client/server cart item ID
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string | null;
  isSelected: boolean;
  serverItemId?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  couponCode: string | null;
  appliedCoupon: Coupon | null;
  discountPercent: number;
  discountCalculatedAmount: number;

  addItem: (product: Product, quantity?: number, variantId?: string | null) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  toggleSelectItem: (id: string, isSelected?: boolean) => Promise<void>;
  toggleSelectAll: (select: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  setOpen: (isOpen: boolean) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  totalItems: () => number;
  selectedItemsCount: () => number;
  subtotalPrice: () => number; // Subtotal for selected items
  allSubtotalPrice: () => number; // Subtotal for all items
  shippingFee: () => number;
  discountAmount: () => number;
  totalPrice: () => number;
}

export type CreateOrderPayload = SharedCreateOrderPayload;
