import type { TrendAnalysisRepository } from "@/domain/repositories/TrendAnalysisRepository";
import type {
  TrendDataPoint,
  StudentTrendAnalysis,
  ClassTrendAnalysis,
} from "@/domain/entities/TrendAnalysis";
import {
  createTrendDataPoint,
  createStudentTrendAnalysis,
  createClassTrendAnalysis,
  calculateMovingAverage as domainCalculateMovingAverage,
} from "@/domain/entities/TrendAnalysis";

export interface AnomalyDataPoint {
  index: number;
  value: number;
  deviation: number;
}

export interface TrendRecord {
  date: Date;
  emotion: number;
}

const DEFAULT_WINDOW_SIZE = 3;
const DEFAULT_STD_DEVIATION_THRESHOLD = 2;

/**
 * Application service for trend analysis of emotion data over time.
 *
 * Provides high-level time-series analysis algorithms including:
 * - Data aggregation by date
 * - Moving average smoothing
 * - Anomaly detection using standard deviation
 * - Trend correlation analysis between multiple series
 *
 * This service orchestrates domain entities and repositories to provide
 * comprehensive trend analysis capabilities for educational insights.
 *
 * Design principles:
 * - Single Responsibility: Handles trend analysis logic and orchestration
 * - Dependency Inversion: Depends on repository interfaces, not concrete implementations
 * - Open/Closed: Open for extension (custom parameters), closed for modification
 *
 * @example
 * ```ts
 * const trendService = new TrendAnalysisService(trendRepository);
 *
 * // Analyze student trend from raw records
 * const records = [
 *   { date: new Date("2026-03-01"), emotion: 3.5 },
 *   { date: new Date("2026-03-02"), emotion: 3.7 },
 * ];
 * const studentTrend = await trendService.analyzeStudentTrend("Alice", records);
 *
 * // Calculate moving average
 * const smoothed = trendService.calculateMovingAverage([1, 2, 3, 4, 5]);
 *
 * // Detect anomalies
 * const anomalies = trendService.detectAnomalies([3.0, 3.2, 3.1, 5.0, 3.2]);
 * ```
 */
export class TrendAnalysisService {
  /**
   * Creates a new TrendAnalysisService instance.
   *
   * @param repository - TrendAnalysisRepository implementation for persisting trend analyses
   */
  constructor(private readonly repository: TrendAnalysisRepository) {}

  /**
   * Analyzes student trend from raw emotion records.
   *
   * Aggregates multiple records by date (when applicable) and creates
   * a comprehensive student trend analysis with all metrics calculated.
   *
   * @param studentName - Name of the student
   * @param records - Array of emotion records with date and emotion values
   * @returns StudentTrendAnalysis with calculated metrics
   * @throws Error if records array is empty
   *
   * @example
   * ```ts
   * const records = [
   *   { date: new Date("2026-03-01"), emotion: 3.5 },
   *   { date: new Date("2026-03-02"), emotion: 3.7 },
   * ];
   * const analysis = await trendService.analyzeStudentTrend("Alice", records);
   * ```
   */
  async analyzeStudentTrend(
    studentName: string,
    records: TrendRecord[],
  ): Promise<StudentTrendAnalysis> {
    if (records.length === 0) {
      throw new Error("Records array must not be empty");
    }

    const aggregatedByDate = this.aggregateRecordsByDate(records);
    const sortedDataPoints = this.sortDataPointsByDate(aggregatedByDate);

    return createStudentTrendAnalysis({
      student: studentName,
      dataPoints: sortedDataPoints,
    });
  }

  /**
   * Analyzes class trend from multiple student trend analyses.
   *
   * Aggregates individual student trends into a comprehensive class-level
   * analysis with metrics including top performers and students needing support.
   *
   * @param className - Name of the class
   * @param studentAnalyses - Array of student trend analyses
   * @returns ClassTrendAnalysis with aggregated metrics
   * @throws Error if studentAnalyses array is empty
   *
   * @example
   * ```ts
   * const classAnalysis = await trendService.analyzeClassTrend(
   *   "Class 3-A",
   *   [studentAnalysis1, studentAnalysis2]
   * );
   * ```
   */
  async analyzeClassTrend(
    className: string,
    studentAnalyses: StudentTrendAnalysis[],
  ): Promise<ClassTrendAnalysis> {
    if (studentAnalyses.length === 0) {
      throw new Error("Student analyses array must not be empty");
    }

    return createClassTrendAnalysis({
      className,
      studentAnalyses,
    });
  }

  /**
   * Calculates moving average for smoothing time-series data.
   *
   * Uses a sliding window to calculate the average of consecutive values,
   * reducing noise and highlighting underlying trends.
   *
   * @param values - Array of numeric values
   * @param windowSize - Size of the sliding window (default: 3)
   * @returns Array of moving average values
   * @throws Error if windowSize is not positive
   *
   * @example
   * ```ts
   * const smoothed = trendService.calculateMovingAverage([1, 2, 3, 4, 5]);
   * // Returns: [2, 3, 4]
   *
   * const smoothed4 = trendService.calculateMovingAverage([1, 2, 3, 4, 5, 6, 7], 4);
   * // Returns: [2.5, 3.5, 4.5, 5.5]
   * ```
   */
  calculateMovingAverage(values: number[], windowSize = DEFAULT_WINDOW_SIZE): number[] {
    return domainCalculateMovingAverage(values, windowSize);
  }

