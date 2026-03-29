import type { Record } from "@/schemas/api";
import type {
  Anomaly,
  AnomalyContext,
  AnomalyDetectionConfig,
  AnomalySeverity,
  AnomalyType,
} from "@/domain/entities/Anomaly";
import {
  DEFAULT_ANOMALY_DETECTION_CONFIG,
  AnomalyType as AnomalyTypeEnum,
  AnomalySeverity as AnomalySeverityEnum,
} from "@/domain/entities/Anomaly";

/**
 * Domain service for detecting anomalies in student emotion records.
 *
 * This service implements statistical analysis to identify unusual patterns,
 * spikes, drops, and gaps in emotion data that may require attention.
 *
 * **Detection Algorithms:**
 * - Emotion Spike/Drop: Uses standard deviation from historical mean
 * - Unusual Pattern: Analyzes consecutive deviations
 * - Data Gap: Detects missing data periods
 *
 * @example
 * ```ts
 * const service = new AnomalyDetectionService();
 * const anomalies = await service.detectAnomalies(records, {
 *   stdDevThreshold: 2,
 *   minRecordsRequired: 5
 * });
 * ```
 */
export class AnomalyDetectionService {
  private config: AnomalyDetectionConfig;

  constructor(config?: Partial<AnomalyDetectionConfig>) {
    this.config = {
      ...DEFAULT_ANOMALY_DETECTION_CONFIG,
      ...config,
    };
  }

  /**
   * Detect anomalies in a collection of records
   *
   * @param records - Array of student records to analyze
   * @param options - Optional detection configuration
   * @returns Array of detected anomalies
   */
  async detectAnomalies(
    records: Record[],
    options?: Partial<AnomalyDetectionConfig>,
  ): Promise<Anomaly[]> {
    const config = { ...this.config, ...options };
    const anomalies: Anomaly[] = [];

    // Group records by student for individual analysis
    const recordsByStudent = this.groupRecordsByStudent(records);

    // Analyze each student's records
    for (const [student, studentRecords] of Object.entries(
      recordsByStudent,
    )) {
      // Skip if insufficient records
      if (studentRecords.length < config.minRecordsRequired) {
        continue;
      }

      // Sort by date
      const sortedRecords = studentRecords.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );

      // Detect different types of anomalies
      if (config.enableEmotionSpikeDetection) {
        anomalies.push(
          ...(await this.detectEmotionSpikes(sortedRecords, student, config)),
        );
      }

      if (config.enableEmotionDropDetection) {
        anomalies.push(
          ...(await this.detectEmotionDrops(sortedRecords, student, config)),
        );
      }

      if (config.enableUnusualPatternDetection) {
        anomalies.push(
          ...(await this.detectUnusualPatterns(
            sortedRecords,
            student,
            config,
          )),
        );
      }

      if (config.enableDataGapDetection) {
        anomalies.push(
          ...(await this.detectDataGaps(sortedRecords, student, config)),
        );
      }
    }

