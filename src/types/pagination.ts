/**
 * Pagination result containing page data and metadata.
 *
 * @template T - The type of items in the paginated data
 */
export interface PaginationResult<T> {
  /** The items for the current page */
  data: T[];
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Configuration options for pagination.
 */
export interface PaginationOptions {
  /** Page size (number of items per page). Must be >= 1. Default: 10 */
  pageSize?: number;
  /** Current page number (1-indexed). Must be >= 1. Default: 1 */
  page?: number;
}
