/**
 * useDataGeneration Boundary Value Tests
 *
 * Tests boundary conditions for config updates
 * INV-TEST-001
 */

import { renderHook, act } from "@testing-library/react";
import { useDataGeneration } from "./useDataGeneration";
import { DEFAULT_CONFIG } from "@/domain/entities/DataGeneration";

describe("useDataGeneration - Boundary Values (INV-TEST-001)", () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateStudentCount - boundary conditions", () => {
    it("should enforce minimum student count of 10", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(5);
      });

      expect(result.current.config.studentCount).toBe(10);
    });

    it("should enforce maximum student count of 500", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(600);
      });

      expect(result.current.config.studentCount).toBe(500);
    });

    it("should accept exact minimum value of 10", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(10);
      });

      expect(result.current.config.studentCount).toBe(10);
    });

    it("should accept exact maximum value of 500", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(500);
      });

      expect(result.current.config.studentCount).toBe(500);
    });

    it("should accept value within range (100)", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(100);
      });

      expect(result.current.config.studentCount).toBe(100);
    });
  });

  describe("updatePeriodDays - boundary conditions", () => {
    it("should enforce minimum period days of 7", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updatePeriodDays(3);
      });

      expect(result.current.config.periodDays).toBe(7);
    });

    it("should enforce maximum period days of 365", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updatePeriodDays(400);
      });

      expect(result.current.config.periodDays).toBe(365);
    });

    it("should accept exact minimum value of 7", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updatePeriodDays(7);
      });

      expect(result.current.config.periodDays).toBe(7);
    });

    it("should accept exact maximum value of 365", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updatePeriodDays(365);
      });

      expect(result.current.config.periodDays).toBe(365);
    });

    it("should accept value within range (30)", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updatePeriodDays(30);
      });

      expect(result.current.config.periodDays).toBe(30);
    });
  });

  describe("resetConfig", () => {
    it("should reset to DEFAULT_CONFIG", () => {
      const { result } = renderHook(() =>
        useDataGeneration({ onGenerate: mockOnGenerate }),
      );

      act(() => {
        result.current.updateStudentCount(200);
        result.current.updatePeriodDays(60);
      });

      expect(result.current.config.studentCount).toBe(200);
      expect(result.current.config.periodDays).toBe(60);

      act(() => {
        result.current.resetConfig();
      });

      expect(result.current.config).toEqual(DEFAULT_CONFIG);
    });
  });
});
