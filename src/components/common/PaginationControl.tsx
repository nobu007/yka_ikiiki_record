import { memo } from "react";
import { getPageNumbers } from "@/utils/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  showPageInfo?: boolean;
  maxPagesToShow?: number;
}

const PaginationControlComponent = memo<PaginationControlProps>(function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
  showPageInfo = true,
  maxPagesToShow = 7,
}) {
  const pageNumbers = getPageNumbers(currentPage, totalPages, maxPagesToShow);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const isPreviousDisabled = disabled || currentPage <= 1;
  const isNextDisabled = disabled || currentPage >= totalPages;

  return (
    <nav
      className={`pagination-control ${className}`.trim()}
      aria-label="Pagination Navigation"
      role="navigation"
      aria-live="polite"
    >
      <div className="pagination-content">
        {showPageInfo && (
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
        )}

        <div className="pagination-buttons">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={isPreviousDisabled}
            aria-label="Previous page"
            aria-disabled={isPreviousDisabled}
            className="pagination-button pagination-button-previous"
          >
            Previous
          </button>

          <div className="page-numbers" role="group" aria-label="Page numbers">
            {pageNumbers.map((pageNumber, index) => {
              if (pageNumber === null) {
                return (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }

              const isCurrentPage = pageNumber === currentPage;
              return (
                <button
                  key={`page-${pageNumber}-${index}`}
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={disabled}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={`pagination-button pagination-number ${
                    isCurrentPage ? "pagination-button-current" : ""
                  }`.trim()}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={isNextDisabled}
            aria-label="Next page"
            aria-disabled={isNextDisabled}
            className="pagination-button pagination-button-next"
          >
            Next
          </button>
        </div>
      </div>
    </nav>
  );
});

export const PaginationControl = PaginationControlComponent;
PaginationControl.displayName = "PaginationControl";
