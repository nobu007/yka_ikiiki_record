/**
 * Tests for usePagination hook
 */

import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  const mockData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  describe("Initial State", () => {
    it("should initialize with default options", () => {
      const { result } = renderHook(() => usePagination(mockData));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.totalItems).toBe(25);
      expect(result.current.currentPageData).toHaveLength(10);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it("should initialize with custom page size", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 5 })
      );

      expect(result.current.pageSize).toBe(5);
      expect(result.current.totalPages).toBe(5);
      expect(result.current.currentPageData).toHaveLength(5);
    });

    it("should initialize with custom initial page", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 10, initialPage: 2 })
      );

      expect(result.current.currentPage).toBe(2);
      expect(result.current.currentPageData).toEqual(mockData.slice(10, 20));
    });

    it("should handle empty data array", () => {
      const { result } = renderHook(() => usePagination([], { pageSize: 10 }));

      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPageData).toHaveLength(0);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it("should handle data smaller than page size", () => {
      const smallData = mockData.slice(0, 5);
      const { result } = renderHook(() =>
        usePagination(smallData, { pageSize: 10 })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPageData).toHaveLength(5);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  describe("Navigation", () => {
    it("should go to next page", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.currentPageData).toEqual(mockData.slice(10, 20));
    });

    it("should go to previous page", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 10, initialPage: 2 })
      );

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.currentPageData).toEqual(mockData.slice(0, 10));
    });

    it("should not go to next page when on last page", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 10, initialPage: 3 })
      );

      expect(result.current.hasNextPage).toBe(false);

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(3);
    });

    it("should not go to previous page when on first page", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should go to specific page", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
      expect(result.current.currentPageData).toEqual(mockData.slice(20, 25));
    });

    it("should clamp page number to valid range", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      act(() => {
        result.current.goToPage(0);
      });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(100);
      });

      expect(result.current.currentPage).toBe(3);
    });
  });

  describe("Page Size Changes", () => {
    it("should change page size and reset to first page", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 10, initialPage: 2 })
      );

      expect(result.current.currentPage).toBe(2);
      expect(result.current.pageSize).toBe(10);

      act(() => {
        result.current.changePageSize(5);
      });

      expect(result.current.pageSize).toBe(5);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(5);
    });

    it("should enforce minimum page size of 1", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      act(() => {
        result.current.changePageSize(0);
      });

      expect(result.current.pageSize).toBe(1);
      expect(result.current.totalPages).toBe(25);
    });

    it("should handle page size larger than data", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      act(() => {
        result.current.changePageSize(100);
      });

      expect(result.current.pageSize).toBe(100);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPageData).toEqual(mockData);
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe("Reset", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 5, initialPage: 2 })
      );

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.changePageSize(15);
      });

      expect(result.current.pageSize).toBe(15);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.pageSize).toBe(5);
    });
  });

  describe("Data Updates", () => {
    it("should recalculate pagination when data changes", () => {
      const { result, rerender } = renderHook(
        ({ data }) => usePagination(data, { pageSize: 10 }),
        { initialProps: { data: mockData } }
      );

      expect(result.current.totalItems).toBe(25);
      expect(result.current.totalPages).toBe(3);

      const smallerData = mockData.slice(0, 15);
      rerender({ data: smallerData });

      expect(result.current.totalItems).toBe(15);
      expect(result.current.totalPages).toBe(2);
    });

    it("should maintain current page when data grows", () => {
      const { result, rerender } = renderHook(
        ({ data }) => usePagination(data, { pageSize: 10, initialPage: 2 }),
        { initialProps: { data: mockData } }
      );

      expect(result.current.currentPage).toBe(2);

      const largerData = [...mockData, ...mockData];
      rerender({ data: largerData });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.totalPages).toBe(5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single item", () => {
      const singleItem = [{ id: 1, name: "Single" }];
      const { result } = renderHook(() => usePagination(singleItem));

      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPageData).toEqual(singleItem);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it("should handle page size equal to data length", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 25 })
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPageData).toEqual(mockData);
      expect(result.current.hasNextPage).toBe(false);
    });

    it("should handle rapid page changes", () => {
      const { result } = renderHook(() => usePagination(mockData, { pageSize: 10 }));

      act(() => {
        result.current.goToPage(2);
        result.current.goToPage(3);
        result.current.goToPage(1);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.currentPageData).toEqual(mockData.slice(0, 10));
    });

    it("should handle navigation from last page to first page", () => {
      const { result } = renderHook(() =>
        usePagination(mockData, { pageSize: 10, initialPage: 3 })
      );

      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.goToPage(1);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  describe("Type Safety", () => {
    it("should work with complex data types", () => {
      interface ComplexType {
        id: number;
        nested: {
          value: string;
          items: number[];
        };
      }

      const complexData: ComplexType[] = [
        { id: 1, nested: { value: "a", items: [1, 2, 3] } },
        { id: 2, nested: { value: "b", items: [4, 5] } },
      ];

      const { result } = renderHook(() => usePagination(complexData));

      expect(result.current.currentPageData).toEqual(complexData);
      expect(result.current.currentPageData[0].nested.items).toEqual([1, 2, 3]);
    });

    it("should work with readonly arrays", () => {
      const readonlyData = Object.freeze([...mockData]);
      const { result } = renderHook(() => usePagination(readonlyData));

      expect(result.current.totalItems).toBe(25);
    });
  });
});
