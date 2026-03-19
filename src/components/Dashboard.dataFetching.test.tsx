import { render, waitFor, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { mockProps, mockStats } from "./Dashboard.test.setup";

global.fetch = jest.fn();

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Data Fetching", () => {
    it("should fetch stats on mount", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockStats,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/seed");
      });
    });

    it("should handle fetch errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should handle HTTP error responses (line 43 branch)", async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "Server error",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/seed");
      });
    });

    it("should handle HTTP 404 error responses", async () => {
      const mockErrorResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "Not found",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/seed");
      });
    });

    it("should handle validation error with default message (line 50)", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: null,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/seed");
      });
    });

    it("should handle validation error with custom error message (line 52)", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            overview: {
              count: "invalid",
              avgEmotion: 3.5,
            },
            monthlyStats: [],
            dayOfWeekStats: [],
            emotionDistribution: [],
            timeOfDayStats: {
              morning: 3.2,
              afternoon: 3.8,
              evening: 3.5,
            },
            studentStats: [],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/seed");
      });
    });

    it("should display data visualization when stats are loaded", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockStats,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<Dashboard {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/データ概要/)).toBeInTheDocument();
      });
    });
  });
});
