import { Stats } from '../entities/Stats';
import { StatsRepository } from '../repositories/StatsRepository';
import { DataGenerationConfig, DEFAULT_CONFIG } from '../entities/DataGeneration';
import { generateEmotion } from './EmotionGenerator';
import {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateAverage,
  getRandomHour
} from '@/lib/utils';

type EmotionData = { date: Date; student: number; emotion: number; hour: number };

export class StatsService {
  constructor(private readonly repository: StatsRepository) {}

  async getStats(): Promise<Stats> {
    return await this.repository.getStats();
  }

  async generateSeedData(config: DataGenerationConfig = DEFAULT_CONFIG): Promise<void> {
    const stats = this.generateStatsData(config);
    await this.repository.saveStats(stats);
  }

  private generateStatsData(config: DataGenerationConfig): Stats {
    const allEmotions = this.generateEmotionData(config);
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

  private generateEmotionData(config: DataGenerationConfig): EmotionData[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);
    const allEmotions: EmotionData[] = [];

    for (let studentIndex = 0; studentIndex < config.studentCount; studentIndex++) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        const recordCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < recordCount; i++) {
          allEmotions.push({
            date,
            student: studentIndex,
            emotion: generateEmotion(config, date, studentIndex),
            hour: getRandomHour()
          });
        }
      }
    }

    return allEmotions;
  }
}