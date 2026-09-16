import type { Product } from '../products/types.ts';
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  CreateOrderPayload as SharedCreateOrderPayload,
  OrderFilters,
} from '@repo/shared-types';

export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderFilters,
};

export interface CartItem {
  id: string; // unique cart item ID
  product: Product;
  quantity: number;
  variantId?: string | null;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountPercent: number;
  addItem: (product: Product, quantity?: number, variantId?: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (isOpen: boolean) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalItems: () => number;
  subtotalPrice: () => number;
  shippingFee: () => number;
  discountAmount: () => number;
  totalPrice: () => number;
}

export type CreateOrderPayload = SharedCreateOrderPayload;

