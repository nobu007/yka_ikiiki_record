import { Stats } from "@/domain/entities/Stats";
import { StatsRepository } from "@/domain/repositories/StatsRepository";
import { IRecordRepository } from "@/domain/repositories/IRecordRepository";
import {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateAverage,
} from "@/utils/statsCalculator";

type EmotionData = {
  date: Date;
  student: number;
  emotion: number;
  hour: number;
};

export class PrismaStatsRepository implements StatsRepository {
  constructor(private readonly recordRepository: IRecordRepository) {}

  async getStats(): Promise<Stats> {
    const records = await this.recordRepository.findAll();
    const emotionData = this.convertToEmotionData(records);
    const emotions = emotionData.map((e) => e.emotion);

    return {
      overview: {
        count: emotions.length,
        avgEmotion: calculateAverage(emotions),
      },
      monthlyStats: calculateMonthlyStats(emotionData),
      studentStats: calculateStudentStats(emotionData),
      dayOfWeekStats: calculateDayOfWeekStats(emotionData),
      emotionDistribution: calculateEmotionDistribution(emotionData),
      timeOfDayStats: calculateTimeOfDayStats(emotionData),
    };
  }

  async saveStats(stats: Stats): Promise<void> {
    const records = this.convertStatsToRecords(stats);
    await this.recordRepository.saveMany(records);
  }

  async generateSeedData(): Promise<void> {
    const { generateSeedData } =
      await import("@/infrastructure/repositories/PrismaSeedRepository");
    await generateSeedData();
  }

  private convertToEmotionData(
    records: Array<{ date: Date; student: string; emotion: number }>,
  ): EmotionData[] {
    return records.map((record, index) => ({
      date: record.date,
      student: index % 25,
      emotion: record.emotion,
      hour: record.date.getHours(),
    }));
  }

  private convertStatsToRecords(
    stats: Stats,
  ): Array<{ date: Date; student: string; emotion: number }> {
    const records: Array<{ date: Date; student: string; emotion: number }> = [];

    stats.monthlyStats.forEach((monthly) => {
      const avgEmotion = monthly.avgEmotion;
      for (let i = 0; i < monthly.count; i++) {
        const studentIndex = Math.floor(
          Math.random() * stats.studentStats.length,
        );
        const student = stats.studentStats[studentIndex]?.student || "Unknown";
        records.push({
          date: new Date(monthly.month + "-01"),
          student,
          emotion: avgEmotion + (Math.random() - 0.5),
        });
      }
    });

    return records;
  }
}
