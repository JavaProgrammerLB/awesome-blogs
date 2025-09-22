import { useState, useMemo, useCallback } from 'react';

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number; // inclusive
  endIndex: number;   // exclusive (raw slice end)
  currentItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Generic pagination hook with stable memoized slices and convenience helpers.
 * Automatically scrolls to top on page change (smooth).
 */
export function usePagination<T>(items: readonly T[], pageSize: number = 20): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safeSetPage = useCallback((page: number) => {
    setCurrentPage(prev => {
      const next = Math.min(totalPages, Math.max(1, page));
      if (prev !== next) {
        // Smooth scroll to top on page change
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return next;
    });
  }, [totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const currentItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  const nextPage = useCallback(() => safeSetPage(currentPage + 1), [currentPage, safeSetPage]);
  const prevPage = useCallback(() => safeSetPage(currentPage - 1), [currentPage, safeSetPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    currentItems,
    setPage: safeSetPage,
    nextPage,
    prevPage,
  };
}
