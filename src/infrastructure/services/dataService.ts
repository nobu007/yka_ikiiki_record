// Data service layer for emotion data generation and statistics

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
  calculateTimeOfDayStats
} from '@/utils/statsCalculator';
import { APP_CONFIG } from '@/lib/config';

export interface DataGenerationConfig {
  periodDays: number;
  studentCount: number;
  distributionPattern: 'normal' | 'bimodal' | 'stress' | 'happy';
  classCharacteristics?: {
    volatility: number;
    baselineEmotion: number;
  };
  seasonalEffects: boolean;
  eventEffects: Array<{
    startDate: string;
    endDate: string;
    impact: number;
  }>;
}

export interface EmotionRecord {
  date: Date;
  student: number;
  emotion: number;
  hour: number;
}

export interface GeneratedStats {
  overview: {
    count: number;
    avgEmotion: number;
  };
  monthlyStats: Array<{
    month: string;
    avgEmotion: number;
    count: number;
  }>;
  studentStats: Array<{
    student: string;
    recordCount: number;
    avgEmotion: number;
    trendline: number[];
  }>;
  dayOfWeekStats: Array<{
    day: string;
    avgEmotion: number;
    count: number;
  }>;
  emotionDistribution: number[];
  timeOfDayStats: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

class DataService {
  private generateEmotion(config: DataGenerationConfig, date: Date, _studentIndex: number): number {
    let emotion = generateBaseEmotion(config.distributionPattern);
    
    // Apply class characteristics
    if (config.classCharacteristics) {
      emotion = emotion * (1 + (config.classCharacteristics.volatility - 0.5) * 0.4);
      emotion += (config.classCharacteristics.baselineEmotion - 3.0) * 0.5;
    }
    
    // Apply seasonal effects
    if (config.seasonalEffects) {
      emotion += calculateSeasonalEffect(date);
    }
    
    // Apply event effects
    const events = config.eventEffects.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate)
    }));
    emotion += calculateEventEffect(date, events);
    
    return clampEmotion(emotion);
  }

  private generateEmotionRecords(config: DataGenerationConfig): EmotionRecord[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.periodDays);
    const records: EmotionRecord[] = [];

    for (let studentIndex = 0; studentIndex < config.studentCount; studentIndex++) {
      for (let day = 0; day < config.periodDays; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        const recordCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < recordCount; i++) {
          records.push({
            date,
            student: studentIndex,
            emotion: this.generateEmotion(config, date, studentIndex),
            hour: getRandomHour()
          });
        }
      }
    }

    return records;
  }

  generateStats(config: DataGenerationConfig): GeneratedStats {
    const allEmotions = this.generateEmotionRecords(config);
    const emotions = allEmotions.map(e => e.emotion);
    const avgEmotion = average(emotions);

    return {
      overview: {
        count: allEmotions.length,
        avgEmotion
      },
      monthlyStats: calculateMonthlyStats(allEmotions),
      studentStats: calculateStudentStats(allEmotions),
      dayOfWeekStats: calculateDayOfWeekStats(allEmotions),
      emotionDistribution: calculateEmotionDistribution(allEmotions),
      timeOfDayStats: calculateTimeOfDayStats(allEmotions)
    };
  }

  createDefaultConfig(): DataGenerationConfig {
    return {
      periodDays: APP_CONFIG.generation.defaultPeriodDays,
      studentCount: APP_CONFIG.generation.defaultStudentCount,
      distributionPattern: APP_CONFIG.generation.defaultPattern,
      seasonalEffects: true,
      eventEffects: []
    };
  }
}

export const dataService = new DataService();