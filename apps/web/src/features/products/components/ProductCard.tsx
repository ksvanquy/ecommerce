import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types.ts';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import { ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.ts';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
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

  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 10;

  // Stable deterministic sold count to make it look realistic as in the image
  const stableSoldCount = React.useMemo(() => {
    const code = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = (code % 880) + 120;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  }, [product.id]);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col relative"
    >
      {/* Product Image Link Area */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center block cursor-pointer"
        title={`Xem chi tiết ${product.name}`}
      >
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Voucher Tag at the bottom left of image, matching the image prompt */}
        <div className="absolute bottom-0 left-0 bg-[#facc15] text-[#dc2626] font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 uppercase tracking-wide rounded-tr">
          VOUCHER
        </div>

        {/* Stock status overlay */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-rose-600/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
            Hết hàng
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2 bg-amber-500/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
            Chỉ còn {product.inventory}
          </div>
        ) : null}
      </Link>

      {/* Product Content Details */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1">
          <Link to={`/products/${product.id}`} className="block">
            <h4 className="font-medium text-[13px] sm:text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors min-h-[34px]">
              {product.name}
            </h4>
          </Link>
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-1.5">
          <div className="flex flex-col min-w-0">
            <span className="font-normal text-rose-600 text-[13px] sm:text-[14px] whitespace-nowrap">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-light whitespace-nowrap">
              {stableSoldCount} sold
            </span>
          </div>

          <button
            id={`btn-add-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all ${
              addedAnimation
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Thêm vào giỏ hàng"
          >
            {addedAnimation ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
