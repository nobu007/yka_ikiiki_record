/**
 * Pagination utility functions for dividing large datasets into manageable pages.
 *
 * These functions support efficient data display and navigation, particularly
 * useful for displaying large datasets in UI components without overwhelming
 * the browser or user.
 *
 * @module pagination
 */

import type { PaginationResult, PaginationOptions } from "@/types/pagination";

/**
 * Default pagination configuration.
 */
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Paginates an array of data based on the provided options.
 *
 * @template T - The type of items in the array
 * @param data - The array of items to paginate
 * @param options - Pagination options (pageSize, page)
 * @returns PaginationResult containing the page data and metadata
 *
 * @example
 * ```ts
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
 * const result = paginate(items, { pageSize: 5, page: 2 });
 * // result.data = [6, 7, 8, 9, 10]
 * // result.currentPage = 2
 * // result.totalPages = 3
 * // result.hasNextPage = true
 * ```
 */
export function paginate<T>(
  data: T[],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const pageSize = Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE);
  const page = Math.max(1, options.page ?? DEFAULT_PAGE);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Calculates the page number for a specific item index.
 *
 * @template T - The type of items in the array
 * @param data - The array of items
 * @param itemIndex - The index of the item (0-indexed)
 * @param pageSize - Number of items per page
 * @returns The page number (1-indexed) containing the item, or null if index is out of bounds
 *
 * @example
 * ```ts
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * getPageForIndex(items, 7, 5); // Returns: 2 (item at index 7 is on page 2)
 * ```
 */
export function getPageForIndex<T>(
  data: T[],
  itemIndex: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): number | null {
  if (itemIndex < 0 || itemIndex >= data.length) {
    return null;
  }

  return Math.floor(itemIndex / pageSize) + 1;
}

/**
 * Generates an array of page numbers to display in a pagination control.
 * This handles edge cases like showing ellipsis for large page ranges.
 *
 * @param currentPage - The current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @param maxPagesToShow - Maximum number of page buttons to display (default: 7)
 * @returns Array of page numbers and/or null (representing ellipsis)
 *
 * @example
 * ```ts
 * // For 10 pages, currently on page 5
 * getPageNumbers(5, 10, 7);
 * // Returns: [1, null, 3, 4, 5, 6, 7, null, 10]
 * ```
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxPagesToShow: number = 7
): Array<number | null> {
  if (totalPages <= maxPagesToShow) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | null> = [];
  const sidePages = Math.floor((maxPagesToShow - 3) / 2);

  pages.push(1);

  if (currentPage <= sidePages + 2) {
    for (let i = 2; i <= maxPagesToShow - 1; i++) {
      pages.push(i);
    }
    pages.push(null);
  } else if (currentPage >= totalPages - sidePages - 1) {
    pages.push(null);
    for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(null);
    for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
      pages.push(i);
    }
    pages.push(null);
  }

  pages.push(totalPages);

  return pages;
}
