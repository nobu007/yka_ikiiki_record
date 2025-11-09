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

interface EmotionData {
  date: Date;
  student: number;
  emotion: number;
  hour: number;
}

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
    const allEmotions = this.generateEmotionData(config);
    return this.calculateStats(allEmotions);
  }

  /**
   * 感情データを生成
   */
  private generateEmotionData(config: DataGenerationConfig): EmotionData[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);
    const allEmotions: EmotionData[] = [];

    // 各生徒、各日のデータを生成
    for (let studentIndex = 0; studentIndex < config.studentCount; studentIndex++) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);

        // その日の記録回数（1-3回）
        const recordCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < recordCount; i++) {
          allEmotions.push({
            date,
            student: studentIndex,
            emotion: this.emotionGenerator.generateEmotion(config, date, studentIndex),
            hour: getRandomHour()
          });
        }
      }
    }

    return allEmotions;
  }

  /**
   * 統計情報を計算
   */
  private calculateStats(allEmotions: EmotionData[]): Stats {
    const emotions = allEmotions.map(e => e.emotion);
    
    return {
      overview: {
        count: allEmotions.length,
        avgEmotion: calculateAverage(emotions)
      },
      monthlyStats: calculateMonthlyStats(allEmotions),
      studentStats: calculateStudentStats(allEmotions),
      dayOfWeekStats: calculateDayOfWeekStats(allEmotions),
      emotionDistribution: calculateEmotionDistribution(allEmotions),
      timeOfDayStats: calculateTimeOfDayStats(allEmotions)
    };
  }
}