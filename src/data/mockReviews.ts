export interface Review {
  id: number;
  productId: number;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const mockReviews: Review[] = [
  {
    id: 1,
    productId: 1,
    user: 'John Doe',
    rating: 5,
    comment: 'Sản phẩm rất tốt, giao hàng nhanh!',
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 2,
    productId: 1,
    user: 'Jane Smith',
    rating: 4,
    comment: 'Chất lượng ổn, giá hợp lý.',
    createdAt: '2024-06-02T12:30:00Z',
  },
]; 