  /**
   * Detects anomalies in time-series data using standard deviation.
   *
   * Identifies values that deviate significantly from the mean (default threshold:
   * 2 standard deviations, covering ~95% of normally distributed data).
   *
   * @param values - Array of numeric values to analyze
   * @param stdDevThreshold - Number of standard deviations for threshold (default: 2)
   * @returns Array of anomaly data points with index, value, and deviation
   *
   * @example
   * ```ts
   * const anomalies = trendService.detectAnomalies([3.0, 3.2, 3.1, 5.0, 3.2]);
   * // Returns: [{ index: 3, value: 5.0, deviation: 1.5 }]
   * ```
   */
  detectAnomalies(
    values: number[],
    stdDevThreshold = DEFAULT_STD_DEVIATION_THRESHOLD,
  ): AnomalyDataPoint[] {
    if (values.length === 0) {
      return [];
    }

    const mean = this.calculateMean(values);
    const variance = this.calculateVariance(values, mean);
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return [];
    }

    const threshold = stdDev * stdDevThreshold;
    const anomalies: AnomalyDataPoint[] = [];

    for (let i = 0; i < values.length; i++) {
      const deviation = Math.abs(values[i] - mean);
      if (deviation > threshold) {
        anomalies.push({
          index: i,
          value: values[i],
          deviation,
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculates Pearson correlation coefficient between two time-series.
   *
   * Measures the linear relationship between two arrays of values:
   * - +1.0: Perfect positive correlation (both increase together)
   * - -1.0: Perfect negative correlation (one increases as other decreases)
   * -  0.0: No linear correlation
   *
   * @param series1 - First array of numeric values
   * @param series2 - Second array of numeric values
   * @returns Correlation coefficient between -1 and 1
   * @throws Error if arrays have different lengths or insufficient data
   *
   * @example
   * ```ts
   * const correlation = trendService.calculateTrendCorrelation(
   *   [1, 2, 3, 4, 5],
   *   [2, 3, 4, 5, 6]
   * );
   * // Returns: ~1.0 (strong positive correlation)
   * ```
   */
  calculateTrendCorrelation(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length) {
      throw new Error("Arrays must have the same length");
    }

    if (series1.length < 2) {
      throw new Error("Arrays must have at least 2 elements");
    }

    const n = series1.length;
    const mean1 = this.calculateMean(series1);
    const mean2 = this.calculateMean(series2);

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);

    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  /**
   * Saves a student trend analysis to the repository.
   *
   * @param analysis - StudentTrendAnalysis to persist
   * @returns The saved analysis
   * @throws Error if repository save operation fails
   */
  async saveStudentTrend(analysis: StudentTrendAnalysis): Promise<StudentTrendAnalysis> {
    return this.repository.saveStudentTrend(analysis);
  }

  /**
   * Saves a class trend analysis to the repository.
   *
   * @param analysis - ClassTrendAnalysis to persist
   * @returns The saved analysis
   * @throws Error if repository save operation fails
   */
  async saveClassTrend(analysis: ClassTrendAnalysis): Promise<ClassTrendAnalysis> {
    return this.repository.saveClassTrend(analysis);
  }

  /**
   * Retrieves a student trend analysis from the repository.
   *
   * @param studentName - Name of the student
   * @returns StudentTrendAnalysis or null if not found
   */
  async getStudentTrend(studentName: string): Promise<StudentTrendAnalysis | null> {
    return this.repository.getStudentTrend(studentName);
  }

  /**
   * Retrieves a class trend analysis from the repository.
   *
   * @param className - Name of the class
   * @returns ClassTrendAnalysis or null if not found
   */
  async getClassTrend(className: string): Promise<ClassTrendAnalysis | null> {
    return this.repository.getClassTrend(className);
  }

  /**
   * Aggregates multiple records by date, averaging emotions and counting records.
   *
   * @private
   * @param records - Array of emotion records
   * @returns Array of aggregated trend data points
   */
  private aggregateRecordsByDate(records: TrendRecord[]): TrendDataPoint[] {
    const dateMap = new Map<string, { emotions: number[]; recordCount: number }>();

    for (const record of records) {
      const dateKey = record.date.toISOString().split("T")[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { emotions: [], recordCount: 0 });
      }

      const entry = dateMap.get(dateKey) as {
        emotions: number[];
        recordCount: number;
      };
      entry.emotions.push(record.emotion);
      entry.recordCount++;
    }

    const aggregated: TrendDataPoint[] = [];

    for (const [dateStr, data] of dateMap) {
      const avgEmotion = this.calculateMean(data.emotions);
      aggregated.push(
        createTrendDataPoint({
          date: new Date(dateStr),
          emotion: avgEmotion,
          recordCount: data.recordCount,
        }),
      );
    }

    return aggregated;
  }

  /**
   * Sorts data points by date in ascending order.
   *
   * @private
   * @param dataPoints - Array of trend data points
   * @returns Sorted array of trend data points
   */
  private sortDataPointsByDate(dataPoints: TrendDataPoint[]): TrendDataPoint[] {
    return dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculates the arithmetic mean of an array of numbers.
   *
   * @private
   * @param values - Array of numeric values
   * @returns Mean value
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculates the variance of an array of numbers.
   *
   * @private
   * @param values - Array of numeric values
   * @param mean - Pre-calculated mean value
   * @returns Variance value
   */
  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) {
      return 0;
    }
    const squaredDifferences = values.map((val) => Math.pow(val - mean, 2));
    return this.calculateMean(squaredDifferences);
  }
}
