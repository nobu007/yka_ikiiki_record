/**
 * Domain entity for trend analysis of emotion data over time.
 *
 * Provides structures and factory functions for analyzing long-term trends
 * in student and class emotion data, supporting educational insights and
 * data-driven decision making.
 *
 * @example
 * ```ts
 * const dataPoint = createTrendDataPoint({
 *   date: new Date("2026-03-30"),
 *   emotion: 3.5,
 *   recordCount: 5,
 * });
 *
 * const studentAnalysis = createStudentTrendAnalysis({
 *   student: "Alice",
 *   dataPoints: [dataPoint],
 * });
 * ```
 */

export type TrendDirection = "up" | "down" | "stable";

export interface TrendDataPoint {
  date: Date;
  emotion: number;
  recordCount: number;
}

export interface TrendMetrics {
  trendDirection: TrendDirection;
  averageEmotion: number;
  startEmotion: number;
  endEmotion: number;
  volatility: number;
}

export interface StudentTrendMetrics extends TrendMetrics {
  totalRecords: number;
}

export interface ClassTrendMetrics extends TrendMetrics {
  totalStudents: number;
  topPerformers: string[];
  needsSupport: string[];
}

export interface StudentTrendAnalysis {
  student: string;
  dataPoints: TrendDataPoint[];
  metrics: StudentTrendMetrics;
}

export interface ClassTrendAnalysis {
  className: string;
  studentAnalyses: StudentTrendAnalysis[];
  metrics: ClassTrendMetrics;
}

const MIN_EMOTION = 1.0;
const MAX_EMOTION = 5.0;
const TREND_THRESHOLD = 0.1;

function validateEmotion(emotion: number): void {
  if (emotion < MIN_EMOTION || emotion > MAX_EMOTION) {
    throw new Error(
      `Emotion must be between ${MIN_EMOTION} and ${MAX_EMOTION}`,
    );
  }
}

function validateRecordCount(recordCount: number): void {
  if (recordCount < 0) {
    throw new Error("Record count must be non-negative");
  }
}

function validateNonEmptyString(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${fieldName} must not be empty`);
  }
}

function validateNonEmptyArray<T>(array: T[], fieldName: string): void {
  if (array.length === 0) {
    throw new Error(`${fieldName} must not be empty`);
  }
}

export function createTrendDataPoint(params: {
  date: Date;
  emotion: number;
  recordCount: number;
}): TrendDataPoint {
  const { date, emotion, recordCount } = params;

  validateEmotion(emotion);
  validateRecordCount(recordCount);

  return {
    date,
    emotion,
    recordCount,
  };
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const avg = calculateAverage(values);
  const squaredDifferences = values.map((val) => Math.pow(val - avg, 2));
  const variance = calculateAverage(squaredDifferences);
  return Math.sqrt(variance);
}

export function calculateTrendDirection(values: number[]): TrendDirection {
  if (values.length < 2) {
    return "stable";
  }

  const first = values[0] as number;
  const last = values[values.length - 1] as number;
  const difference = last - first;

  if (Math.abs(difference) < TREND_THRESHOLD) {
    return "stable";
  }

  return difference > 0 ? "up" : "down";
}

export function calculateMovingAverage(
  values: number[],
  windowSize: number,
): number[] {
  if (windowSize <= 0) {
    throw new Error("Window size must be positive");
  }

  if (values.length < windowSize) {
    return [];
  }

  const result: number[] = [];
  for (let i = 0; i <= values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    const avg = calculateAverage(window);
    result.push(avg);
  }

  return result;
}

function createStudentTrendMetrics(
  dataPoints: TrendDataPoint[],
): StudentTrendMetrics {
  const emotions = dataPoints.map((dp) => dp.emotion);
  const avgEmotion = calculateAverage(emotions);
  const startEmotion = emotions[0] as number;
  const endEmotion = emotions[emotions.length - 1] as number;
  const volatility = calculateVolatility(emotions);
  const trendDirection = calculateTrendDirection(emotions);
  const totalRecords = dataPoints.reduce(
    (sum, dp) => sum + dp.recordCount,
    0,
  );

  return {
    trendDirection,
    averageEmotion: avgEmotion,
    startEmotion,
    endEmotion,
    volatility,
    totalRecords,
  };
}

export function createStudentTrendAnalysis(params: {
  student: string;
  dataPoints: TrendDataPoint[];
}): StudentTrendAnalysis {
  const { student, dataPoints } = params;

  validateNonEmptyString(student, "Student name");
  validateNonEmptyArray(dataPoints, "Data points array");

  const metrics = createStudentTrendMetrics(dataPoints);

  return {
    student,
    dataPoints,
    metrics,
  };
}

function createClassTrendMetrics(
  studentAnalyses: StudentTrendAnalysis[],
): ClassTrendMetrics {
  if (studentAnalyses.length === 0) {
    throw new Error("Student analyses array must not be empty");
  }

  const allEmotions = studentAnalyses.flatMap((analysis) =>
    analysis.dataPoints.map((dp) => dp.emotion),
  );
  const avgEmotion = calculateAverage(allEmotions);
  const startEmotion = allEmotions[0] as number;
  const endEmotion = allEmotions[allEmotions.length - 1] as number;
  const volatility = calculateVolatility(allEmotions);
  const trendDirection = calculateTrendDirection(allEmotions);
  const totalStudents = studentAnalyses.length;

  const studentAvgs = studentAnalyses.map(
    (analysis) => analysis.metrics.averageEmotion,
  );
  const classAvg = calculateAverage(studentAvgs);

  const topPerformers = studentAnalyses
    .filter((analysis) => analysis.metrics.averageEmotion > classAvg)
    .map((analysis) => analysis.student);

  const needsSupport = studentAnalyses
    .filter((analysis) => analysis.metrics.averageEmotion < classAvg)
    .map((analysis) => analysis.student);

  return {
    trendDirection,
    averageEmotion: avgEmotion,
    startEmotion,
    endEmotion,
    volatility,
    totalStudents,
    topPerformers,
    needsSupport,
  };
}

export function createClassTrendAnalysis(params: {
  className: string;
  studentAnalyses: StudentTrendAnalysis[];
}): ClassTrendAnalysis {
  const { className, studentAnalyses } = params;

  validateNonEmptyString(className, "Class name");
  validateNonEmptyArray(studentAnalyses, "Student analyses array");

  const metrics = createClassTrendMetrics(studentAnalyses);

  return {
    className,
    studentAnalyses,
    metrics,
  };
}
