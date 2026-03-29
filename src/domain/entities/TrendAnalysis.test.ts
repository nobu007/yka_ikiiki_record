/**
 * Tests for TrendAnalysis domain entity.
 *
 * Tests cover factory functions, validation, type safety, and edge cases
 * for trend analysis data structures used in long-term emotion tracking.
 */

import { describe, it, expect } from "@jest/globals";
import {
  type TrendDataPoint,
  type StudentTrendAnalysis,
  type ClassTrendAnalysis,
  type TrendMetrics,
  type TrendDirection,
  createTrendDataPoint,
  createStudentTrendAnalysis,
  createClassTrendAnalysis,
  calculateTrendDirection,
  calculateMovingAverage,
} from "./TrendAnalysis";

describe("TrendAnalysis", () => {
  describe("createTrendDataPoint", () => {
    it("should create a valid trend data point with all required fields", () => {
      const date = new Date("2026-03-30T12:00:00Z");
      const dataPoint = createTrendDataPoint({
        date,
        emotion: 3.5,
        recordCount: 5,
      });

      expect(dataPoint).toEqual({
        date,
        emotion: 3.5,
        recordCount: 5,
      });
    });

    it("should throw error for emotion below minimum", () => {
      const date = new Date("2026-03-30T12:00:00Z");

      expect(() =>
        createTrendDataPoint({
          date,
          emotion: 0.9,
          recordCount: 5,
        }),
      ).toThrow("Emotion must be between 1 and 5");
    });

    it("should throw error for emotion above maximum", () => {
      const date = new Date("2026-03-30T12:00:00Z");

      expect(() =>
        createTrendDataPoint({
          date,
          emotion: 5.1,
          recordCount: 5,
        }),
      ).toThrow("Emotion must be between 1 and 5");
    });

    it("should throw error for negative record count", () => {
      const date = new Date("2026-03-30T12:00:00Z");

      expect(() =>
        createTrendDataPoint({
          date,
          emotion: 3.5,
          recordCount: -1,
        }),
      ).toThrow("Record count must be non-negative");
    });

    it("should allow zero record count", () => {
      const date = new Date("2026-03-30T12:00:00Z");
      const dataPoint = createTrendDataPoint({
        date,
        emotion: 3.5,
        recordCount: 0,
      });

      expect(dataPoint.recordCount).toBe(0);
    });

    it("should accept integer emotion values", () => {
      const date = new Date("2026-03-30T12:00:00Z");
      const dataPoint = createTrendDataPoint({
        date,
        emotion: 4,
        recordCount: 5,
      });

      expect(dataPoint.emotion).toBe(4);
    });

    it("should accept decimal emotion values", () => {
      const date = new Date("2026-03-30T12:00:00Z");
      const dataPoint = createTrendDataPoint({
        date,
        emotion: 3.7,
        recordCount: 5,
      });

      expect(dataPoint.emotion).toBe(3.7);
    });
  });

  describe("createStudentTrendAnalysis", () => {
    const validDataPoints: TrendDataPoint[] = [
      createTrendDataPoint({
        date: new Date("2026-03-28T12:00:00Z"),
        emotion: 3.2,
        recordCount: 3,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-29T12:00:00Z"),
        emotion: 3.5,
        recordCount: 4,
      }),
      createTrendDataPoint({
        date: new Date("2026-03-30T12:00:00Z"),
        emotion: 3.8,
        recordCount: 5,
      }),
    ];

    it("should create a valid student trend analysis", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.student).toBe("Alice");
      expect(analysis.dataPoints).toEqual(validDataPoints);
      expect(analysis.metrics).toBeDefined();
      expect(analysis.metrics.trendDirection).toBe("up");
    });

    it("should calculate trend direction as up when increasing", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.metrics.trendDirection).toBe("up");
    });

    it("should calculate trend direction as down when decreasing", () => {
      const decreasingPoints: TrendDataPoint[] = [
        createTrendDataPoint({
          date: new Date("2026-03-28T12:00:00Z"),
          emotion: 4.0,
          recordCount: 3,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-29T12:00:00Z"),
          emotion: 3.5,
          recordCount: 4,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-30T12:00:00Z"),
          emotion: 3.0,
          recordCount: 5,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Bob",
        dataPoints: decreasingPoints,
      });

      expect(analysis.metrics.trendDirection).toBe("down");
    });

    it("should calculate trend direction as stable when flat", () => {
      const flatPoints: TrendDataPoint[] = [
        createTrendDataPoint({
          date: new Date("2026-03-28T12:00:00Z"),
          emotion: 3.5,
          recordCount: 3,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-29T12:00:00Z"),
          emotion: 3.5,
          recordCount: 4,
        }),
        createTrendDataPoint({
          date: new Date("2026-03-30T12:00:00Z"),
          emotion: 3.5,
          recordCount: 5,
        }),
      ];

      const analysis = createStudentTrendAnalysis({
        student: "Charlie",
        dataPoints: flatPoints,
      });

      expect(analysis.metrics.trendDirection).toBe("stable");
    });

    it("should calculate average emotion correctly", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.metrics.averageEmotion).toBeCloseTo(3.5, 1);
    });

    it("should calculate start and end emotion correctly", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.metrics.startEmotion).toBe(3.2);
      expect(analysis.metrics.endEmotion).toBe(3.8);
    });

    it("should calculate total record count", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.metrics.totalRecords).toBe(12);
    });

    it("should throw error for empty data points array", () => {
      expect(() =>
        createStudentTrendAnalysis({
          student: "Alice",
          dataPoints: [],
        }),
      ).toThrow("Data points array must not be empty");
    });

    it("should throw error for invalid student name", () => {
      expect(() =>
        createStudentTrendAnalysis({
          student: "",
          dataPoints: validDataPoints,
        }),
      ).toThrow("Student name must not be empty");
    });

    it("should calculate volatility correctly", () => {
      const analysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: validDataPoints,
      });

      expect(analysis.metrics.volatility).toBeGreaterThan(0);
    });
  });

  describe("createClassTrendAnalysis", () => {
    const studentAnalyses: StudentTrendAnalysis[] = [
      createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-28T12:00:00Z"),
            emotion: 3.2,
            recordCount: 3,
          }),
          createTrendDataPoint({
            date: new Date("2026-03-29T12:00:00Z"),
            emotion: 3.5,
            recordCount: 4,
          }),
          createTrendDataPoint({
            date: new Date("2026-03-30T12:00:00Z"),
            emotion: 3.8,
            recordCount: 5,
          }),
        ],
      }),
      createStudentTrendAnalysis({
        student: "Bob",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-28T12:00:00Z"),
            emotion: 2.8,
            recordCount: 2,
          }),
          createTrendDataPoint({
            date: new Date("2026-03-29T12:00:00Z"),
            emotion: 3.0,
            recordCount: 3,
          }),
          createTrendDataPoint({
            date: new Date("2026-03-30T12:00:00Z"),
            emotion: 3.2,
            recordCount: 4,
          }),
        ],
      }),
    ];

    it("should create a valid class trend analysis", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      expect(analysis.className).toBe("Class 1-A");
      expect(analysis.studentAnalyses).toEqual(studentAnalyses);
      expect(analysis.metrics).toBeDefined();
    });

    it("should calculate class average emotion", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      // Average of all emotions: (3.2 + 3.5 + 3.8 + 2.8 + 3.0 + 3.2) / 6 = 19.5 / 6 = 3.25
      expect(analysis.metrics.averageEmotion).toBeCloseTo(3.25, 1);
    });

    it("should calculate total students", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      expect(analysis.metrics.totalStudents).toBe(2);
    });

    it("should calculate class trend direction", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      // First emotion across all students: 3.2, Last emotion: 3.2 (stable)
      expect(analysis.metrics.trendDirection).toBe("stable");
    });

    it("should throw error for empty student analyses array", () => {
      expect(() =>
        createClassTrendAnalysis({
          className: "Class 1-A",
          studentAnalyses: [],
        }),
      ).toThrow("Student analyses array must not be empty");
    });

    it("should throw error for invalid class name", () => {
      expect(() =>
        createClassTrendAnalysis({
          className: "",
          studentAnalyses,
        }),
      ).toThrow("Class name must not be empty");
    });

    it("should calculate class volatility correctly", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      expect(analysis.metrics.volatility).toBeGreaterThan(0);
    });

    it("should identify top performing students", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      expect(analysis.metrics.topPerformers).toHaveLength(1);
      expect(analysis.metrics.topPerformers[0]).toBe("Alice");
    });

    it("should identify students needing support", () => {
      const analysis = createClassTrendAnalysis({
        className: "Class 1-A",
        studentAnalyses,
      });

      expect(analysis.metrics.needsSupport).toHaveLength(1);
      expect(analysis.metrics.needsSupport[0]).toBe("Bob");
    });
  });

  describe("calculateTrendDirection", () => {
    it("should return 'up' for positive trend", () => {
      const result = calculateTrendDirection([3.0, 3.5, 4.0]);
      expect(result).toBe("up");
    });

    it("should return 'down' for negative trend", () => {
      const result = calculateTrendDirection([4.0, 3.5, 3.0]);
      expect(result).toBe("down");
    });

    it("should return 'stable' for flat trend", () => {
      const result = calculateTrendDirection([3.5, 3.5, 3.5]);
      expect(result).toBe("stable");
    });

    it("should handle single data point", () => {
      const result = calculateTrendDirection([3.5]);
      expect(result).toBe("stable");
    });

    it("should handle small fluctuations as stable", () => {
      const result = calculateTrendDirection([3.5, 3.6, 3.5]);
      expect(result).toBe("stable");
    });
  });

  describe("calculateMovingAverage", () => {
    it("should calculate simple moving average", () => {
      const result = calculateMovingAverage([3.0, 3.5, 4.0, 4.5, 5.0], 3);
      expect(result).toEqual([3.5, 4.0, 4.5]);
    });

    it("should return empty array for insufficient data", () => {
      const result = calculateMovingAverage([3.0, 3.5], 3);
      expect(result).toEqual([]);
    });

    it("should handle window size of 1", () => {
      const result = calculateMovingAverage([3.0, 3.5, 4.0], 1);
      expect(result).toEqual([3.0, 3.5, 4.0]);
    });

    it("should handle decimal values", () => {
      const result = calculateMovingAverage([3.3, 3.7, 4.0], 2);
      expect(result).toEqual([3.5, 3.85]);
    });

    it("should throw error for invalid window size", () => {
      expect(() => calculateMovingAverage([3.0, 3.5], 0)).toThrow(
        "Window size must be positive",
      );
    });
  });

  describe("TrendDirection type", () => {
    it("should only allow valid trend directions", () => {
      const validDirections: TrendDirection[] = ["up", "down", "stable"];
      expect(validDirections).toHaveLength(3);

      const invalidDirection: TrendDirection = "up" as "up" | "down" | "stable";
      expect(invalidDirection).toBe("up");
    });
  });

  describe("TrendMetrics type", () => {
    it("should contain all required fields", () => {
      const metrics: TrendMetrics = {
        trendDirection: "up",
        averageEmotion: 3.5,
        startEmotion: 3.0,
        endEmotion: 4.0,
        volatility: 0.5,
      };

      expect(metrics.trendDirection).toBe("up");
      expect(metrics.averageEmotion).toBe(3.5);
      expect(metrics.startEmotion).toBe(3.0);
      expect(metrics.endEmotion).toBe(4.0);
      expect(metrics.volatility).toBe(0.5);
    });
  });

  describe("Type safety", () => {
    it("should enforce type constraints on TrendDataPoint", () => {
      const date = new Date();
      const dataPoint: TrendDataPoint = {
        date,
        emotion: 3.5,
        recordCount: 5,
      };

      expect(typeof dataPoint.date).toBe("object");
      expect(typeof dataPoint.emotion).toBe("number");
      expect(typeof dataPoint.recordCount).toBe("number");
    });

    it("should enforce type constraints on StudentTrendAnalysis", () => {
      const analysis: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
        },
      };

      expect(typeof analysis.student).toBe("string");
      expect(Array.isArray(analysis.dataPoints)).toBe(true);
      expect(typeof analysis.metrics).toBe("object");
    });

    it("should enforce type constraints on ClassTrendAnalysis", () => {
      const analysis: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
        },
      };

      expect(typeof analysis.className).toBe("string");
      expect(Array.isArray(analysis.studentAnalyses)).toBe(true);
      expect(typeof analysis.metrics).toBe("object");
    });
  });

  describe("Edge cases", () => {
    it("should handle extreme emotion values", () => {
      const dataPoint = createTrendDataPoint({
        date: new Date("2026-03-30T12:00:00Z"),
        emotion: 1.0,
        recordCount: 1,
      });

      expect(dataPoint.emotion).toBe(1.0);

      const dataPoint2 = createTrendDataPoint({
        date: new Date("2026-03-30T12:00:00Z"),
        emotion: 5.0,
        recordCount: 1,
      });

      expect(dataPoint2.emotion).toBe(5.0);
    });

    it("should handle large record counts", () => {
      const dataPoint = createTrendDataPoint({
        date: new Date("2026-03-30T12:00:00Z"),
        emotion: 3.5,
        recordCount: 1000000,
      });

      expect(dataPoint.recordCount).toBe(1000000);
    });

    it("should handle many data points in analysis", () => {
      const manyDataPoints: TrendDataPoint[] = Array.from(
        { length: 365 },
        (_, i) =>
          createTrendDataPoint({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
            emotion: 3.0 + Math.random() * 2,
            recordCount: Math.floor(Math.random() * 10) + 1,
          }),
      );

      const analysis = createStudentTrendAnalysis({
        student: "LongTermStudent",
        dataPoints: manyDataPoints,
      });

      expect(analysis.dataPoints).toHaveLength(365);
      expect(analysis.metrics.totalRecords).toBeGreaterThan(0);
    });
  });
});
