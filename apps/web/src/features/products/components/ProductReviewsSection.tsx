import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, toast } from '@repo/ui';
import { reviewsApi, type ProductReviewsResponse } from '../api/reviewsApi.ts';
import { WriteReviewModal } from './WriteReviewModal.tsx';
import { useAuthStore } from '../../auth/store/authStore.ts';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  User,
} from 'lucide-react';
import type { Review } from '@repo/shared-types';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedFilterStar, setSelectedFilterStar] = useState<number | null>(null);

  const fetchReviews = useCallback(() => {
    setIsLoading(true);
    reviewsApi
      .getProductReviews(productId, 1, 50)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load reviews:', err);
        setIsLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const summary = data?.summary || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  };

  const reviews = data?.items || [];
  const filteredReviews = selectedFilterStar
    ? reviews.filter((r) => r.rating === selectedFilterStar)
    : reviews;

  const totalReviews = summary.totalReviews || 0;
  const avgRating = Number(summary.averageRating || 0).toFixed(1);

  return (
    <div id="product-reviews-section" className="space-y-6 pt-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Đánh giá &amp; Nhận xét từ khách hàng</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá thực tế từ các khách hàng đã trải nghiệm sản phẩm tại TechStore.
            </p>
          </div>

          <Button
            id="btn-open-write-review"
            variant="primary"
            size="sm"
            onClick={() => setIsWriteModalOpen(true)}
            className="text-xs font-semibold shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-white mr-1.5" />
            Viết Đánh Giá Của Bạn
          </Button>
        </div>

        {/* Rating Overview Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 items-center">
          {/* Average Rating Score */}
          <div className="md:col-span-4 text-center md:border-r border-slate-200/80 md:pr-6 space-y-2">
            <div className="text-4xl font-extrabold text-slate-900 font-mono">
              {totalReviews > 0 ? avgRating : '5.0'}
              <span className="text-lg text-slate-400 font-normal">/5</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating || 5))
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {totalReviews > 0 ? `Dựa trên ${totalReviews} đánh giá` : 'Chưa có đánh giá nào'}
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="md:col-span-8 space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const starCount = (summary.ratingDistribution as any)?.[star.toString()] || 0;
              const percentage = totalReviews > 0 ? Math.round((starCount / totalReviews) * 100) : 0;
              const isSelected = selectedFilterStar === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setSelectedFilterStar(isSelected ? null : star)
                  }
                  className={`w-full flex items-center gap-3 p-1 rounded-lg transition text-left cursor-pointer hover:bg-slate-200/50 ${
                    isSelected ? 'bg-blue-50 font-bold ring-1 ring-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center gap-1 w-12 shrink-0 font-mono text-slate-700">
                    <span>{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right font-mono text-slate-500 text-[11px] shrink-0">
                    {percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs flex-wrap">
            <span className="text-slate-500 font-medium mr-1">Lọc theo sao:</span>
            <button
              type="button"
              onClick={() => setSelectedFilterStar(null)}
              className={`px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer ${
                selectedFilterStar === null
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedFilterStar(star)}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  selectedFilterStar === star
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Đang tải danh sách đánh giá...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs text-slate-500">
              {selectedFilterStar
                ? `Không có đánh giá ${selectedFilterStar} sao nào.`
                : 'Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên để lại nhận xét!'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWriteModalOpen(true)}
              className="text-xs"
            >
              Viết đánh giá ngay
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                      {review.user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {review.user?.fullName || 'Khách hàng TechStore'}
                        </span>
                        {review.isVerifiedBuyer && (
                          <Badge variant="success" className="text-[10px] py-0 px-1.5 gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Đã mua hàng
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h5 className="font-bold text-xs text-slate-900">
                    {review.title}
                  </h5>
                )}

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Đánh giá thực tế"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <WriteReviewModal
          productId={productId}
          productName={productName}
          onReviewSubmitted={() => {
            fetchReviews();
            toast.success('Đã gửi đánh giá thành công!', {
              description: 'Đánh giá của bạn đã được cập nhật trực tiếp trên sản phẩm.',
            });
          }}
          onClose={() => setIsWriteModalOpen(false)}
        />
      )}
    </div>
  );
};
