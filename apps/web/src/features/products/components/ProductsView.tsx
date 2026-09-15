import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../api/useProducts.ts';
import { useCategories } from '../api/useCategories.ts';
import { ProductList } from './ProductList.tsx';
import { ProductFiltersBar } from './ProductFiltersBar.tsx';
import { Pagination } from './Pagination.tsx';
import { useCartStore } from '../../checkout/store/cartStore.ts';
import type { Product, ProductFilters } from '../types.ts';
import { Check } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 8,
    category: 'all',
    search: '',
    sortBy: 'newest',
  });

  const [cartToast, setCartToast] = useState<{ visible: boolean; name: string }>({
    visible: false,
    name: '',
  });

  const addItem = useCartStore((state) => state.addItem);

  const { data: categories = [] } = useCategories();
  const { data: productsData, isLoading } = useProducts(filters);

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };

  // Listen for custom category selection event from Header Mega Menu
  useEffect(() => {
    const handleCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ categorySlug: string }>;
      if (customEvent.detail?.categorySlug) {
        setFilters((prev) => ({
          ...prev,
          category: customEvent.detail.categorySlug,
          page: 1,
        }));
      }
    };

    window.addEventListener('techstore:select-category', handleCategoryEvent);
    return () => {
      window.removeEventListener('techstore:select-category', handleCategoryEvent);
    };
  }, []);

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 8,
      category: 'all',
      search: '',
      sortBy: 'newest',
    });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setCartToast({ visible: true, name: product.name });
    setTimeout(() => {
      setCartToast({ visible: false, name: '' });
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <ProductFiltersBar
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalProducts={pagination.total}
      />

      {/* Product List Grid */}
      <div className="space-y-6">
        <ProductList
          products={products}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={pagination.limit}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      </div>

      {/* Toast Notification when item added to cart */}
      {cartToast.visible && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-emerald-400">Đã thêm vào giỏ hàng!</p>
            <p className="text-slate-300 truncate max-w-[180px]">{cartToast.name}</p>
          </div>
          <Link
            to="/cart"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline ml-2"
          >
            Xem giỏ
          </Link>
        </div>
      )}
    </div>
  );
};
