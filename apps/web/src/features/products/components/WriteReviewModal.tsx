import React, { useState } from 'react';
import { Button, Card, Badge } from '@repo/ui';
import { reviewsApi } from '../api/reviewsApi.ts';
import { useAuthStore } from '../../auth/store/authStore.ts';
import {
  Star,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface WriteReviewModalProps {
  productId: string;
  productName: string;
  orderId?: string;
  onReviewSubmitted: () => void;
  onClose: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  productId,
  productName,
  orderId,
  onReviewSubmitted,
  onClose,
}) => {
  const user = useAuthStore((state) => state.user);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await reviewsApi.createReview({
        productId,
        orderId: orderId || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onReviewSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Không thể gửi đánh giá lúc này. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Đánh giá sản phẩm
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs" title={productName}>
                {productName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-slate-900">
                Gửi đánh giá thành công!
              </h4>
              <p className="text-xs text-slate-500">
                Cảm ơn bạn đã đóng góp phản hồi quý báu cho cộng đồng TechStore.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Star Rating selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Đánh giá chung của bạn <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-semibold text-slate-700 font-mono">
                    {rating === 5
                      ? '5/5 - Cực kỳ hài lòng'
                      : rating === 4
                      ? '4/5 - Hài lòng'
                      : rating === 3
                      ? '3/5 - Bình thường'
                      : rating === 2
                      ? '2/5 - Chưa hài lòng'
                      : '1/5 - Rất thất vọng'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tiêu đề nhận xét (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế đẹp, pin trâu, máy mượt..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nội dung đánh giá chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về chất lượng sản phẩm, hiệu năng, đóng gói giao hàng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Images URLs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Đính kèm link hình ảnh thực tế (Tùy chọn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="text-xs"
                  >
                    Thêm ảnh
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {images.map((img, i) => (
                      <div key={i} className="relative group w-12 h-12 rounded-lg border overflow-hidden">
                        <img
                          src={img}
                          alt="Review attachment"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || !comment.trim()}
                  className="flex-1 justify-center text-xs font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Đang gửi đánh giá...</span>
                    </>
                  ) : (
                    <span>Gửi Đánh Giá Của Bạn</span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="text-xs"
                >
                  Hủy bỏ
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
