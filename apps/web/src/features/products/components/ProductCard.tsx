import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types.ts';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Eye, ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.ts';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem(product, 1);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 10;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col relative"
    >
      {/* Product Image Area */}
      <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Hover Quick Actions - Single unified action */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          {onQuickView ? (
            <button
              type="button"
              onClick={handleQuickView}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md transition flex items-center gap-1.5 transform scale-95 group-hover:scale-100"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem chi tiết</span>
            </button>
          ) : (
            <Link
              to={`/products/${product.id}`}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md transition flex items-center gap-1.5 transform scale-95 group-hover:scale-100"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem chi tiết</span>
            </Link>
          )}
        </div>

        {/* Stock status & Brand overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.brand && (
            <Badge variant="info" className="bg-blue-600 text-white shadow-2xs text-[10px] font-bold">
              {product.brand.name}
            </Badge>
          )}
          <Badge variant="neutral" className="bg-white/90 text-slate-700 shadow-2xs text-[10px]">
            {product.category}
          </Badge>
        </div>

        {isOutOfStock ? (
          <div className="absolute top-2.5 right-2.5 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
            Hết hàng
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2.5 right-2.5 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
            Chỉ còn {product.inventory}
          </div>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.id}`} className="block group/link">
            <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 group-hover/link:text-blue-600 transition-colors">
              {product.name}
            </h4>
          </Link>

          {/* Variants summary chip if present */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{product.variants.length} phiên bản tùy chọn</span>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block leading-none">Giá bán</span>
            <span className="font-bold text-slate-900 text-base">
              {formatCurrency(product.price)}
            </span>
          </div>

          <Button
            id={`btn-add-cart-${product.id}`}
            size="sm"
            variant={addedAnimation ? 'primary' : 'outline'}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={addedAnimation ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' : ''}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Đã thêm
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Thêm giỏ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
