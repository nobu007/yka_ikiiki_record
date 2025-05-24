import { Stats } from '../entities/Stats';
import { StatsRepository } from '../repositories/StatsRepository';

export class StatsService {
  constructor(private readonly repository: StatsRepository) {}

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<Stats> {
    return await this.repository.getStats();
  }

  /**
   * テストデータを生成
   */
  async generateSeedData(): Promise<void> {
    await this.repository.generateSeedData();
  }

  /**
   * 感情スコアの平均値を計算
   */
  calculateAverageEmotion(emotions: number[]): number {
    if (emotions.length === 0) return 0;
    const sum = emotions.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / emotions.length).toFixed(1));
  }

  /**
   * トレンドラインを計算
   */
  calculateTrendline(emotions: number[]): number[] {
    // 直近7件のデータを使用
    return emotions.slice(-7).map(score => Number(score.toFixed(1)));
  }

  /**
   * 時間帯別の感情スコアを計算
   */
  calculateTimeOfDayStats(emotions: { score: number; hour: number }[]): {
    morning: number;
    afternoon: number;
    evening: number;
  } {
    const timeRanges = {
      morning: [] as number[],
      afternoon: [] as number[],
      evening: [] as number[],
    };

    emotions.forEach(({ score, hour }) => {
      if (hour >= 5 && hour < 12) {
        timeRanges.morning.push(score);
      } else if (hour >= 12 && hour < 18) {
        timeRanges.afternoon.push(score);
      } else {
        timeRanges.evening.push(score);
      }
    });

    return {
      morning: this.calculateAverageEmotion(timeRanges.morning),
      afternoon: this.calculateAverageEmotion(timeRanges.afternoon),
      evening: this.calculateAverageEmotion(timeRanges.evening),
    };
  }
}