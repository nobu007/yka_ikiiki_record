import { Stats } from "../entities/Stats";
import { StatsRepository } from "../repositories/StatsRepository";
import {
  DataGenerationConfig,
  DEFAULT_CONFIG,
} from "../entities/DataGeneration";
import { generateEmotion } from "./EmotionGenerator";
import {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateAverage,
  getRandomHour,
} from "@/utils/statsCalculator";
import { DATA_GENERATION_PARAMS, RECORDS_PER_DAY_RANGE } from "@/lib/constants";

type EmotionData = {
  date: Date;
  student: number;
  emotion: number;
  hour: number;
};

/**
 * Domain service for managing student emotion statistics.
 *
 * Provides business logic for retrieving existing statistics and
 * generating synthetic seed data for testing and demonstration.
 *
 * @example
 * ```ts
 * const service = new StatsService(repository);
 * const stats = await service.getStats();
 * await service.generateSeedData({ studentCount: 20, periodDays: 100 });
 * ```
 */
export class StatsService {
  /**
   * Creates a new StatsService instance.
   *
   * @param repository - Repository for persisting and retrieving stats data.
   */
  constructor(private readonly repository: StatsRepository) {}

  /**
   * Retrieves current statistics from the repository.
   *
   * @returns Promise resolving to Stats object with overview, monthly,
   *          daily, student, and distribution statistics.
   *
   * @example
   * ```ts
   * const stats = await service.getStats();
   * console.log(stats.overview.count, stats.overview.avgEmotion);
   * ```
   */
  async getStats(): Promise<Stats> {
    return await this.repository.getStats();
  }

  /**
   * Generates synthetic seed data and persists it to the repository.
   *
   * Creates realistic emotion data for multiple students over a time period,
   * applying seasonal patterns, events, and individual characteristics.
   * Data is generated according to the provided configuration.
   *
   * @param config - Configuration for data generation (student count, days, patterns).
   *                  Defaults to DEFAULT_CONFIG if not provided.
   * @returns Promise that resolves when data is generated and saved.
   *
   * @example
   * ```ts
   * // Generate 100 days of data for 30 students
   * await service.generateSeedData({
   *   studentCount: 30,
   *   periodDays: 100,
   *   pattern: "normal"
   * });
   * ```
   */
  async generateSeedData(
    config: DataGenerationConfig = DEFAULT_CONFIG,
  ): Promise<void> {
    const stats = this.generateStatsData(config);
    await this.repository.saveStats(stats);
  }

  /**
   * Generates complete Stats object from raw emotion data.
   *
   * Transforms array of emotion records into aggregated statistics
   * including overview, monthly breakdowns, student analysis, and
   * distribution patterns.
   *
   * @param config - Data generation configuration.
   * @returns Complete Stats object with all calculated aggregations.
   */
  private generateStatsData(config: DataGenerationConfig): Stats {
    const allEmotions = this.generateEmotionData(config);
    const emotions = allEmotions.map((e) => e.emotion);

    return {
      overview: {
        count: allEmotions.length,
        avgEmotion: calculateAverage(emotions),
      },
      monthlyStats: calculateMonthlyStats(allEmotions),
      studentStats: calculateStudentStats(allEmotions),
      dayOfWeekStats: calculateDayOfWeekStats(allEmotions),
      emotionDistribution: calculateEmotionDistribution(allEmotions),
      timeOfDayStats: calculateTimeOfDayStats(allEmotions),
    };
  }

  /**
   * Generates raw emotion data records for all students and days.
   *
   * Creates individual emotion records with timestamps, student IDs,
   * emotion values, and hour-of-day metadata. Uses configurable
   * record count per day and applies emotion generation logic.
   *
   * @param config - Data generation configuration.
   * @returns Array of emotion data records.
   */
  private generateEmotionData(config: DataGenerationConfig): EmotionData[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);
    const allEmotions: EmotionData[] = [];

    for (
      let studentIndex = 0;
      studentIndex < config.studentCount;
      studentIndex++
    ) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        const recordCount =
          Math.floor(Math.random() * RECORDS_PER_DAY_RANGE) +
          DATA_GENERATION_PARAMS.RECORDS_PER_DAY.MIN;

        for (let i = 0; i < recordCount; i++) {
          allEmotions.push({
            date,
            student: studentIndex,
            emotion: generateEmotion(config, date, studentIndex),
            hour: getRandomHour(),
          });
        }
      }
    }

    return allEmotions;
  }
}
