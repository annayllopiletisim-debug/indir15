'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  basePath: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  basePath 
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('sayfa');
    } else {
      params.set('sayfa', page.toString());
    }
    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ''}`);
  };

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let prev: number | null = null;
    for (const i of range) {
      if (prev !== null) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      {/* Info */}
      <p className="text-sm text-gray-600">
        <span className="font-medium">{totalItems}</span> sonuçtan{' '}
        <span className="font-medium">{startItem}-{endItem}</span> arası gösteriliyor
      </p>

      {/* Pagination Controls */}
      <nav className="flex items-center gap-1" data-testid="pagination-nav">
        {/* First Page */}
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="İlk sayfa"
          data-testid="pagination-first"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Önceki sayfa"
          data-testid="pagination-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => goToPage(page)}
                className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-purple-600 text-white'
                    : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
                data-testid={`pagination-page-${page}`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 text-gray-400">
                {page}
              </span>
            )
          ))}
        </div>

        {/* Mobile Page Indicator */}
        <span className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Sonraki sayfa"
          data-testid="pagination-next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Son sayfa"
          data-testid="pagination-last"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
