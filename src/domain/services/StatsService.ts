import { Stats, MonthlyStats, DayOfWeekStats, TimeOfDayStats } from '../entities/Stats';
import { StatsRepository } from '../repositories/StatsRepository';
import { DataGenerationConfig, DEFAULT_CONFIG } from '../entities/DataGeneration';
import { EmotionGenerator } from './EmotionGenerator';

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
          const hour = this.getRandomHour();
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
    const monthlyStats = this.calculateMonthlyStats(allEmotions);
    const dayOfWeekStats = this.calculateDayOfWeekStats(allEmotions);
    const timeOfDayStats = this.calculateTimeOfDayStats(allEmotions);
    const studentStats = this.calculateStudentStats(allEmotions);
    const emotionDistribution = this.calculateEmotionDistribution(allEmotions);
    const overview = {
      count: allEmotions.length,
      avgEmotion: this.calculateAverageEmotion(allEmotions.map(e => e.emotion))
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

  /**
   * 月別統計を計算
   */
  private calculateMonthlyStats(emotions: Array<{date: Date; emotion: number}>): MonthlyStats[] {
    const monthlyData = new Map<string, number[]>();

    emotions.forEach(({ date, emotion }) => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const emotions = monthlyData.get(monthKey) || [];
      emotions.push(emotion);
      monthlyData.set(monthKey, emotions);
    });

    return Array.from(monthlyData.entries())
      .map(([month, monthEmotions]) => ({
        month,
        avgEmotion: this.calculateAverageEmotion(monthEmotions),
        count: monthEmotions.length
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 曜日別統計を計算
   */
  private calculateDayOfWeekStats(emotions: Array<{date: Date; emotion: number}>): DayOfWeekStats[] {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dayData = new Map<string, number[]>();

    emotions.forEach(({ date, emotion }) => {
      const day = days[date.getDay()];
      const emotions = dayData.get(day) || [];
      emotions.push(emotion);
      dayData.set(day, emotions);
    });

    return days.map(day => ({
      day,
      avgEmotion: this.calculateAverageEmotion(dayData.get(day) || []),
      count: (dayData.get(day) || []).length
    }));
  }

  /**
   * 時間帯別統計を計算
   */
  private calculateTimeOfDayStats(
    emotions: Array<{hour: number; emotion: number}>
  ): TimeOfDayStats {
    const timeRanges = {
      morning: [] as number[],
      afternoon: [] as number[],
      evening: [] as number[]
    };

    emotions.forEach(({ emotion, hour }) => {
      if (hour >= 5 && hour < 12) {
        timeRanges.morning.push(emotion);
      } else if (hour >= 12 && hour < 18) {
        timeRanges.afternoon.push(emotion);
      } else {
        timeRanges.evening.push(emotion);
      }
    });

    return {
      morning: this.calculateAverageEmotion(timeRanges.morning),
      afternoon: this.calculateAverageEmotion(timeRanges.afternoon),
      evening: this.calculateAverageEmotion(timeRanges.evening)
    };
  }

  /**
   * 感情値の分布を計算（1-5の範囲を5段階に分類）
   */
  private calculateEmotionDistribution(emotions: Array<{emotion: number}>): number[] {
    const distribution = new Array(5).fill(0);

    emotions.forEach(({ emotion }) => {
      const index = Math.min(Math.floor(emotion) - 1, 4);
      distribution[index]++;
    });

    return distribution;
  }

  /**
   * 生徒別の統計を計算
   */
  private calculateStudentStats(
    emotions: Array<{student: number; emotion: number; date: Date}>
  ) {
    const studentData = new Map<number, { emotions: number[]; dates: Date[] }>();

    emotions.forEach(({ student, emotion, date }) => {
      const data = studentData.get(student) || { emotions: [], dates: [] };
      data.emotions.push(emotion);
      data.dates.push(date);
      studentData.set(student, data);
    });

    return Array.from(studentData.entries()).map(([student, data]) => ({
      student: `学生${student + 1}`,
      recordCount: data.emotions.length,
      avgEmotion: this.calculateAverageEmotion(data.emotions),
      trendline: this.calculateTrendline(data.emotions)
    }));
  }

  /**
   * トレンドラインを計算（直近7件）
   */
  private calculateTrendline(emotions: number[]): number[] {
    return emotions.slice(-7).map(score => Number(score.toFixed(1)));
  }

  /**
   * 平均値を計算
   */
  private calculateAverageEmotion(emotions: number[]): number {
    if (emotions.length === 0) return 0;
    const sum = emotions.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / emotions.length).toFixed(1));
  }

  /**
   * ランダムな時刻を生成（5-23時）
   */
  private getRandomHour(): number {
    return Math.floor(Math.random() * 19) + 5; // 5-23時
  }
}