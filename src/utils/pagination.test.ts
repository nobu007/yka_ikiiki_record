/**
 * Tests for pagination utility functions.
 */

import { paginate, getPageForIndex, getPageNumbers } from "./pagination";

describe("paginate", () => {
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  describe("basic pagination", () => {
    it("should return first page with default options", () => {
      const result = paginate(testData);

      expect(result.data).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.totalItems).toBe(12);
      expect(result.pageSize).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should return custom page size", () => {
      const result = paginate(testData, { pageSize: 5 });

      expect(result.data).toEqual([1, 2, 3, 4, 5]);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(3);
      expect(result.pageSize).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should return specific page", () => {
      const result = paginate(testData, { pageSize: 5, page: 2 });

      expect(result.data).toEqual([6, 7, 8, 9, 10]);
      expect(result.currentPage).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("should return last page", () => {
      const result = paginate(testData, { pageSize: 5, page: 3 });

      expect(result.data).toEqual([11, 12]);
      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const result = paginate([], { pageSize: 10 });

      expect(result.data).toEqual([]);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.totalItems).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should handle single item", () => {
      const result = paginate([1], { pageSize: 10 });

      expect(result.data).toEqual([1]);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it("should handle page number exceeding total pages", () => {
      const result = paginate(testData, { pageSize: 5, page: 10 });

      expect(result.currentPage).toBe(3);
      expect(result.data).toEqual([11, 12]);
    });

    it("should handle page number less than 1", () => {
      const result = paginate(testData, { pageSize: 5, page: 0 });

      expect(result.currentPage).toBe(1);
      expect(result.data).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle page size of 1", () => {
      const result = paginate([1, 2, 3], { pageSize: 1, page: 2 });

      expect(result.data).toEqual([2]);
      expect(result.totalPages).toBe(3);
    });

    it("should handle page size larger than array", () => {
      const result = paginate([1, 2, 3], { pageSize: 10 });

      expect(result.data).toEqual([1, 2, 3]);
      expect(result.totalPages).toBe(1);
    });
  });

  describe("type safety", () => {
    it("should work with complex objects", () => {
      interface User {
        id: number;
        name: string;
      }
      const users: User[] = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];

      const result = paginate(users, { pageSize: 2 });

      expect(result.data).toEqual([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
      expect(result.totalPages).toBe(2);
    });

    it("should work with strings", () => {
      const words = ["apple", "banana", "cherry", "date"];
      const result = paginate(words, { pageSize: 2, page: 2 });

      expect(result.data).toEqual(["cherry", "date"]);
    });
  });
});

describe("getPageForIndex", () => {
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  describe("valid indices", () => {
    it("should return page 1 for index 0", () => {
      expect(getPageForIndex(testData, 0, 5)).toBe(1);
    });

    it("should return page 1 for indices 0-4", () => {
      expect(getPageForIndex(testData, 4, 5)).toBe(1);
    });

    it("should return page 2 for index 5", () => {
      expect(getPageForIndex(testData, 5, 5)).toBe(2);
    });

    it("should return last page for last item", () => {
      expect(getPageForIndex(testData, 9, 5)).toBe(2);
    });

    it("should use default page size of 10", () => {
      const data = Array.from({ length: 25 }, (_, i) => i);
      expect(getPageForIndex(data, 15)).toBe(2);
    });
  });

  describe("invalid indices", () => {
    it("should return null for negative index", () => {
      expect(getPageForIndex(testData, -1)).toBeNull();
    });

    it("should return null for index exceeding array length", () => {
      expect(getPageForIndex(testData, 100)).toBeNull();
    });

    it("should return null for index equal to array length", () => {
      expect(getPageForIndex(testData, 10)).toBeNull();
    });
  });
});

describe("getPageNumbers", () => {
  describe("small page counts", () => {
    it("should return all pages when total <= max", () => {
      const result = getPageNumbers(2, 5, 7);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should return all pages for exactly max pages", () => {
      const result = getPageNumbers(3, 7, 7);

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("large page counts with ellipsis", () => {
    it("should show ellipsis at beginning when on later pages", () => {
      const result = getPageNumbers(8, 10, 7);

      expect(result[0]).toBe(1);
      expect(result[1]).toBeNull();
      expect(result[result.length - 1]).toBe(10);
    });

    it("should show ellipsis at end when on early pages", () => {
      const result = getPageNumbers(2, 10, 7);

      expect(result[0]).toBe(1);
      expect(result[result.length - 2]).toBeNull();
      expect(result[result.length - 1]).toBe(10);
    });

    it("should show ellipsis on both sides when in middle", () => {
      const result = getPageNumbers(5, 10, 7);

      expect(result[0]).toBe(1);
      expect(result[1]).toBeNull();
      expect(result[result.length - 2]).toBeNull();
      expect(result[result.length - 1]).toBe(10);
    });
  });

  describe("edge cases", () => {
    it("should handle single page", () => {
      const result = getPageNumbers(1, 1);

      expect(result).toEqual([1]);
    });

    it("should handle current page at start", () => {
      const result = getPageNumbers(1, 10, 7);

      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
      expect(result).toContain(null);
    });

    it("should handle current page at end", () => {
      const result = getPageNumbers(10, 10, 7);

      expect(result[result.length - 1]).toBe(10);
      expect(result[0]).toBe(1);
      expect(result).toContain(null);
    });

    it("should work with custom max pages", () => {
      const result = getPageNumbers(5, 20, 5);

      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(20);
      expect(result).toContain(5);
    });
  });

  describe("pagination control layout", () => {
    it("should include current page in results", () => {
      const result = getPageNumbers(5, 10, 7);

      expect(result).toContain(5);
    });

    it("should always include first and last page", () => {
      const result = getPageNumbers(5, 10, 7);

      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
    });

    it("should place ellipsis correctly for middle page", () => {
      const result = getPageNumbers(5, 10, 7);

      expect(result[1]).toBeNull();
      expect(result[result.length - 2]).toBeNull();
    });
  });
});
