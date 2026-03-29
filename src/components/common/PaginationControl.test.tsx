import { render, screen, fireEvent } from "@testing-library/react";
import { PaginationControl } from "./PaginationControl";

describe("PaginationControl", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render pagination controls", () => {
      render(<PaginationControl {...defaultProps} />);
      expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
    });

    it("should render previous and next buttons", () => {
      render(<PaginationControl {...defaultProps} />);
      expect(screen.getByRole("button", { name: /previous page/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument();
    });

    it("should render page numbers", () => {
      render(<PaginationControl {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    });

    it("should display current page info", () => {
      render(<PaginationControl {...defaultProps} />);
      expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
    });
  });

  describe("Navigation Behavior", () => {
    it("should call onPageChange with next page when Next is clicked", () => {
      render(<PaginationControl {...defaultProps} />);
      const nextButton = screen.getByRole("button", { name: /next page/i });
      fireEvent.click(nextButton);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it("should call onPageChange with previous page when Previous is clicked", () => {
      render(<PaginationControl {...defaultProps} currentPage={2} />);
      const prevButton = screen.getByRole("button", { name: /previous page/i });
      fireEvent.click(prevButton);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it("should call onPageChange when page number is clicked", () => {
      render(<PaginationControl {...defaultProps} />);
      const page3Button = screen.getByRole("button", { name: "Page 3" });
      fireEvent.click(page3Button);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("Button States", () => {
    it("should disable Previous button on first page", () => {
      render(<PaginationControl {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByRole("button", { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });

    it("should disable Next button on last page", () => {
      render(<PaginationControl {...defaultProps} currentPage={5} />);
      const nextButton = screen.getByRole("button", { name: /next page/i });
      expect(nextButton).toBeDisabled();
    });

    it("should enable both navigation buttons on middle pages", () => {
      render(<PaginationControl {...defaultProps} currentPage={3} />);
      const prevButton = screen.getByRole("button", { name: /previous page/i });
      const nextButton = screen.getByRole("button", { name: /next page/i });
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it("should mark current page button as active", () => {
      render(<PaginationControl {...defaultProps} currentPage={2} />);
      const currentPageButton = screen.getByRole("button", { name: "Page 2" });
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single page correctly", () => {
      render(<PaginationControl {...defaultProps} totalPages={1} />);
      const prevButton = screen.getByRole("button", { name: /previous page/i });
      const nextButton = screen.getByRole("button", { name: /next page/i });
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it("should handle two pages correctly", () => {
      render(<PaginationControl {...defaultProps} totalPages={2} />);
      expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
    });

    it("should handle many pages with ellipsis", () => {
      render(<PaginationControl {...defaultProps} totalPages={10} />);
      expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Page 10" })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<PaginationControl {...defaultProps} />);
      expect(screen.getByRole("navigation", { name: /pagination/i })).toHaveAttribute(
        "aria-label",
        "Pagination Navigation"
      );
    });

    it("should mark current page in ARIA", () => {
      render(<PaginationControl {...defaultProps} currentPage={3} />);
      expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("should disable buttons with aria-disabled when appropriate", () => {
      render(<PaginationControl {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByRole("button", { name: /previous page/i });
      expect(prevButton).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<PaginationControl {...defaultProps} className="custom-class" />);
      const nav = screen.getByRole("navigation", { name: /pagination/i });
      expect(nav).toHaveClass("custom-class");
    });

    it("should apply disabled prop to all buttons", () => {
      render(<PaginationControl {...defaultProps} disabled />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Page Info Display", () => {
    it("should show correct page info text", () => {
      render(<PaginationControl {...defaultProps} currentPage={3} totalPages={10} />);
      expect(screen.getByText(/page 3 of 10/i)).toBeInTheDocument();
    });

    it("should not show page info when showPageInfo is false", () => {
      render(<PaginationControl {...defaultProps} showPageInfo={false} />);
      expect(screen.queryByText(/page 1 of 5/i)).not.toBeInTheDocument();
    });
  });

  describe("Ellipsis Handling", () => {
    it("should show ellipsis for many pages when on first page", () => {
      render(<PaginationControl {...defaultProps} currentPage={1} totalPages={10} />);
      const ellipsisElements = screen.getAllByText("...");
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it("should show ellipsis for many pages when on last page", () => {
      render(<PaginationControl {...defaultProps} currentPage={10} totalPages={10} />);
      const ellipsisElements = screen.getAllByText("...");
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it("should show ellipsis on both sides for middle pages", () => {
      render(<PaginationControl {...defaultProps} currentPage={5} totalPages={10} />);
      const ellipsisElements = screen.getAllByText("...");
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });
  });
});
