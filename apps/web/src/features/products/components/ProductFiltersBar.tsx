import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Tag } from 'lucide-react';
import type { ProductFilters } from '../types.ts';

interface ProductFiltersBarProps {
  filters: ProductFilters;
  categories: string[];
  onFilterChange: (newFilters: Partial<ProductFilters>) => void;
  onReset: () => void;
  totalProducts?: number;
}

export const ProductFiltersBar: React.FC<ProductFiltersBarProps> = ({
  filters,
  categories,
  onFilterChange,
  onReset,
  totalProducts,
}) => {
  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== 'all') ||
      filters.search ||
      filters.sortBy ||
      filters.minPrice ||
      filters.maxPrice
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Top row: Search input, Sort, Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-product-search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="select-product-sort"
                value={filters.sortBy || 'newest'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
                aria-label="Sắp xếp sản phẩm"
                className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="name_asc">Tên: A &rarr; Z</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
          <Tag className="w-3 h-3" />
          <span>Danh mục:</span>
        </span>

        <button
          type="button"
          id="btn-cat-all"
          onClick={() => onFilterChange({ category: 'all', page: 1 })}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
            !filters.category || filters.category === 'all'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Tất cả ({totalProducts !== undefined ? totalProducts : '...'})
        </button>

        {categories.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              id={`btn-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onFilterChange({ category: cat, page: 1 })}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
