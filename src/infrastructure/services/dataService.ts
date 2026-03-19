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

export interface DataGenerationConfig {
  periodDays: number;
  studentCount: number;
  distributionPattern: "normal" | "bimodal" | "stress" | "happy";
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

interface EmotionRecord {
  date: Date;
  student: number;
  emotion: number;
  hour: number;
}

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
