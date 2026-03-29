/**
 * React hook for managing pagination state and logic.
 *
 * This hook provides a clean separation of concerns for pagination functionality,
 * encapsulating the state management and data slicing logic. It's designed to be
 * framework-agnostic and reusable across any component that needs pagination.
 *
 * @module presentation/hooks/usePagination
 */

import { useState, useCallback, useMemo } from "react";
import { paginate } from "@/utils/pagination";
import type { PaginationResult, PaginationOptions } from "@/types/pagination";

/**
 * Default page size for pagination.
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Options for configuring the usePagination hook.
 */
interface UsePaginationOptions<T> extends PaginationOptions {
  /** Initial page size (default: 10) */
  pageSize?: number;
  /** Initial page number (default: 1) */
  initialPage?: number;
}

/**
 * Return value of the usePagination hook.
 */
interface UsePaginationReturn<T> {
  /** Current page data */
  currentPageData: T[];
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Current page size */
  pageSize: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Function to change the current page */
  goToPage: (page: number) => void;
  /** Function to go to the next page */
  goToNextPage: () => void;
  /** Function to go to the previous page */
  goToPreviousPage: () => void;
  /** Function to change the page size */
  changePageSize: (size: number) => void;
  /** Function to reset to the first page */
  reset: () => void;
}

/**
 * Custom hook for managing pagination state and logic.
 *
 * This hook provides a complete pagination solution with state management,
 * data slicing, and navigation controls. It's memoized for performance
 * and uses useCallback for stable function references.
 *
 * @template T - The type of items in the data array
 * @param data - The full array of items to paginate
 * @param options - Pagination configuration options
 * @returns Pagination state and control functions
 *
 * @example
 * ```tsx
 * function StudentTable({ students }) {
 *   const {
 *     currentPageData,
 *     currentPage,
 *     totalPages,
 *     goToPage,
 *     goToNextPage,
 *     goToPreviousPage,
 *   } = usePagination(students, { pageSize: 10 });
 *
 *   return (
 *     <div>
 *       <table>
 *         {currentPageData.map(student => (
 *           <tr key={student.id}>{student.name}</tr>
 *         ))}
 *       </table>
 *       <PaginationControl
 *         currentPage={currentPage}
 *         totalPages={totalPages}
 *         onPageChange={goToPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions<T> = {}
): UsePaginationReturn<T> {
  const { pageSize: initialPageSize = DEFAULT_PAGE_SIZE, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginationResult = useMemo<PaginationResult<T>>(
    () => paginate(data, { pageSize, page: currentPage }),
    [data, pageSize, currentPage]
  );

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, paginationResult.totalPages));
      setCurrentPage(validPage);
    },
    [paginationResult.totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (paginationResult.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginationResult.hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationResult.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [paginationResult.hasPreviousPage]);

  const changePageSize = useCallback(
    (size: number) => {
      const newPageSize = Math.max(1, size);
      setPageSize(newPageSize);
      setCurrentPage(1);
    },
    []
  );

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPageData: paginationResult.data,
    currentPage: paginationResult.currentPage,
    totalPages: paginationResult.totalPages,
    totalItems: paginationResult.totalItems,
    pageSize: paginationResult.pageSize,
    hasNextPage: paginationResult.hasNextPage,
    hasPreviousPage: paginationResult.hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    reset,
  };
}
