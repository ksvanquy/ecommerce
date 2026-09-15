import React from 'react';
import type { Product } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';
import { PackageOpen } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onAddToCart,
  onQuickView,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4 space-y-3 animate-pulse"
          >
            <div className="h-40 bg-slate-100 rounded-lg" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-5 bg-slate-100 rounded w-4/5" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-5 bg-slate-100 rounded w-1/4" />
              <div className="h-8 bg-slate-100 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <PackageOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy sản phẩm nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có sản phẩm nào khớp với từ khóa tìm kiếm hoặc bộ lọc danh mục đã chọn. Thử thay đổi hoặc xóa bộ lọc.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