    return anomalies;
  }

  /**
   * Detect emotion spikes (sudden increases in emotion values)
   */
  private async detectEmotionSpikes(
    records: Record[],
    student: string,
    config: AnomalyDetectionConfig,
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const emotions = records.map((r) => r.emotion);
    const mean = this.calculateMean(emotions);
    const stdDev = this.calculateStandardDeviation(emotions, mean);
    const threshold = mean + config.stdDevThreshold * stdDev;

    for (const record of records) {
      if (record.emotion > threshold) {
        const context: AnomalyContext = {
          student,
          startDate: record.date,
          endDate: record.date,
          actualValue: record.emotion,
          expectedValue: mean,
          deviation: record.emotion - mean,
        };

        anomalies.push({
          id: this.generateAnomalyId(),
          type: AnomalyTypeEnum.EMOTION_SPIKE,
          severity: this.calculateSeverity(
            record.emotion - mean,
            stdDev,
            true,
          ),
          description: `Unusual spike in emotion for ${student}: ${record.emotion.toFixed(1)} (expected: ${mean.toFixed(1)})`,
          detectedAt: new Date(),
          context,
          recommendations: this.generateSpikeRecommendations(
            record.emotion,
            mean,
          ),
          acknowledged: false,
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect emotion drops (sudden decreases in emotion values)
   */
  private async detectEmotionDrops(
    records: Record[],
    student: string,
    config: AnomalyDetectionConfig,
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const emotions = records.map((r) => r.emotion);
    const mean = this.calculateMean(emotions);
    const stdDev = this.calculateStandardDeviation(emotions, mean);
    const threshold = mean - config.stdDevThreshold * stdDev;

    for (const record of records) {
      if (record.emotion < threshold) {
        const context: AnomalyContext = {
          student,
          startDate: record.date,
          endDate: record.date,
          actualValue: record.emotion,
          expectedValue: mean,
          deviation: mean - record.emotion,
        };

        anomalies.push({
          id: this.generateAnomalyId(),
          type: AnomalyTypeEnum.EMOTION_DROP,
          severity: this.calculateSeverity(
            mean - record.emotion,
            stdDev,
            false,
          ),
          description: `Unusual drop in emotion for ${student}: ${record.emotion.toFixed(1)} (expected: ${mean.toFixed(1)})`,
          detectedAt: new Date(),
          context,
          recommendations: this.generateDropRecommendations(
            record.emotion,
            mean,
          ),
          acknowledged: false,
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect unusual patterns (consecutive deviations)
   */
  private async detectUnusualPatterns(
    records: Record[],
    student: string,
    config: AnomalyDetectionConfig,
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const emotions = records.map((r) => r.emotion);
    const mean = this.calculateMean(emotions);
    const stdDev = this.calculateStandardDeviation(emotions, mean);

    // Look for 3+ consecutive records on the same side of mean
    let consecutiveCount = 0;
    let patternStart: Record | null = null;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isAboveMean = record.emotion > mean;

      if (isAboveMean) {
        if (consecutiveCount === 0) {
          patternStart = record;
        }
        consecutiveCount++;
      } else {
        if (consecutiveCount >= 3) {
          const context: AnomalyContext = {
            student,
            startDate: patternStart!.date,
            endDate: record.date,
            actualValue:
              emotions.slice(i - consecutiveCount, i).reduce((a, b) => a + b, 0) /
              consecutiveCount,
            expectedValue: mean,
            deviation:
              (emotions.slice(i - consecutiveCount, i).reduce((a, b) => a + b, 0) /
                consecutiveCount -
                mean +
                0) *
              consecutiveCount,
          };

          anomalies.push({
            id: this.generateAnomalyId(),
            type: AnomalyTypeEnum.UNUSUAL_PATTERN,
            severity: AnomalySeverityEnum.MEDIUM,
            description: `${consecutiveCount} consecutive records above mean for ${student}`,
            detectedAt: new Date(),
            context,
            recommendations: [
              "Monitor student's emotional pattern over next week",
              "Consider checking for external factors affecting mood",
              "Review classroom dynamics during this period",
            ],
            acknowledged: false,
          });
        }
        consecutiveCount = 0;
        patternStart = null;
      }
    }

    return anomalies;
  }

  /**
   * Detect data gaps (missing records over extended periods)
   */
  private async detectDataGaps(
    records: Record[],
    student: string,
    config: AnomalyDetectionConfig,
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    for (let i = 1; i < records.length; i++) {
      const prevRecord = records[i - 1];
      const currRecord = records[i];
      const daysDiff =
        (currRecord.date.getTime() - prevRecord.date.getTime()) /
        (1000 * 60 * 60 * 24);

      if (daysDiff > config.maxDataGapDays) {
        const context: AnomalyContext = {
          student,
          startDate: prevRecord.date,
          endDate: currRecord.date,
          actualValue: daysDiff,
          expectedValue: config.maxDataGapDays,
          deviation: daysDiff - config.maxDataGapDays,
          metadata: {
            gapDays: Math.round(daysDiff),
          },
        };

        anomalies.push({
          id: this.generateAnomalyId(),
          type: AnomalyTypeEnum.DATA_GAP,
          severity: this.calculateGapSeverity(daysDiff, config.maxDataGapDays),
          description: `Data gap of ${Math.round(daysDiff)} days for ${student}`,
          detectedAt: new Date(),
          context,
          recommendations: this.generateGapRecommendations(daysDiff),
          acknowledged: false,
        });
      }
    }

    return anomalies;
  }

  /**
   * Group records by student name
   */
  private groupRecordsByStudent(records: Record[]): Record<string, Record[]> {
    const grouped: Record<string, Record[]> = {};

    for (const record of records) {
      if (!grouped[record.student]) {
        grouped[record.student] = [];
      }
      grouped[record.student].push(record);
    }

    return grouped;
  }

  /**
   * Calculate arithmetic mean
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  /**
   * Calculate severity based on deviation magnitude
   */
  private calculateSeverity(
    deviation: number,
    stdDev: number,
    isSpike: boolean,
  ): AnomalySeverity {
    const numStdDevs = deviation / stdDev;

    if (numStdDevs >= 3) {
      return AnomalySeverityEnum.CRITICAL;
    } else if (numStdDevs >= 2.5) {
      return AnomalySeverityEnum.HIGH;
    } else if (numStdDevs >= 2) {
      return AnomalySeverityEnum.MEDIUM;
    } else {
      return AnomalySeverityEnum.LOW;
    }
  }

  /**
   * Calculate severity for data gaps
   */
  private calculateGapSeverity(gapDays: number, maxGapDays: number): AnomalySeverity {
    const ratio = gapDays / maxGapDays;

    if (ratio >= 3) {
      return AnomalySeverityEnum.CRITICAL;
    } else if (ratio >= 2) {
      return AnomalySeverityEnum.HIGH;
    } else if (ratio >= 1.5) {
      return AnomalySeverityEnum.MEDIUM;
    } else {
      return AnomalySeverityEnum.LOW;
    }
  }

  /**
   * Generate recommendations for emotion spikes
   */
  private generateSpikeRecommendations(
    actual: number,
    expected: number,
  ): string[] {
    const recommendations: string[] = [
      "Verify the accuracy of the recorded emotion value",
      "Check if special events or celebrations occurred",
    ];

    if (actual > 4.5) {
      recommendations.push("Consider if this is a temporary positive state");
      recommendations.push("Monitor for potential regression to baseline");
    }

    return recommendations;
  }

  /**
   * Generate recommendations for emotion drops
   */
  private generateDropRecommendations(
    actual: number,
    expected: number,
  ): string[] {
    const recommendations: string[] = [
      "Check for possible external stressors or difficulties",
      "Consider providing additional support or counseling",
    ];

    if (actual < 2.0) {
      recommendations.push("URGENT: Student may need immediate attention");
      recommendations.push("Review recent incidents or behavioral changes");
    }

    return recommendations;
  }

  /**
   * Generate recommendations for data gaps
   */
  private generateGapRecommendations(gapDays: number): string[] {
    const recommendations: string[] = [
      "Ensure consistent daily recording of student emotions",
      "Review data collection procedures",
    ];

    if (gapDays > 14) {
      recommendations.push("Significant data gap detected - data may be unreliable");
      recommendations.push("Consider reaching out to verify student status");
    }

    return recommendations;
  }

  /**
   * Generate unique anomaly ID
   */
  private generateAnomalyId(): string {
    return `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
