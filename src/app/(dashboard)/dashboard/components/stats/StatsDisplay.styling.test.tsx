import {
  mockData,
  createMockOnRetry,
  renderStatsDisplay,
} from "./StatsDisplay.test.setup";

describe("StatsDisplay - Styling and Structure", () => {
  let mockOnRetry: ReturnType<typeof createMockOnRetry>;

  beforeEach(() => {
    mockOnRetry = createMockOnRetry();
  });

  describe("dark mode styling", () => {
    it("should apply light mode styles when isDark is false", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false,
      });

      const statsCards = document.querySelectorAll(".bg-white");
      expect(statsCards.length).toBeGreaterThan(0);
    });

    it("should apply dark mode styles when isDark is true", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: true,
      });

      const statsCards = document.querySelectorAll(".bg-gray-800");
      expect(statsCards.length).toBeGreaterThan(0);
    });

    it("should apply correct text colors in light mode", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false,
      });

      const grayText = document.querySelectorAll(".text-gray-500");
      expect(grayText.length).toBeGreaterThan(0);

      const grayHeading = document.querySelectorAll(".text-gray-900");
      expect(grayHeading.length).toBeGreaterThan(0);
    });

    it("should apply correct text colors in dark mode", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: true,
      });

      const grayText = document.querySelectorAll(".text-gray-200");
      expect(grayText.length).toBeGreaterThan(0);

      const whiteHeading = document.querySelectorAll(".text-white");
      expect(whiteHeading.length).toBeGreaterThan(0);
    });
  });

  describe("component structure", () => {
    it("should render cards with shadow classes", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false,
      });

      const shadowElements = document.querySelectorAll(".shadow");
      expect(shadowElements.length).toBeGreaterThan(0);
    });

    it("should render cards with rounded corners", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false,
      });

      const roundedElements = document.querySelectorAll(".rounded-lg");
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it("should render cards with transition classes", () => {
      renderStatsDisplay({
        data: mockData,
        isLoading: false,
        error: null,
        onRetry: mockOnRetry,
        isDark: false,
      });

      const transitionElements =
        document.querySelectorAll(".transition-colors");
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });
});
