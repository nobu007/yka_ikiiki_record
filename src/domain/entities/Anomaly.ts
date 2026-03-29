import { z } from "zod";

/**
 * Anomaly severity levels
 */
export enum AnomalySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Anomaly types that can be detected
 */
export enum AnomalyType {
  EMOTION_SPIKE = "emotion_spike",
  EMOTION_DROP = "emotion_drop",
  UNUSUAL_PATTERN = "unusual_pattern",
  DATA_GAP = "data_gap",
  OUTLIER = "outlier",
}

/**
 * Anomaly detection result
 */
export interface Anomaly {
  /** Unique identifier for the anomaly */
  id: string;
  /** Type of anomaly detected */
  type: AnomalyType;
  /** Severity level */
  severity: AnomalySeverity;
  /** Description of the anomaly */
  description: string;
  /** When the anomaly was detected */
  detectedAt: Date;
  /** Related data (student name, date range, etc.) */
  context: AnomalyContext;
  /** Suggested actions */
  recommendations: string[];
  /** Whether the anomaly has been acknowledged */
  acknowledged: boolean;
}

/**
 * Contextual information about an anomaly
 */
export interface AnomalyContext {
  /** Student name if applicable */
  student?: string;
  /** Date range of the anomaly */
  startDate: Date;
  endDate: Date;
  /** Actual values that triggered the anomaly */
  actualValue: number;
  /** Expected value based on historical data */
  expectedValue: number;
  /** Deviation from expected value */
  deviation: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Anomaly detection configuration
 */
export interface AnomalyDetectionConfig {
  /** Threshold for standard deviation (default: 2) */
  stdDevThreshold: number;
  /** Minimum number of records required for analysis (default: 5) */
  minRecordsRequired: number;
  /** Whether to enable emotion spike detection (default: true) */
  enableEmotionSpikeDetection: boolean;
  /** Whether to enable emotion drop detection (default: true) */
  enableEmotionDropDetection: boolean;
  /** Whether to enable unusual pattern detection (default: true) */
  enableUnusualPatternDetection: boolean;
  /** Whether to enable data gap detection (default: true) */
  enableDataGapDetection: boolean;
  /** Maximum gap in days before triggering data gap anomaly (default: 7) */
  maxDataGapDays: number;
}

/**
 * Default anomaly detection configuration
 */
export const DEFAULT_ANOMALY_DETECTION_CONFIG: AnomalyDetectionConfig = {
  stdDevThreshold: 2,
  minRecordsRequired: 5,
  enableEmotionSpikeDetection: true,
  enableEmotionDropDetection: true,
  enableUnusualPatternDetection: true,
  enableDataGapDetection: true,
  maxDataGapDays: 7,
};

/**
 * Zod schema for Anomaly entity validation
 */
export const AnomalySchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(AnomalyType),
  severity: z.nativeEnum(AnomalySeverity),
  description: z.string().min(1).max(500),
  detectedAt: z.date(),
  context: z.object({
    student: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    actualValue: z.number(),
    expectedValue: z.number(),
    deviation: z.number(),
    metadata: z.record(z.unknown()).optional(),
  }),
  recommendations: z.array(z.string().min(1).max(200)),
  acknowledged: z.boolean(),
});

export type AnomalyDTO = z.infer<typeof AnomalySchema>;
