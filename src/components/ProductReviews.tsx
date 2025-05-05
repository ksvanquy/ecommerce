'use client';
import { useState, FormEvent } from 'react';
import { mockReviews, Review } from '../data/mockReviews';

export default function ProductReviews({ productId, user }: { productId: number; user: { name: string } | null }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews.filter(r => r.productId === productId));
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Vui lòng nhập bình luận.');
      return;
    }
    const newReview: Review = {
      id: Date.now(),
      productId,
      user: user?.name || 'Guest',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setReviews([newReview, ...reviews]);
    setComment('');
    setRating(5);
    setError('');
    // Nếu muốn lưu vào mockReviews toàn cục, có thể push vào mảng mockReviews ở đây
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Đánh giá & Bình luận</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-center mb-2">
          <span className="mr-2">Đánh giá:</span>
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
            >★</button>
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder="Nhập bình luận của bạn..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Gửi đánh giá
        </button>
      </form>
      <div className="space-y-4">
        {reviews.length === 0 && <div>Chưa có đánh giá nào.</div>}
        {reviews.map(r => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <div className="flex items-center mb-1">
              <span className="font-semibold mr-2">{r.user}</span>
              <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
              <span className="ml-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            <div>{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 