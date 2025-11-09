import { Stats } from '../entities/Stats';
import { StatsRepository } from '../repositories/StatsRepository';
import { DataGenerationConfig, DEFAULT_CONFIG } from '../entities/DataGeneration';
import { EmotionGenerator } from './EmotionGenerator';
import {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateAverage,
  getRandomHour
} from '@/utils/statsCalculator';

/**
 * 統計情報に関するサービスクラス
 */
export class StatsService {
  private emotionGenerator: EmotionGenerator;

  constructor(private readonly repository: StatsRepository) {
    this.emotionGenerator = new EmotionGenerator();
  }

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<Stats> {
    return await this.repository.getStats();
  }

  /**
   * テストデータを生成
   */
  async generateSeedData(config: DataGenerationConfig = DEFAULT_CONFIG): Promise<void> {
    const stats = this.generateStatsData(config);
    await this.repository.saveStats(stats);
  }

  /**
   * 統計データを生成
   */
  private generateStatsData(config: DataGenerationConfig): Stats {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);

    // 全期間の感情データを生成
    const allEmotions: Array<{
      date: Date;
      student: number;
      emotion: number;
      hour: number;
    }> = [];

    // 各生徒、各日のデータを生成
    for (let studentIndex = 0; studentIndex < config.studentCount; studentIndex++) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);

        // その日の記録回数（1-3回）
        const recordCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < recordCount; i++) {
          const hour = getRandomHour();
          const emotion = this.emotionGenerator.generateEmotion(config, date, studentIndex);

          allEmotions.push({
            date,
            student: studentIndex,
            emotion,
            hour
          });
        }
      }
    }

    // 各種統計を計算
    const monthlyStats = calculateMonthlyStats(allEmotions);
    const dayOfWeekStats = calculateDayOfWeekStats(allEmotions);
    const timeOfDayStats = calculateTimeOfDayStats(allEmotions);
    const studentStats = calculateStudentStats(allEmotions);
    const emotionDistribution = calculateEmotionDistribution(allEmotions);
    const overview = {
      count: allEmotions.length,
      avgEmotion: calculateAverage(allEmotions.map(e => e.emotion))
    };

    return {
      overview,
      monthlyStats,
      studentStats,
      dayOfWeekStats,
      emotionDistribution,
      timeOfDayStats
    };
  }
}