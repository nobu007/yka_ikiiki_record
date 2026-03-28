import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportButton } from "./ExportButton";
import { API_ENDPOINTS } from "@/lib/constants/api";

jest.mock("@/lib/error-handler", () => ({
  logError: jest.fn(),
  normalizeError: jest.fn((error) => error),
}));

global.fetch = jest.fn();

describe("ExportButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("CSV Export", () => {
    it("should render CSV export button", () => {
      render(<ExportButton format="csv" />);
      expect(screen.getByRole("button", { name: /download as csv/i })).toBeInTheDocument();
    });

    it("should download CSV file on click", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_ENDPOINTS.EXPORT}?format=csv`,
          expect.objectContaining({ method: "GET" })
        );
      });
    });

    it("should show loading state during export", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                blob: async () => mockBlob,
              });
            }, 100);
          })
      );

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/exporting/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Excel Export", () => {
    it("should render Excel export button", () => {
      render(<ExportButton format="xlsx" />);
      expect(screen.getByRole("button", { name: /download as excel/i })).toBeInTheDocument();
    });

    it("should download Excel file on click", async () => {
      const mockBlob = new Blob(["excel,data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      render(<ExportButton format="xlsx" />);

      const button = screen.getByRole("button", { name: /download as excel/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_ENDPOINTS.EXPORT}?format=xlsx`,
          expect.objectContaining({ method: "GET" })
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors gracefully", async () => {
      const { logError } = require("@/lib/error-handler");
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(logError).toHaveBeenCalled();
        expect(button).not.toBeDisabled();
      });
    });

    it("should handle HTTP error responses", async () => {
      const { logError } = require("@/lib/error-handler");
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(logError).toHaveBeenCalled();
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Props", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<ExportButton format="csv" disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should apply custom className", () => {
      render(<ExportButton format="csv" className="custom-class" />);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("File Download Mechanics", () => {
    it("should create temporary anchor element for download", async () => {
      const createElementSpy = jest.spyOn(document, "createElement");
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_ENDPOINTS.EXPORT}?format=csv`,
          expect.objectContaining({ method: "GET" })
        );
      });

      createElementSpy.mockRestore();
    });

    it("should cleanup temporary anchor and blob URL", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      render(<ExportButton format="csv" />);

      const button = screen.getByRole("button", { name: /download as csv/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      });
    });

    it("should use correct file extension for Excel", async () => {
      const mockBlob = new Blob(["excel,data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      render(<ExportButton format="xlsx" />);

      const button = screen.getByRole("button", { name: /download as excel/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_ENDPOINTS.EXPORT}?format=xlsx`,
          expect.objectContaining({ method: "GET" })
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-label", () => {
      render(<ExportButton format="csv" />);
      expect(screen.getByRole("button", { name: /download as csv/i })).toHaveAttribute(
        "aria-label",
        "Download as CSV"
      );
    });

    it("should have proper aria-label for Excel", () => {
      render(<ExportButton format="xlsx" />);
      expect(screen.getByRole("button", { name: /download as excel/i })).toHaveAttribute(
        "aria-label",
        "Download as Excel"
      );
    });
  });
});
