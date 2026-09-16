import { z } from 'zod';

// ==========================================
// 1. Zod Validation Schemas (Shared Validation)
// ==========================================

export const userRoleSchema = z.enum(['customer', 'admin']);

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').trim(),
  role: userRoleSchema.optional().default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự').trim(),
  description: z.string().min(5, 'Mô tả sản phẩm phải có ít nhất 5 ký tự').trim(),
  price: z.number().positive('Giá sản phẩm phải lớn hơn 0'),
  inventory: z.number().int().nonnegative('Số lượng tồn kho không được âm'),
  category: z.string().min(1, 'Danh mục sản phẩm là bắt buộc').trim(),
  imageUrl: z.string().url('Đường dẫn hình ảnh không hợp lệ').optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').trim(),
  slug: z.string().min(2, 'Slug danh mục phải có ít nhất 2 ký tự').trim().toLowerCase(),
  description: z.string().optional().default(''),
  parentId: z.string().nullable().optional(),
  icon: z.string().optional().default('folder'),
  sortOrder: z.number().int().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(8),
  category: z.string().optional(),
  brandId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional().default('newest'),
});

export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const paymentMethodSchema = z.enum([
  'cod',
  'bank_transfer',
  'credit_card',
  'vietqr',
  'vnpay',
  'momo',
]);

export const paymentStatusSchema = z.enum([
  'unpaid',
  'paid',
  'refunded',
]);

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm không được để trống'),
  quantity: z.number().int().positive('Số lượng đặt hàng phải lớn hơn 0'),
  variantId: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Giỏ hàng phải có ít nhất 1 sản phẩm'),
  customerName: z.string().min(2, 'Họ tên người nhận phải có ít nhất 2 ký tự').trim(),
  customerPhone: z
    .string()
    .min(9, 'Số điện thoại phải có ít nhất 9 chữ số')
    .regex(/^[0-9+() -]+$/, 'Số điện thoại không hợp lệ')
    .trim(),
  shippingAddress: z.string().min(5, 'Địa chỉ giao hàng phải có ít nhất 5 ký tự').trim(),
  customerNote: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  couponCode: z.string().max(30).optional(),
  paymentMethod: paymentMethodSchema.optional().default('cod'),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const orderFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  userId: z.string().optional(),
  status: orderStatusSchema.optional(),
  search: z.string().optional(),
});

// Cart Schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm là bắt buộc'),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0').default(1),
  isSelected: z.boolean().optional().default(true),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0').optional(),
  isSelected: z.boolean().optional(),
});

// Coupon Schemas
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã giảm giá').trim().toUpperCase(),
  orderSubtotal: z.number().nonnegative(),
});

export const createCouponSchema = z.object({
  code: z.string().min(2, 'Mã coupon phải từ 2 ký tự').trim().toUpperCase(),
  title: z.string().min(2, 'Tiêu đề coupon là bắt buộc').trim(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive('Giá trị giảm phải lớn hơn 0'),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  minOrderValue: z.number().nonnegative().optional().default(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  userLimit: z.number().int().positive().optional().default(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().optional().default(true),
});

// Review Schemas
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm là bắt buộc'),
  orderId: z.string().nullable().optional(),
  rating: z.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  title: z.string().max(255).optional(),
  comment: z.string().min(5, 'Nội dung đánh giá tối thiểu 5 ký tự').trim(),
  images: z.array(z.string().url()).optional().default([]),
});

// Payment Schemas
export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Mã đơn hàng là bắt buộc'),
  provider: z.enum(['vnpay', 'momo', 'vietqr', 'stripe', 'zalopay', 'cod']),
  bankCode: z.string().optional(),
});

// ==========================================
// 2. TypeScript Types inferred from Zod
// ==========================================

export type UserRole = z.infer<typeof userRoleSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;

export type CreateProductPayload = z.infer<typeof createProductSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductSchema>;

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brandId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusPayload = z.infer<typeof updateOrderStatusSchema>;

export type AddToCartPayload = z.infer<typeof addToCartSchema>;
export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>;

export type ValidateCouponPayload = z.infer<typeof validateCouponSchema>;
export type CreateCouponPayload = z.infer<typeof createCouponSchema>;

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
export type CreatePaymentIntentPayload = z.infer<typeof createPaymentIntentSchema>;

export interface OrderFilters {
  page?: number;
  limit?: number;
  userId?: string;
  status?: OrderStatus;
  search?: string;
}

// ==========================================
// 3. Domain Models & API Response Contracts
// ==========================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  level: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  colorName?: string;
  colorCode?: string;
  specSummary?: string;
  price: number;
  originalPrice?: number;
  inventory: number;
  imageUrl?: string;
  isDefault: boolean;
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
  categoryId?: string | null;
  brandId?: string | null;
  brand?: Brand;
  imageUrl?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id?: string;
  cartId?: string;
  productId: string;
  variantId?: string | null;
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  isSelected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  totalQuantity: number;
  selectedSubtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount: number;
  userLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discountAmount: number;
}

export interface Review {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  productId: string;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  images?: string[];
  isVerifiedBuyer: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId?: string | null;
  transactionCode: string;
  provider: 'vnpay' | 'momo' | 'vietqr' | 'stripe' | 'zalopay' | 'cod';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  gatewayTransactionNo?: string | null;
  rawPayload?: unknown;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface AuthResponseData {
  user: User;
  token: string;
}

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
