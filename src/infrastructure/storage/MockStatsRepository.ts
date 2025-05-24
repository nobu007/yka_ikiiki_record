import { Stats, StatsOverview, MonthlyStats, StudentStats, DayOfWeekStats, TimeOfDayStats } from '../../domain/entities/Stats';
import { StatsRepository } from '../../domain/repositories/StatsRepository';

export class MockStatsRepository implements StatsRepository {
  private mockStats: Stats = {
    overview: {
      count: 100,
      avgEmotion: 3.5
    },
    monthlyStats: [
      { month: '2025-04', avgEmotion: 3.2, count: 45 },
      { month: '2025-05', avgEmotion: 3.8, count: 55 }
    ],
    studentStats: [
      {
        student: '学生A',
        recordCount: 30,
        avgEmotion: 3.5,
        trendline: [3.2, 3.4, 3.6, 3.5, 3.7, 3.8, 3.9]
      },
      {
        student: '学生B',
        recordCount: 25,
        avgEmotion: 3.8,
        trendline: [3.5, 3.6, 3.8, 3.7, 3.9, 4.0, 3.8]
      }
    ],
    dayOfWeekStats: [
      { day: '月', avgEmotion: 3.1, count: 15 },
      { day: '火', avgEmotion: 3.3, count: 12 },
      { day: '水', avgEmotion: 3.5, count: 18 },
      { day: '木', avgEmotion: 3.7, count: 14 },
      { day: '金', avgEmotion: 3.9, count: 16 },
      { day: '土', avgEmotion: 4.1, count: 13 },
      { day: '日', avgEmotion: 3.8, count: 12 }
    ],
    emotionDistribution: [5, 15, 35, 30, 15],
    timeOfDayStats: {
      morning: 3.6,
      afternoon: 3.8,
      evening: 3.4
    }
  };

  async getStats(): Promise<Stats> {
    return this.mockStats;
  }

  async generateSeedData(): Promise<void> {
    // モックデータの生成ロジックをここに実装
    // 現在は何もしない
  }
}