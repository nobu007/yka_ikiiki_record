import {
  generateBaseEmotion,
  calculateSeasonalEffect,
  calculateEventEffect,
  clampEmotion,
  getRandomHour,
  average,
  calculateMonthlyStats,
  calculateStudentStats,
  calculateDayOfWeekStats,
  calculateEmotionDistribution,
  calculateTimeOfDayStats,
} from "@/utils/statsCalculator";
import { APP_CONFIG } from "@/lib/config";
import { DATA_GENERATION_PARAMS } from "@/lib/constants";
import { StatsData } from "@/schemas/api";

/**
 * Configuration for synthetic emotion data generation.
 *
 * Defines parameters for generating realistic emotion data including
 * temporal patterns, distribution types, and special event effects.
 */
export interface DataGenerationConfig {
  /** Number of days to generate data for */
  periodDays: number;
  /** Number of students to generate data for */
  studentCount: number;
  /** Statistical distribution pattern for emotion values */
  distributionPattern: "normal" | "bimodal" | "stress" | "happy";
  /** Optional class-level characteristics affecting all students */
  classCharacteristics?: {
    /** Volatility multiplier for emotion variance */
    volatility: number;
    /** Baseline emotion level shift */
    baselineEmotion: number;
  };
  /** Whether to apply seasonal effects to emotion values */
  seasonalEffects: boolean;
  /** Special events with date ranges and impact values */
  eventEffects: Array<{
    startDate: string;
    endDate: string;
    impact: number;
  }>;
}

/**
 * Internal record structure for generated emotion data.
 */
interface EmotionRecord {
  /** Timestamp of the emotion record */
  date: Date;
  /** Student identifier */
  student: number;
  /** Emotion score (0-100) */
  emotion: number;
  /** Hour of day (0-23) */
  hour: number;
}

/**
 * Service for generating synthetic emotion statistics data.
 *
 * This class provides methods to generate realistic emotion data for testing
 * and demonstration purposes. It supports various distribution patterns,
 * seasonal effects, and special event impacts to create diverse datasets.
 *
 * **Generation Features:**
 * - Multiple distribution patterns (normal, bimodal, stress, happy)
 * - Seasonal emotion variation (winter blues, spring renewal, etc.)
 * - Special event effects (exams, holidays, celebrations)
 * - Class-level characteristics (baseline mood, volatility)
 * - Randomized time-of-day distribution
 *
 * **Statistical Outputs:**
 * - Monthly statistics
 * - Day-of-week patterns
 * - Time-of-day analysis
 * - Student-level breakdowns
 * - Emotion distribution charts
 *
 * @example
 * ```typescript
 * const dataService = new DataService();
 *
 * const config: DataGenerationConfig = {
 *   periodDays: 100,
 *   studentCount: 30,
 *   distributionPattern: "normal",
 *   seasonalEffects: true,
 *   eventEffects: [
 *     { startDate: "2024-01-15", endDate: "2024-01-20", impact: -20 }
 *   ]
 * };
 *
 * const stats = dataService.generateStatsData(config);
 * ```
 */
class DataService {
  private generateEmotion(
    config: DataGenerationConfig,
    date: Date,
    _studentIndex: number,
  ): number {
    let emotion = generateBaseEmotion(config.distributionPattern);

    if (config.classCharacteristics) {
      emotion =
        emotion *
        (1 +
          (config.classCharacteristics.volatility -
            DATA_GENERATION_PARAMS.VOLATILITY.BASELINE) *
            DATA_GENERATION_PARAMS.VOLATILITY.MULTIPLIER);
      emotion +=
        (config.classCharacteristics.baselineEmotion -
          DATA_GENERATION_PARAMS.BASELINE_EMOTION.CENTER) *
        DATA_GENERATION_PARAMS.BASELINE_EMOTION.MULTIPLIER;
    }

    if (config.seasonalEffects) {
      emotion += calculateSeasonalEffect(date);
    }

    const events = config.eventEffects.map((event) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }));
    emotion += calculateEventEffect(date, events);

    return clampEmotion(emotion);
  }

  private generateEmotionRecords(
    config: DataGenerationConfig,
  ): EmotionRecord[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);
    const records: EmotionRecord[] = [];

    for (
      let studentIndex = 0;
      studentIndex < config.studentCount;
      studentIndex++
    ) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        const recordCount =
          Math.floor(
            Math.random() * DATA_GENERATION_PARAMS.RECORDS_PER_DAY.MAX,
          ) + DATA_GENERATION_PARAMS.RECORDS_PER_DAY.MIN;

        for (let i = 0; i < recordCount; i++) {
          records.push({
            date,
            student: studentIndex,
            emotion: this.generateEmotion(config, date, studentIndex),
            hour: getRandomHour(),
          });
        }
      }
    }

    return records;
  }

  generateStats(config: DataGenerationConfig): StatsData {
    const allEmotions = this.generateEmotionRecords(config);
    const emotions = allEmotions.map((e) => e.emotion);
    const avgEmotion = average(emotions);

    return {
      overview: {
        count: allEmotions.length,
        avgEmotion,
      },
      monthlyStats: calculateMonthlyStats(allEmotions),
      studentStats: calculateStudentStats(allEmotions),
      dayOfWeekStats: calculateDayOfWeekStats(allEmotions),
      emotionDistribution: calculateEmotionDistribution(allEmotions),
      timeOfDayStats: calculateTimeOfDayStats(allEmotions),
    };
  }

  createDefaultConfig(): DataGenerationConfig {
    const config: DataGenerationConfig = {
      periodDays: APP_CONFIG.generation.defaultPeriodDays,
      studentCount: APP_CONFIG.generation.defaultStudentCount,
      distributionPattern: APP_CONFIG.generation.defaultPattern,
      seasonalEffects: true,
      eventEffects: [],
    };
    return config;
  }
}

export const dataService = new DataService();
