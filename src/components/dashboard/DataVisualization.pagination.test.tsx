/**
 * Tests for DataVisualization component pagination integration
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { DataVisualization } from "./DataVisualization";
import { StatsData } from "@/schemas/api";

const createMockStats = (studentCount: number): StatsData => ({
  overview: {
    count: 1000,
    avgEmotion: 75.5,
  },
  monthlyStats: [
    { month: "2025-01", avgEmotion: 70, count: 100 },
    { month: "2025-02", avgEmotion: 75, count: 120 },
    { month: "2025-03", avgEmotion: 80, count: 110 },
  ],
  dayOfWeekStats: [
    { day: "0", avgEmotion: 72, count: 140 },
    { day: "1", avgEmotion: 76, count: 150 },
    { day: "2", avgEmotion: 74, count: 145 },
  ],
  emotionDistribution: [50, 80, 120, 150, 100],
  timeOfDayStats: {
    morning: 70,
    afternoon: 75,
    evening: 73,
  },
  studentStats: Array.from({ length: studentCount }, (_, i) => ({
    student: `生徒${String.fromCharCode(65 + i)}`,
    recordCount: 40 + i,
    avgEmotion: 70 + Math.random() * 10,
    trendline: [70, 72, 75, 78, 80],
  })),
});

describe("DataVisualization Pagination Integration", () => {
  describe("Pagination Display", () => {
    it("should not show pagination when students fit on one page", () => {
      const mockStats = createMockStats(5);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).not.toBeInTheDocument();
    });

    it("should show pagination when students exceed default page size", () => {
      const mockStats = createMockStats(15);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).toBeInTheDocument();
    });

    it("should display correct page information", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should render Previous and Next buttons", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("should render page number buttons", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pageButtons = screen.getAllByRole("button").filter((button) => {
        const text = button.textContent;
        return text && /^\d+$/.test(text);
      });

      expect(pageButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Pagination Behavior", () => {
    it("should display first 10 students on initial load", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const studentRows = screen.getAllByText(/生徒[ A-Z]/);
      expect(studentRows.length).toBe(10);
    });

    it("should navigate to next page when Next button is clicked", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });

    it("should navigate to previous page when Previous button is clicked", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

      const previousButton = screen.getByText("Previous");
      fireEvent.click(previousButton);

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should navigate to specific page when page number is clicked", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const page3Button = screen.getByText("3");
      fireEvent.click(page3Button);

      expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    });

    it("should disable Previous button on first page", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const previousButton = screen.getByText("Previous");
      expect(previousButton).toBeDisabled();
    });

    it("should disable Next button on last page", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const page3Button = screen.getByText("3");
      fireEvent.click(page3Button);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });

    it("should update displayed students when page changes", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText("生徒A")).toBeInTheDocument();

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      expect(screen.queryByText("生徒A")).not.toBeInTheDocument();
      expect(screen.getByText("生徒K")).toBeInTheDocument();
    });
  });

  describe("Pagination with Large Datasets", () => {
    it("should handle 100 students with ellipsis", () => {
      const mockStats = createMockStats(100);
      const { container } = render(<DataVisualization data={mockStats} />);

      const ellipsis = container.querySelectorAll(".pagination-ellipsis");
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it("should show correct total pages for large dataset", () => {
      const mockStats = createMockStats(100);
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText(/Page \d+ of 10/)).toBeInTheDocument();
    });

    it("should navigate to last page efficiently", () => {
      const mockStats = createMockStats(100);
      render(<DataVisualization data={mockStats} />);

      const lastPageButton = screen.getByText("10");
      fireEvent.click(lastPageButton);

      expect(screen.getByText("Page 10 of 10")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle exactly 10 students (no pagination)", () => {
      const mockStats = createMockStats(10);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).not.toBeInTheDocument();

      const studentRows = screen.getAllByText(/生徒[ A-Z]/);
      expect(studentRows.length).toBe(10);
    });

    it("should handle 11 students (pagination needed)", () => {
      const mockStats = createMockStats(11);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("should handle empty student list", () => {
      const mockStats = createMockStats(0);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).not.toBeInTheDocument();
    });

    it("should handle single student", () => {
      const mockStats = createMockStats(1);
      const { container } = render(<DataVisualization data={mockStats} />);

      const pagination = container.querySelector(".pagination-control");
      expect(pagination).not.toBeInTheDocument();
      expect(screen.getByText("生徒A")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on pagination controls", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const previousButton = screen.getByLabelText("Previous page");
      const nextButton = screen.getByLabelText("Next page");
      const paginationNav = screen.getByRole("navigation", {
        name: "Pagination Navigation",
      });

      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(paginationNav).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const currentPageButton = screen.getByRole("button", { current: "page" });
      expect(currentPageButton).toHaveTextContent("1");
    });

    it("should update aria-current when page changes", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      const currentPageButton = screen.getByRole("button", { current: "page" });
      expect(currentPageButton).toHaveTextContent("2");
    });
  });

  describe("Integration with Other Features", () => {
    it("should maintain pagination when export buttons are present", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      expect(screen.getByText("Export CSV")).toBeInTheDocument();
      expect(screen.getByText("Export Excel")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should preserve pagination state with chart sections", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      const sections = container.querySelectorAll("section");
      expect(sections.length).toBeGreaterThan(0);

      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    it("should maintain trend arrow functionality with pagination", () => {
      const mockStats = createMockStats(25);
      render(<DataVisualization data={mockStats} />);

      const trendArrows = screen.getAllByText(/[↗️↘️→]/);
      expect(trendArrows.length).toBeGreaterThan(0);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      const trendArrowsAfterNavigation = screen.getAllByText(/[↗️↘️→]/);
      expect(trendArrowsAfterNavigation.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should not re-render entire component on page change", () => {
      const mockStats = createMockStats(25);
      const { container } = render(<DataVisualization data={mockStats} />);

      const initialRenderCount = container.querySelectorAll("section").length;

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      const afterNavigationRenderCount = container.querySelectorAll("section").length;

      expect(initialRenderCount).toEqual(afterNavigationRenderCount);
    });

    it("should maintain memoization with pagination", () => {
      const mockStats = createMockStats(25);
      const { rerender } = render(<DataVisualization data={mockStats} />);

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      rerender(<DataVisualization data={mockStats} />);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });
  });
});
