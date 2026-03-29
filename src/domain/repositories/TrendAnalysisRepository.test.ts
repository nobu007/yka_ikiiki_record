/**
 * Tests for TrendAnalysisRepository interface.
 *
 * Tests verify the contract that all TrendAnalysisRepository implementations
 * must satisfy, including query options, result types, and error handling.
 */

import { describe, it, expect } from "@jest/globals";
import type {
  TrendAnalysisQuery,
  TrendAnalysisQueryResult,
  TrendAnalysisRepository,
  TrendAggregationPeriod,
} from "./TrendAnalysisRepository";
import type {
  StudentTrendAnalysis,
  ClassTrendAnalysis,
} from "../entities/TrendAnalysis";

class MockTrendAnalysisRepository implements TrendAnalysisRepository {
  private studentAnalyses: Map<string, StudentTrendAnalysis> = new Map();
  private classAnalyses: Map<string, ClassTrendAnalysis> = new Map();

  async saveStudentTrend(
    analysis: StudentTrendAnalysis,
  ): Promise<StudentTrendAnalysis> {
    this.studentAnalyses.set(analysis.student, analysis);
    return analysis;
  }

  async saveClassTrend(
    analysis: ClassTrendAnalysis,
  ): Promise<ClassTrendAnalysis> {
    this.classAnalyses.set(analysis.className, analysis);
    return analysis;
  }

  async getStudentTrend(student: string): Promise<StudentTrendAnalysis | null> {
    return this.studentAnalyses.get(student) ?? null;
  }

  async getClassTrend(
    className: string,
  ): Promise<ClassTrendAnalysis | null> {
    return this.classAnalyses.get(className) ?? null;
  }

  async queryStudentTrends(
    query: TrendAnalysisQuery,
  ): Promise<TrendAnalysisQueryResult<StudentTrendAnalysis>> {
    let results = Array.from(this.studentAnalyses.values());

    if (query.studentName !== undefined) {
      results = results.filter((a) => a.student === query.studentName);
    }

    if (query.trendDirection !== undefined) {
      results = results.filter(
        (a) => a.metrics.trendDirection === query.trendDirection,
      );
    }

    const start = query.offset ?? 0;
    const end = query.limit !== undefined ? start + query.limit : results.length;
    const paginatedResults = results.slice(start, end);

    return {
      analyses: paginatedResults,
      totalCount: results.length,
    };
  }

  async queryClassTrends(
    query: TrendAnalysisQuery,
  ): Promise<TrendAnalysisQueryResult<ClassTrendAnalysis>> {
    let results = Array.from(this.classAnalyses.values());

    if (query.className !== undefined) {
      results = results.filter((a) => a.className === query.className);
    }

    if (query.trendDirection !== undefined) {
      results = results.filter(
        (a) => a.metrics.trendDirection === query.trendDirection,
      );
    }

    const start = query.offset ?? 0;
    const end = query.limit !== undefined ? start + query.limit : results.length;
    const paginatedResults = results.slice(start, end);

    return {
      analyses: paginatedResults,
      totalCount: results.length,
    };
  }

  async deleteStudentTrend(student: string): Promise<boolean> {
    return this.studentAnalyses.delete(student);
  }

  async deleteClassTrend(className: string): Promise<boolean> {
    return this.classAnalyses.delete(className);
  }
}

