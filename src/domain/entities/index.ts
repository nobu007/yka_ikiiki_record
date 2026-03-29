export type { Record } from "./Record";

export type {
  Stats,
  StatsOverview,
  MonthlyStats,
  StudentStats,
  DayOfWeekStats,
  TimeOfDayStats,
} from "./Stats";

export type {
  DataGenerationConfig,
  EmotionDistributionPattern,
  SeasonalEffect,
  EventEffect,
  ClassEvent,
  ClassCharacteristics,
} from "./DataGeneration";

export {
  EMOTION_CONSTANTS,
  DATA_GENERATION_BOUNDS,
  DEFAULT_CONFIG,
} from "./DataGeneration";

export type { EmotionRanges, GenerationBounds } from "./DataGeneration";

export type {
  TrendDirection,
  TrendDataPoint,
  TrendMetrics,
  StudentTrendMetrics,
  ClassTrendMetrics,
  StudentTrendAnalysis,
  ClassTrendAnalysis,
} from "./TrendAnalysis";

export {
  createTrendDataPoint,
  createStudentTrendAnalysis,
  createClassTrendAnalysis,
  calculateTrendDirection,
  calculateMovingAverage,
} from "./TrendAnalysis";
