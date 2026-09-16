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
  productId: string;
  product: Product;
  quantity: number;
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
