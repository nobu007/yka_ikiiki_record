import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { TrendAnalysisRepository } from "@/domain/repositories/TrendAnalysisRepository";
import { TrendAnalysisService } from "./TrendAnalysisService";
import type {
  StudentTrendAnalysis,
  ClassTrendAnalysis,
} from "@/domain/entities/TrendAnalysis";
import {
  createTrendDataPoint,
  createStudentTrendAnalysis,
  createClassTrendAnalysis,
} from "@/domain/entities/TrendAnalysis";

describe("TrendAnalysisService", () => {
  let mockRepository: TrendAnalysisRepository;
  let trendService: TrendAnalysisService;

  beforeEach(() => {
    mockRepository = {
      saveStudentTrend: jest.fn(),
      saveClassTrend: jest.fn(),
      getStudentTrend: jest.fn(),
      getClassTrend: jest.fn(),
      queryStudentTrends: jest.fn(),
      queryClassTrends: jest.fn(),
      deleteStudentTrend: jest.fn(),
      deleteClassTrend: jest.fn(),
    };
    trendService = new TrendAnalysisService(mockRepository);
  });

  describe("analyzeStudentTrend", () => {
    it("should create student trend analysis from raw records", async () => {
      const studentName = "Alice";
      const records = [
        { date: new Date("2026-03-01"), emotion: 3.5 },
        { date: new Date("2026-03-02"), emotion: 3.7 },
        { date: new Date("2026-03-03"), emotion: 4.0 },
      ];

      const result = await trendService.analyzeStudentTrend(studentName, records);

      expect(result.student).toBe(studentName);
      expect(result.dataPoints).toHaveLength(3);
      expect(result.dataPoints[0].emotion).toBe(3.5);
      expect(result.metrics.averageEmotion).toBeCloseTo(3.73, 1);
      expect(result.metrics.totalRecords).toBe(3);
    });

    it("should aggregate records by date when multiple records exist for same day", async () => {
      const studentName = "Bob";
      const records = [
        { date: new Date("2026-03-01"), emotion: 3.0 },
        { date: new Date("2026-03-01"), emotion: 3.5 },
        { date: new Date("2026-03-01"), emotion: 4.0 },
        { date: new Date("2026-03-02"), emotion: 3.8 },
      ];

      const result = await trendService.analyzeStudentTrend(studentName, records);

      expect(result.dataPoints).toHaveLength(2);
      expect(result.dataPoints[0].recordCount).toBe(3);
      expect(result.dataPoints[0].emotion).toBeCloseTo(3.5, 1);
      expect(result.dataPoints[1].recordCount).toBe(1);
      expect(result.dataPoints[1].emotion).toBe(3.8);
    });

    it("should handle empty records array", async () => {
      await expect(
        trendService.analyzeStudentTrend("Alice", []),
      ).rejects.toThrow("Records array must not be empty");
    });

    it("should sort data points by date ascending", async () => {
      const studentName = "Charlie";
      const records = [
        { date: new Date("2026-03-03"), emotion: 4.0 },
        { date: new Date("2026-03-01"), emotion: 3.0 },
        { date: new Date("2026-03-02"), emotion: 3.5 },
      ];

      const result = await trendService.analyzeStudentTrend(studentName, records);

      expect(result.dataPoints[0].date).toEqual(new Date("2026-03-01"));
      expect(result.dataPoints[1].date).toEqual(new Date("2026-03-02"));
      expect(result.dataPoints[2].date).toEqual(new Date("2026-03-03"));
    });

    it("should calculate correct trend direction", async () => {
      const records = [
        { date: new Date("2026-03-01"), emotion: 3.0 },
        { date: new Date("2026-03-02"), emotion: 3.5 },
        { date: new Date("2026-03-03"), emotion: 4.0 },
      ];

      const result = await trendService.analyzeStudentTrend("Alice", records);

      expect(result.metrics.trendDirection).toBe("up");
    });

    it("should calculate volatility metrics", async () => {
      const records = [
        { date: new Date("2026-03-01"), emotion: 2.0 },
        { date: new Date("2026-03-02"), emotion: 5.0 },
        { date: new Date("2026-03-03"), emotion: 3.5 },
      ];

      const result = await trendService.analyzeStudentTrend("Alice", records);

      expect(result.metrics.volatility).toBeGreaterThan(0);
    });

    it("should handle single record with stable trend direction", async () => {
      const records = [{ date: new Date("2026-03-01"), emotion: 3.5 }];

      const result = await trendService.analyzeStudentTrend("Alice", records);

      expect(result.dataPoints).toHaveLength(1);
      expect(result.metrics.trendDirection).toBe("stable");
      expect(result.metrics.averageEmotion).toBe(3.5);
      expect(result.metrics.totalRecords).toBe(1);
    });
  });

  describe("analyzeClassTrend", () => {
    it("should create class trend analysis from multiple student trends", async () => {
      const studentAnalyses: StudentTrendAnalysis[] = [
        createStudentTrendAnalysis({
          student: "Alice",
          dataPoints: [
            createTrendDataPoint({
              date: new Date("2026-03-01"),
              emotion: 3.5,
              recordCount: 1,
            }),
            createTrendDataPoint({
              date: new Date("2026-03-02"),
              emotion: 3.7,
              recordCount: 1,
            }),
          ],
        }),
        createStudentTrendAnalysis({
          student: "Bob",
          dataPoints: [
            createTrendDataPoint({
              date: new Date("2026-03-01"),
              emotion: 3.2,
              recordCount: 1,
            }),
            createTrendDataPoint({
              date: new Date("2026-03-02"),
              emotion: 3.4,
              recordCount: 1,
            }),
          ],
        }),
      ];

      const result = await trendService.analyzeClassTrend(
        "Class 3-A",
        studentAnalyses,
      );

      expect(result.className).toBe("Class 3-A");
      expect(result.studentAnalyses).toHaveLength(2);
      expect(result.metrics.totalStudents).toBe(2);
      expect(result.metrics.averageEmotion).toBeCloseTo(3.45, 1);
    });

    it("should identify top performers and students needing support", async () => {
      const studentAnalyses: StudentTrendAnalysis[] = [
        createStudentTrendAnalysis({
          student: "Alice",
          dataPoints: [
            createTrendDataPoint({
              date: new Date("2026-03-01"),
              emotion: 4.5,
              recordCount: 1,
            }),
          ],
        }),
        createStudentTrendAnalysis({
          student: "Bob",
          dataPoints: [
            createTrendDataPoint({
              date: new Date("2026-03-01"),
              emotion: 3.0,
              recordCount: 1,
            }),
          ],
        }),
        createStudentTrendAnalysis({
          student: "Charlie",
          dataPoints: [
            createTrendDataPoint({
              date: new Date("2026-03-01"),
              emotion: 3.5,
              recordCount: 1,
            }),
          ],
        }),
      ];

      const result = await trendService.analyzeClassTrend(
        "Class 3-A",
        studentAnalyses,
      );

      expect(result.metrics.topPerformers).toContain("Alice");
      expect(result.metrics.needsSupport).toContain("Bob");
      // Charlie has exactly the class average (3.5), so he's in needsSupport per domain logic (< avg)
      expect(result.metrics.needsSupport).toContain("Charlie");
    });

    it("should handle empty student analyses array", async () => {
      await expect(
        trendService.analyzeClassTrend("Class 3-A", []),
      ).rejects.toThrow("Student analyses array must not be empty");
    });
  });

  describe("calculateMovingAverage", () => {
    it("should calculate moving average with default window size", () => {
      const values = [1, 2, 3, 4, 5];
      const result = trendService.calculateMovingAverage(values);

      expect(result).toEqual([2, 3, 4]);
    });

    it("should calculate moving average with custom window size", () => {
      const values = [1, 2, 3, 4, 5, 6, 7];
      const result = trendService.calculateMovingAverage(values, 4);

      expect(result).toEqual([2.5, 3.5, 4.5, 5.5]);
    });

    it("should return empty array when values length is less than window size", () => {
      const values = [1, 2];
      const result = trendService.calculateMovingAverage(values, 3);

      expect(result).toEqual([]);
    });

    it("should handle window size of 1", () => {
      const values = [1, 2, 3, 4];
      const result = trendService.calculateMovingAverage(values, 1);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should throw error for invalid window size", () => {
      const values = [1, 2, 3];

      expect(() => trendService.calculateMovingAverage(values, 0)).toThrow(
        "Window size must be positive",
      );
      expect(() => trendService.calculateMovingAverage(values, -1)).toThrow(
        "Window size must be positive",
      );
    });
  });

  describe("detectAnomalies", () => {
    it("should detect values outside standard deviation threshold", () => {
      const values = [3.0, 3.2, 3.1, 3.3, 5.0, 3.2, 3.1];
      const anomalies = trendService.detectAnomalies(values, 2);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].value).toBe(5.0);
      expect(anomalies[0].index).toBe(4);
    });

    it("should return empty array when no anomalies detected", () => {
      const values = [3.0, 3.2, 3.1, 3.3, 3.2];
      const anomalies = trendService.detectAnomalies(values, 2);

      expect(anomalies).toEqual([]);
    });

    it("should handle empty array", () => {
      const anomalies = trendService.detectAnomalies([], 2);

      expect(anomalies).toEqual([]);
    });

    it("should allow custom threshold", () => {
      const values = [3.0, 3.2, 3.1, 3.3, 4.0, 3.2];
      const anomaliesStrict = trendService.detectAnomalies(values, 1);
      const anomaliesLenient = trendService.detectAnomalies(values, 3);

      expect(anomaliesStrict.length).toBeGreaterThan(anomaliesLenient.length);
    });

    it("should return empty array for identical values (zero stdDev)", () => {
      const values = [3.5, 3.5, 3.5, 3.5, 3.5];
      const anomalies = trendService.detectAnomalies(values, 2);

      expect(anomalies).toEqual([]);
    });
  });

  describe("calculateTrendCorrelation", () => {
    it("should calculate positive correlation for increasing trends", () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [2, 3, 4, 5, 6];

      const correlation = trendService.calculateTrendCorrelation(series1, series2);

      expect(correlation).toBeCloseTo(1.0, 1);
    });

    it("should calculate negative correlation for opposite trends", () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [5, 4, 3, 2, 1];

      const correlation = trendService.calculateTrendCorrelation(series1, series2);

      expect(correlation).toBeCloseTo(-1.0, 1);
    });

    it("should calculate zero correlation for uncorrelated data", () => {
      const series1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const series2 = [3, 7, 2, 9, 1, 10, 4, 6, 5, 8];

      const correlation = trendService.calculateTrendCorrelation(series1, series2);

      expect(Math.abs(correlation)).toBeLessThan(0.5);
    });

    it("should throw error for mismatched array lengths", () => {
      const series1 = [1, 2, 3];
      const series2 = [1, 2];

      expect(() =>
        trendService.calculateTrendCorrelation(series1, series2),
      ).toThrow("Arrays must have the same length");
    });

    it("should handle empty arrays", () => {
      const series1: number[] = [];
      const series2: number[] = [];

      expect(() =>
        trendService.calculateTrendCorrelation(series1, series2),
      ).toThrow("Arrays must have at least 2 elements");
    });

    it("should return exactly 1.0 for identical series", () => {
      const series = [1, 2, 3, 4, 5];
      const correlation = trendService.calculateTrendCorrelation(series, series);

      expect(correlation).toBe(1.0);
    });

    it("should return exactly -1.0 for perfectly opposite series", () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [-1, -2, -3, -4, -5];

      const correlation = trendService.calculateTrendCorrelation(series1, series2);

      expect(correlation).toBeCloseTo(-1.0, 10);
    });

    it("should handle single element arrays", () => {
      const series1 = [1];
      const series2 = [2];

      expect(() =>
        trendService.calculateTrendCorrelation(series1, series2),
      ).toThrow("Arrays must have at least 2 elements");
    });
  });

  describe("saveStudentTrend", () => {
    it("should save student trend to repository", async () => {
      const analysis: StudentTrendAnalysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-01"),
            emotion: 3.5,
            recordCount: 1,
          }),
        ],
      });

      await trendService.saveStudentTrend(analysis);

      expect(mockRepository.saveStudentTrend).toHaveBeenCalledWith(analysis);
      expect(mockRepository.saveStudentTrend).toHaveBeenCalledTimes(1);
    });

    it("should return saved analysis from repository", async () => {
      const analysis: StudentTrendAnalysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-01"),
            emotion: 3.5,
            recordCount: 1,
          }),
        ],
      });

      (mockRepository.saveStudentTrend as jest.Mock).mockResolvedValue(
        analysis,
      );

      const result = await trendService.saveStudentTrend(analysis);

      expect(result).toEqual(analysis);
    });

    it("should propagate repository errors", async () => {
      const analysis: StudentTrendAnalysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-01"),
            emotion: 3.5,
            recordCount: 1,
          }),
        ],
      });

      const error = new Error("Repository save failed");
      (mockRepository.saveStudentTrend as jest.Mock).mockRejectedValue(error);

      await expect(trendService.saveStudentTrend(analysis)).rejects.toThrow(
        "Repository save failed",
      );
    });
  });

  describe("saveClassTrend", () => {
    it("should save class trend to repository", async () => {
      const analysis: ClassTrendAnalysis = createClassTrendAnalysis({
        className: "Class 3-A",
        studentAnalyses: [
          createStudentTrendAnalysis({
            student: "Alice",
            dataPoints: [
              createTrendDataPoint({
                date: new Date("2026-03-01"),
                emotion: 3.5,
                recordCount: 1,
              }),
            ],
          }),
        ],
      });

      await trendService.saveClassTrend(analysis);

      expect(mockRepository.saveClassTrend).toHaveBeenCalledWith(analysis);
      expect(mockRepository.saveClassTrend).toHaveBeenCalledTimes(1);
    });

    it("should return saved analysis from repository", async () => {
      const analysis: ClassTrendAnalysis = createClassTrendAnalysis({
        className: "Class 3-A",
        studentAnalyses: [
          createStudentTrendAnalysis({
            student: "Alice",
            dataPoints: [
              createTrendDataPoint({
                date: new Date("2026-03-01"),
                emotion: 3.5,
                recordCount: 1,
              }),
            ],
          }),
        ],
      });

      (mockRepository.saveClassTrend as jest.Mock).mockResolvedValue(analysis);

      const result = await trendService.saveClassTrend(analysis);

      expect(result).toEqual(analysis);
    });
  });

  describe("getStudentTrend", () => {
    it("should retrieve student trend from repository", async () => {
      const analysis: StudentTrendAnalysis = createStudentTrendAnalysis({
        student: "Alice",
        dataPoints: [
          createTrendDataPoint({
            date: new Date("2026-03-01"),
            emotion: 3.5,
            recordCount: 1,
          }),
        ],
      });

      (mockRepository.getStudentTrend as jest.Mock).mockResolvedValue(analysis);

      const result = await trendService.getStudentTrend("Alice");

      expect(result).toEqual(analysis);
      expect(mockRepository.getStudentTrend).toHaveBeenCalledWith("Alice");
    });

    it("should return null when student trend not found", async () => {
      (mockRepository.getStudentTrend as jest.Mock).mockResolvedValue(null);

      const result = await trendService.getStudentTrend("NonExistent");

      expect(result).toBeNull();
    });
  });

  describe("getClassTrend", () => {
    it("should retrieve class trend from repository", async () => {
      const analysis: ClassTrendAnalysis = createClassTrendAnalysis({
        className: "Class 3-A",
        studentAnalyses: [
          createStudentTrendAnalysis({
            student: "Alice",
            dataPoints: [
              createTrendDataPoint({
                date: new Date("2026-03-01"),
                emotion: 3.5,
                recordCount: 1,
              }),
            ],
          }),
        ],
      });

      (mockRepository.getClassTrend as jest.Mock).mockResolvedValue(analysis);

      const result = await trendService.getClassTrend("Class 3-A");

      expect(result).toEqual(analysis);
      expect(mockRepository.getClassTrend).toHaveBeenCalledWith("Class 3-A");
    });

    it("should return null when class trend not found", async () => {
      (mockRepository.getClassTrend as jest.Mock).mockResolvedValue(null);

      const result = await trendService.getClassTrend("NonExistent");

      expect(result).toBeNull();
    });
  });
});
