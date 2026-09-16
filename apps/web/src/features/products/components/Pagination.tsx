import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@repo/ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 text-xs">
      <div className="text-slate-500">
        Hiển thị <span className="font-semibold text-slate-800">{startItem}</span> -{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> sản phẩm
      </div>

      <div className="flex items-center space-x-1">
        <Button
          type="button"
          id="btn-pagination-prev"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 min-w-8 h-8 rounded-lg cursor-pointer"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={`page-${pageNum}`}
              type="button"
              id={`btn-pagination-page-${pageNum}`}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="min-w-8 h-8 font-medium rounded-lg cursor-pointer border border-transparent disabled:opacity-100"
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          type="button"
          id="btn-pagination-next"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 min-w-8 h-8 rounded-lg cursor-pointer"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