describe("TrendAnalysisRepository", () => {
  describe("Repository contract", () => {
    it("should define all required methods", () => {
      const repository = new MockTrendAnalysisRepository();

      expect(typeof repository.saveStudentTrend).toBe("function");
      expect(typeof repository.saveClassTrend).toBe("function");
      expect(typeof repository.getStudentTrend).toBe("function");
      expect(typeof repository.getClassTrend).toBe("function");
      expect(typeof repository.queryStudentTrends).toBe("function");
      expect(typeof repository.queryClassTrends).toBe("function");
      expect(typeof repository.deleteStudentTrend).toBe("function");
      expect(typeof repository.deleteClassTrend).toBe("function");
    });

    it("should return promises from all methods", async () => {
      const repository = new MockTrendAnalysisRepository();

      const saveResult = repository.saveStudentTrend({
        student: "Test",
        dataPoints: [],
        metrics: {
          trendDirection: "stable",
          averageEmotion: 3.0,
          startEmotion: 3.0,
          endEmotion: 3.0,
          volatility: 0.0,
          totalRecords: 0,
        },
      });
      expect(saveResult).toBeInstanceOf(Promise);

      const getResult = repository.getStudentTrend("Test");
      expect(getResult).toBeInstanceOf(Promise);

      const queryResult = repository.queryStudentTrends({});
      expect(queryResult).toBeInstanceOf(Promise);

      const deleteResult = repository.deleteStudentTrend("Test");
      expect(deleteResult).toBeInstanceOf(Promise);
    });
  });

  describe("saveStudentTrend", () => {
    it("should save a student trend analysis", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      const result = await repository.saveStudentTrend(analysis);

      expect(result).toEqual(analysis);
    });

    it("should return the saved analysis", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: StudentTrendAnalysis = {
        student: "Bob",
        dataPoints: [],
        metrics: {
          trendDirection: "stable",
          averageEmotion: 3.0,
          startEmotion: 3.0,
          endEmotion: 3.0,
          volatility: 0.0,
          totalRecords: 5,
        },
      };

      const result = await repository.saveStudentTrend(analysis);

      expect(result.student).toBe("Bob");
    });
  });

  describe("saveClassTrend", () => {
    it("should save a class trend analysis", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalStudents: 20,
          topPerformers: ["Alice", "Bob"],
          needsSupport: ["Charlie"],
        },
      };

      const result = await repository.saveClassTrend(analysis);

      expect(result).toEqual(analysis);
    });

    it("should return the saved analysis", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: ClassTrendAnalysis = {
        className: "Class 1-B",
        studentAnalyses: [],
        metrics: {
          trendDirection: "down",
          averageEmotion: 2.5,
          startEmotion: 3.0,
          endEmotion: 2.0,
          volatility: 0.3,
          totalStudents: 15,
          topPerformers: ["Diana"],
          needsSupport: ["Eve", "Frank"],
        },
      };

      const result = await repository.saveClassTrend(analysis);

      expect(result.className).toBe("Class 1-B");
    });
  });

  describe("getStudentTrend", () => {
    it("should return null for non-existent student", async () => {
      const repository = new MockTrendAnalysisRepository();

      const result = await repository.getStudentTrend("NonExistent");

      expect(result).toBeNull();
    });

    it("should return the analysis for existing student", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      await repository.saveStudentTrend(analysis);
      const result = await repository.getStudentTrend("Alice");

      expect(result).toEqual(analysis);
    });
  });

  describe("getClassTrend", () => {
    it("should return null for non-existent class", async () => {
      const repository = new MockTrendAnalysisRepository();

      const result = await repository.getClassTrend("NonExistent");

      expect(result).toBeNull();
    });

    it("should return the analysis for existing class", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalStudents: 20,
          topPerformers: ["Alice"],
          needsSupport: [],
        },
      };

      await repository.saveClassTrend(analysis);
      const result = await repository.getClassTrend("Class 1-A");

      expect(result).toEqual(analysis);
    });
  });

  describe("queryStudentTrends", () => {
    it("should return all student trends when no query options provided", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis1: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      const analysis2: StudentTrendAnalysis = {
        student: "Bob",
        dataPoints: [],
        metrics: {
          trendDirection: "down",
          averageEmotion: 2.5,
          startEmotion: 3.0,
          endEmotion: 2.0,
          volatility: 0.3,
          totalRecords: 8,
        },
      };

      await repository.saveStudentTrend(analysis1);
      await repository.saveStudentTrend(analysis2);

      const result = await repository.queryStudentTrends({});

      expect(result.analyses).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it("should filter by student name", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis1: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      const analysis2: StudentTrendAnalysis = {
        student: "Bob",
        dataPoints: [],
        metrics: {
          trendDirection: "down",
          averageEmotion: 2.5,
          startEmotion: 3.0,
          endEmotion: 2.0,
          volatility: 0.3,
          totalRecords: 8,
        },
      };

      await repository.saveStudentTrend(analysis1);
      await repository.saveStudentTrend(analysis2);

      const result = await repository.queryStudentTrends({
        studentName: "Alice",
      });

      expect(result.analyses).toHaveLength(1);
      expect(result.analyses[0]?.student).toBe("Alice");
      expect(result.totalCount).toBe(1);
    });

    it("should filter by trend direction", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis1: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      const analysis2: StudentTrendAnalysis = {
        student: "Bob",
        dataPoints: [],
        metrics: {
          trendDirection: "down",
          averageEmotion: 2.5,
          startEmotion: 3.0,
          endEmotion: 2.0,
          volatility: 0.3,
          totalRecords: 8,
        },
      };

      await repository.saveStudentTrend(analysis1);
      await repository.saveStudentTrend(analysis2);

      const result = await repository.queryStudentTrends({
        trendDirection: "up",
      });

      expect(result.analyses).toHaveLength(1);
      expect(result.analyses[0]?.metrics.trendDirection).toBe("up");
      expect(result.totalCount).toBe(1);
    });

    it("should apply limit and offset", async () => {
      const repository = new MockTrendAnalysisRepository();

      for (let i = 0; i < 5; i++) {
        const analysis: StudentTrendAnalysis = {
          student: `Student${i}`,
          dataPoints: [],
          metrics: {
            trendDirection: "stable",
            averageEmotion: 3.0,
            startEmotion: 3.0,
            endEmotion: 3.0,
            volatility: 0.0,
            totalRecords: 5,
          },
        };

        await repository.saveStudentTrend(analysis);
      }

      const result = await repository.queryStudentTrends({
        limit: 2,
        offset: 1,
      });

      expect(result.analyses).toHaveLength(2);
      expect(result.totalCount).toBe(5);
    });
  });

  describe("queryClassTrends", () => {
    it("should return all class trends when no query options provided", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis1: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalStudents: 20,
          topPerformers: ["Alice"],
          needsSupport: [],
        },
      };

      const analysis2: ClassTrendAnalysis = {
        className: "Class 1-B",
        studentAnalyses: [],
        metrics: {
          trendDirection: "down",
          averageEmotion: 2.5,
          startEmotion: 3.0,
          endEmotion: 2.0,
          volatility: 0.3,
          totalStudents: 15,
          topPerformers: [],
          needsSupport: ["Bob"],
        },
      };

      await repository.saveClassTrend(analysis1);
      await repository.saveClassTrend(analysis2);

      const result = await repository.queryClassTrends({});

      expect(result.analyses).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it("should filter by class name", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis1: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalStudents: 20,
          topPerformers: [],
          needsSupport: [],
        },
      };

      const analysis2: ClassTrendAnalysis = {
        className: "Class 1-B",
        studentAnalyses: [],
        metrics: {
          trendDirection: "stable",
          averageEmotion: 3.0,
          startEmotion: 3.0,
          endEmotion: 3.0,
          volatility: 0.0,
          totalStudents: 18,
          topPerformers: [],
          needsSupport: [],
        },
      };

      await repository.saveClassTrend(analysis1);
      await repository.saveClassTrend(analysis2);

      const result = await repository.queryClassTrends({
        className: "Class 1-A",
      });

      expect(result.analyses).toHaveLength(1);
      expect(result.analyses[0]?.className).toBe("Class 1-A");
      expect(result.totalCount).toBe(1);
    });
  });

  describe("deleteStudentTrend", () => {
    it("should delete existing student trend", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: StudentTrendAnalysis = {
        student: "Alice",
        dataPoints: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalRecords: 10,
        },
      };

      await repository.saveStudentTrend(analysis);
      const deleted = await repository.deleteStudentTrend("Alice");

      expect(deleted).toBe(true);

      const result = await repository.getStudentTrend("Alice");
      expect(result).toBeNull();
    });

    it("should return false for non-existent student", async () => {
      const repository = new MockTrendAnalysisRepository();

      const deleted = await repository.deleteStudentTrend("NonExistent");

      expect(deleted).toBe(false);
    });
  });

  describe("deleteClassTrend", () => {
    it("should delete existing class trend", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analysis: ClassTrendAnalysis = {
        className: "Class 1-A",
        studentAnalyses: [],
        metrics: {
          trendDirection: "up",
          averageEmotion: 3.5,
          startEmotion: 3.0,
          endEmotion: 4.0,
          volatility: 0.5,
          totalStudents: 20,
          topPerformers: [],
          needsSupport: [],
        },
      };

      await repository.saveClassTrend(analysis);
      const deleted = await repository.deleteClassTrend("Class 1-A");

      expect(deleted).toBe(true);

      const result = await repository.getClassTrend("Class 1-A");
      expect(result).toBeNull();
    });

    it("should return false for non-existent class", async () => {
      const repository = new MockTrendAnalysisRepository();

      const deleted = await repository.deleteClassTrend("NonExistent");

      expect(deleted).toBe(false);
    });
  });

  describe("TrendAggregationPeriod type", () => {
    it("should only allow valid aggregation periods", () => {
      const validPeriods: TrendAggregationPeriod[] = [
        "daily",
        "weekly",
        "monthly",
        "semester",
        "yearly",
      ];

      expect(validPeriods).toHaveLength(5);
    });
  });

  describe("TrendAnalysisQuery type", () => {
    it("should accept optional query parameters", () => {
      const query1: TrendAnalysisQuery = {};

      const query2: TrendAnalysisQuery = {
        studentName: "Alice",
        trendDirection: "up",
        limit: 10,
        offset: 0,
      };

      expect(query1).toBeDefined();
      expect(query2).toBeDefined();
    });
  });

  describe("TrendAnalysisQueryResult type", () => {
    it("should contain analyses array and total count", () => {
      const result: TrendAnalysisQueryResult<StudentTrendAnalysis> = {
        analyses: [],
        totalCount: 0,
      };

      expect(Array.isArray(result.analyses)).toBe(true);
      expect(typeof result.totalCount).toBe("number");
    });
  });

  describe("Type safety", () => {
    it("should enforce generic type constraint on query result", () => {
      const studentResult: TrendAnalysisQueryResult<StudentTrendAnalysis> = {
        analyses: [],
        totalCount: 0,
      };

      const classResult: TrendAnalysisQueryResult<ClassTrendAnalysis> = {
        analyses: [],
        totalCount: 0,
      };

      expect(studentResult).toBeDefined();
      expect(classResult).toBeDefined();
    });
  });

  describe("Error handling", () => {
    it("should handle concurrent save operations", async () => {
      const repository = new MockTrendAnalysisRepository();

      const analyses: StudentTrendAnalysis[] = Array.from({ length: 10 }, (_, i) => ({
        student: `Student${i}`,
        dataPoints: [],
        metrics: {
          trendDirection: "stable",
          averageEmotion: 3.0,
          startEmotion: 3.0,
          endEmotion: 3.0,
          volatility: 0.0,
          totalRecords: 5,
        },
      }));

      const promises = analyses.map((analysis) =>
        repository.saveStudentTrend(analysis),
      );

      await Promise.all(promises);

      const result = await repository.queryStudentTrends({});
      expect(result.totalCount).toBe(10);
    });
  });
});
