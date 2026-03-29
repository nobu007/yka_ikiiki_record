import type { StudentTrendAnalysis, ClassTrendAnalysis } from "../entities/TrendAnalysis";

export type TrendAggregationPeriod = "daily" | "weekly" | "monthly" | "semester" | "yearly";

export interface TrendAnalysisQuery {
  studentName?: string;
  className?: string;
  trendDirection?: "up" | "down" | "stable";
  startDate?: Date;
  endDate?: Date;
  aggregationPeriod?: TrendAggregationPeriod;
  limit?: number;
  offset?: number;
}

export interface TrendAnalysisQueryResult<T> {
  analyses: T[];
  totalCount: number;
}

export interface TrendAnalysisRepository {
  saveStudentTrend(analysis: StudentTrendAnalysis): Promise<StudentTrendAnalysis>;
  saveClassTrend(analysis: ClassTrendAnalysis): Promise<ClassTrendAnalysis>;
  getStudentTrend(student: string): Promise<StudentTrendAnalysis | null>;
  getClassTrend(className: string): Promise<ClassTrendAnalysis | null>;
  queryStudentTrends(query: TrendAnalysisQuery): Promise<TrendAnalysisQueryResult<StudentTrendAnalysis>>;
  queryClassTrends(query: TrendAnalysisQuery): Promise<TrendAnalysisQueryResult<ClassTrendAnalysis>>;
  deleteStudentTrend(student: string): Promise<boolean>;
  deleteClassTrend(className: string): Promise<boolean>;
}
