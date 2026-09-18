import React, { useState } from 'react';
import { Search, X, Tag, SlidersHorizontal, Award, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { useCategoryTree } from '../api/useCategories.ts';
import { useBrands } from '../api/useBrands.ts';
import type { ProductFilters } from '../types.ts';

interface ProductFiltersBarProps {
  filters: ProductFilters;
  categories?: string[];
  onFilterChange: (newFilters: Partial<ProductFilters>) => void;
  onReset: () => void;
  totalProducts?: number;
}

export const ProductFiltersBar: React.FC<ProductFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: brandsList = [] } = useBrands();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isCategoryActive = filters.category && filters.category !== 'all';
  const isBrandActive = Boolean(filters.brandId);
  const hasActiveFilters = Boolean(
    isCategoryActive ||
      isBrandActive ||
      filters.search ||
      (filters.sortBy && filters.sortBy !== 'newest') ||
      filters.minPrice ||
      filters.maxPrice
  );

  const activeBrandName = brandsList.find((b) => b.id === filters.brandId)?.name;

  // Helper to find category name & hierarchy from tree
  const getActiveCategoryLabel = (): { rootName?: string; subName?: string; fullName: string } => {
    if (!isCategoryActive) return { fullName: 'Tất cả sản phẩm' };
    const catId = filters.category!.toLowerCase();

    // Check root node
    const root = categoryTree.find(
      (r) =>
        r.id.toLowerCase() === catId ||
        r.slug.toLowerCase() === catId ||
        r.name.toLowerCase() === catId
    );
    if (root) {
      return { rootName: root.name, fullName: root.name };
    }

    // Check sub node
    for (const r of categoryTree) {
      const child = r.children?.find(
        (c) =>
          c.id.toLowerCase() === catId ||
          c.slug.toLowerCase() === catId ||
          c.name.toLowerCase() === catId
      );
      if (child) {
        return {
          rootName: r.name,
          subName: child.name,
          fullName: `${r.name} → ${child.name}`,
        };
      }
    }

    return { fullName: filters.category! };
  };

  const activeCategoryInfo = getActiveCategoryLabel();

  // Handle click on smart trending tag
  const handleSmartTagClick = (tag: string) => {
    if (filters.search === tag) {
      onFilterChange({ search: '', page: 1 });
    } else {
      onFilterChange({ search: tag, page: 1 });
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* 1st Row: Flat Brand Pills with fade indicators and custom scrollbar */}
      <div className="relative w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 flat-scrollbar-x pr-14">
          {/* Toggle / Filter Trigger Button on the left */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              showAdvanced
                ? 'border-blue-600 text-white bg-blue-600 shadow-xs'
                : 'border-blue-200 text-blue-600 bg-blue-50/20 hover:bg-blue-50/50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc</span>
          </button>

          {/* Brand selection pills */}
          <div className="flex items-center gap-1.5 shrink-0 py-0.5">
            {brandsList.map((brand) => {
              const isSelected = filters.brandId === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onFilterChange({ brandId: isSelected ? undefined : brand.id, page: 1 })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 text-blue-600 bg-blue-50/30'
                      : 'border-slate-100 bg-slate-100 hover:bg-slate-200/60 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{brand.name}</span>
                </button>
              );
            })}
          </div>

          {/* Custom smart tag pills from screenshot */}
          <div className="flex items-center gap-1.5 shrink-0 py-0.5">
            <button
              type="button"
              onClick={() => handleSmartTagClick('AI')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                filters.search === 'AI'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/30 font-extrabold'
                  : 'border-slate-100 bg-slate-100 hover:bg-slate-200/60 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Thiết bị AI cao cấp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSmartTagClick('M1')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                filters.search === 'M1'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/30 font-extrabold'
                  : 'border-slate-100 bg-slate-100 hover:bg-slate-200/60 text-slate-700 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Dòng chip M1 / M2</span>
            </button>
          </div>
        </div>
        {/* Subtle right fade indicator */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />
      </div>

      {/* Advanced Filters Block (collapsible for Price Ranges etc) */}
      {showAdvanced && (
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div>
            <label htmlFor="input-min-price" className="block text-xs font-bold text-slate-600 mb-1.5">
              Giá tối thiểu (VNĐ)
            </label>
            <input
              id="input-min-price"
              type="number"
              placeholder="Ví dụ: 5,000,000"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="input-max-price" className="block text-xs font-bold text-slate-600 mb-1.5">
              Giá tối đa (VNĐ)
            </label>
            <input
              id="input-max-price"
              type="number"
              placeholder="Ví dụ: 30,000,000"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}

      {/* 2nd Row: Flat Sorting Options */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
          <span className="font-semibold text-slate-500">Sắp xếp theo:</span>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 pl-1">
            <button
              type="button"
              onClick={() => onFilterChange({ sortBy: 'newest', page: 1 })}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-xs ${
                filters.sortBy === 'newest' || !filters.sortBy
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Nổi bật &amp; Mới
            </button>
            <span className="text-slate-300 select-none">•</span>

            <button
              type="button"
              onClick={() => onFilterChange({ sortBy: 'price_asc', page: 1 })}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-xs ${
                filters.sortBy === 'price_asc'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Giá thấp đến cao
            </button>
            <span className="text-slate-300 select-none">•</span>

            <button
              type="button"
              onClick={() => onFilterChange({ sortBy: 'price_desc', page: 1 })}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-xs ${
                filters.sortBy === 'price_desc'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Giá cao đến thấp
            </button>
            <span className="text-slate-300 select-none">•</span>

            <button
              type="button"
              onClick={() => onFilterChange({ sortBy: 'name_asc', page: 1 })}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-xs ${
                filters.sortBy === 'name_asc'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tên A → Z
            </button>
          </div>
        </div>

        {/* Clear Filters Button nicely aligned on the far right of sorting row */}
        {hasActiveFilters && (
          <button
            type="button"
            id="btn-reset-filters"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer animate-in fade-in shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips/Breadcrumbs */}
      {hasActiveFilters && (
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Đang lọc:</span>
          </span>

          {/* Active Brand Chip */}
          {isBrandActive && activeBrandName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/60 font-semibold">
              <Award className="w-3 h-3 text-indigo-600" />
              <span>Thương hiệu: {activeBrandName}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ brandId: undefined, page: 1 })}
                className="p-0.5 hover:bg-indigo-200/60 rounded-full transition text-indigo-700 cursor-pointer"
                title="Bỏ lọc thương hiệu"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Active Category Chip */}
          {isCategoryActive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60 font-semibold">
              <Tag className="w-3 h-3 text-blue-600" />
              <span>{activeCategoryInfo.fullName}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ category: 'all', page: 1 })}
                className="p-0.5 hover:bg-blue-200/60 rounded-full transition text-blue-700 cursor-pointer"
                title="Bỏ lọc danh mục"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Active Search Term Chip */}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold">
              <Search className="w-3 h-3 text-amber-600" />
              <span>Từ khóa: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => onFilterChange({ search: '', page: 1 })}
                className="p-0.5 hover:bg-amber-200/60 rounded-full transition text-amber-700 cursor-pointer"
                title="Bỏ tìm kiếm"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
