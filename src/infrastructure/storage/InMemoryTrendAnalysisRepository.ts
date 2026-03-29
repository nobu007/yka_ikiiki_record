import type {
  TrendAnalysisRepository,
  TrendAnalysisQuery,
  TrendAnalysisQueryResult,
} from "@/domain/repositories/TrendAnalysisRepository";
import type {
  StudentTrendAnalysis,
  ClassTrendAnalysis,
} from "@/domain/entities/TrendAnalysis";

/**
 * In-memory implementation of TrendAnalysisRepository for development and testing.
 *
 * Stores trend analyses in memory using Map data structures for efficient
 * lookup by student name and class name. This implementation is suitable
 * for development environments and testing scenarios.
 *
 * Design principles:
 * - Single Responsibility: Manages in-memory storage of trend analyses
 * - Interface Segregation: Implements full TrendAnalysisRepository interface
 * - Testability: Easy to set up and tear down in test environments
 *
 * @example
 * ```ts
 * const repository = new InMemoryTrendAnalysisRepository();
 * await repository.saveStudentTrend(studentAnalysis);
 * const retrieved = await repository.getStudentTrend("Alice");
 * ```
 */
export class InMemoryTrendAnalysisRepository implements TrendAnalysisRepository {
  private readonly studentTrends: Map<string, StudentTrendAnalysis>;
  private readonly classTrends: Map<string, ClassTrendAnalysis>;

  constructor() {
    this.studentTrends = new Map();
    this.classTrends = new Map();
  }

  async saveStudentTrend(
    analysis: StudentTrendAnalysis,
  ): Promise<StudentTrendAnalysis> {
    this.studentTrends.set(analysis.student, analysis);
    return analysis;
  }

  async saveClassTrend(
    analysis: ClassTrendAnalysis,
  ): Promise<ClassTrendAnalysis> {
    this.classTrends.set(analysis.className, analysis);
    return analysis;
  }

  async getStudentTrend(
    student: string,
  ): Promise<StudentTrendAnalysis | null> {
    const trend = this.studentTrends.get(student);
    return trend ?? null;
  }

  async getClassTrend(className: string): Promise<ClassTrendAnalysis | null> {
    const trend = this.classTrends.get(className);
    return trend ?? null;
  }

  async queryStudentTrends(
    query: TrendAnalysisQuery,
  ): Promise<TrendAnalysisQueryResult<StudentTrendAnalysis>> {
    let results = Array.from(this.studentTrends.values());

    if (query.studentName) {
      results = results.filter((t) =>
        t.student.toLowerCase().includes(query.studentName!.toLowerCase()),
      );
    }

    if (query.trendDirection) {
      results = results.filter((t) => t.metrics.trendDirection === query.trendDirection);
    }

    if (query.startDate) {
      results = results.filter((t) =>
        t.dataPoints.some((dp) => dp.date >= query.startDate!),
      );
    }

    if (query.endDate) {
      results = results.filter((t) =>
        t.dataPoints.some((dp) => dp.date <= query.endDate!),
      );
    }

    const totalCount = results.length;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? totalCount;

    const paginatedResults = results.slice(offset, offset + limit);

    return {
      analyses: paginatedResults,
      totalCount,
    };
  }

  async queryClassTrends(
    query: TrendAnalysisQuery,
  ): Promise<TrendAnalysisQueryResult<ClassTrendAnalysis>> {
    let results = Array.from(this.classTrends.values());

    if (query.className) {
      results = results.filter((t) =>
        t.className.toLowerCase().includes(query.className!.toLowerCase()),
      );
    }

    if (query.trendDirection) {
      results = results.filter((t) => t.metrics.trendDirection === query.trendDirection);
    }

    if (query.startDate) {
      results = results.filter((t) =>
        t.studentAnalyses.some((sa) =>
          sa.dataPoints.some((dp) => dp.date >= query.startDate!),
        ),
      );
    }

    if (query.endDate) {
      results = results.filter((t) =>
        t.studentAnalyses.some((sa) =>
          sa.dataPoints.some((dp) => dp.date <= query.endDate!),
        ),
      );
    }

    const totalCount = results.length;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? totalCount;

    const paginatedResults = results.slice(offset, offset + limit);

    return {
      analyses: paginatedResults,
      totalCount,
    };
  }

  async deleteStudentTrend(student: string): Promise<boolean> {
    return this.studentTrends.delete(student);
  }

  async deleteClassTrend(className: string): Promise<boolean> {
    return this.classTrends.delete(className);
  }

  /**
   * Clears all stored trend analyses.
   *
   * Utility method primarily useful in test scenarios to ensure
   * clean state between test runs.
   *
   * @example
   * ```ts
   * repository.clear();
   * expect(repository.getStudentTrend("Alice")).resolves.toBeNull();
   * ```
   */
  clear(): void {
    this.studentTrends.clear();
    this.classTrends.clear();
  }

  /**
   * Returns the count of stored student trends.
   *
   * Utility method for testing and monitoring.
   *
   * @returns Number of student trend analyses currently stored
   */
  getStudentTrendCount(): number {
    return this.studentTrends.size;
  }

  /**
   * Returns the count of stored class trends.
   *
   * Utility method for testing and monitoring.
   *
   * @returns Number of class trend analyses currently stored
   */
  getClassTrendCount(): number {
    return this.classTrends.size;
  }
}
