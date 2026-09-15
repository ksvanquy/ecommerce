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
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountPercent: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

