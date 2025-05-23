import { z } from 'zod';
import { Stats } from '../types/stats';

// 型定義の強化
const RecordSchema = z.object({
  emotion: z.number()
    .min(1, "Emotion score must be at least 1")
    .max(5, "Emotion score must be at most 5"),
  date: z.string().datetime("Invalid date format"),
  student: z.string().min(1, "Student identifier is required"),
  comment: z.string()
});

export type ValidRecord = z.infer<typeof RecordSchema>;

export class StatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StatsError';
  }
}

const formatAverage = (sum: number, count: number): string =>
  (count > 0 ? (sum / count) : 0).toFixed(2);

export function calculateStats(records: unknown[]): Stats {
  try {
    // 入力データのバリデーション
    const validRecords = records
      .map(record => {
        try {
          return RecordSchema.parse(record);
        } catch (e) {
          console.warn('Invalid record:', record, e);
          return null;
        }
      })
      .filter((r): r is ValidRecord => r !== null);

    if (validRecords.length === 0) {
      throw new StatsError('No valid records found');
    }

    // データ集計の初期化
    const stats = {
      monthlyData: new Map<string, { sum: number; count: number }>(),
      studentData: new Map<string, number[]>(),
      dayOfWeekData: Array(7).fill(null).map(() => ({ sum: 0, count: 0 })),
      timeOfDayData: {
        morning: { sum: 0, count: 0 },   // 5-11時
        afternoon: { sum: 0, count: 0 }, // 12-17時
        evening: { sum: 0, count: 0 }    // 18-4時
      },
      emotionDistribution: new Array(5).fill(0)
    };

    // 1回のループで全ての統計を計算（パフォーマンス最適化）
    let totalEmotion = 0;
    for (const record of validRecords) {
      const date = new Date(record.date);

      // 月別データ
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = stats.monthlyData.get(monthKey) || { sum: 0, count: 0 };
      monthData.sum += record.emotion;
      monthData.count += 1;
      stats.monthlyData.set(monthKey, monthData);

      // 学生別データ
      if (!stats.studentData.has(record.student)) {
        stats.studentData.set(record.student, []);
      }
      stats.studentData.get(record.student)!.push(record.emotion);

      // 曜日別データ
      const dayOfWeek = date.getDay();
      stats.dayOfWeekData[dayOfWeek].sum += record.emotion;
      stats.dayOfWeekData[dayOfWeek].count += 1;

      // 時間帯別データ
      const hour = date.getHours();
      const timeData =
        hour >= 5 && hour < 12 ? stats.timeOfDayData.morning :
        hour >= 12 && hour < 18 ? stats.timeOfDayData.afternoon :
        stats.timeOfDayData.evening;

      timeData.sum += record.emotion;
      timeData.count += 1;

      // 感情スコア分布
      const emotionIndex = Math.floor(record.emotion) - 1;
      stats.emotionDistribution[emotionIndex]++;

      totalEmotion += record.emotion;
    }

    // 結果の整形
    return {
      overview: {
        count: validRecords.length,
        avgEmotion: formatAverage(totalEmotion, validRecords.length)
      },
      monthlyStats: Array.from(stats.monthlyData.entries())
        .map(([month, data]) => ({
          month,
          count: data.count,
          avgEmotion: formatAverage(data.sum, data.count)
        }))
        .sort((a, b) => b.month.localeCompare(a.month)),
      studentStats: Array.from(stats.studentData.entries())
        .map(([student, emotions]) => ({
          student,
          recordCount: emotions.length,
          avgEmotion: formatAverage(
            emotions.reduce((sum, e) => sum + e, 0),
            emotions.length
          ),
          trendline: emotions.slice(-7) // 直近7日間のトレンド
        }))
        .sort((a, b) => Number(b.avgEmotion) - Number(a.avgEmotion)),
      dayOfWeekStats: ['日', '月', '火', '水', '木', '金', '土']
        .map((day, index) => ({
          day,
          avgEmotion: formatAverage(
            stats.dayOfWeekData[index].sum,
            stats.dayOfWeekData[index].count
          ),
          count: stats.dayOfWeekData[index].count
        })),
      emotionDistribution: stats.emotionDistribution,
      timeOfDayStats: {
        morning: formatAverage(
          stats.timeOfDayData.morning.sum,
          stats.timeOfDayData.morning.count
        ),
        afternoon: formatAverage(
          stats.timeOfDayData.afternoon.sum,
          stats.timeOfDayData.afternoon.count
        ),
        evening: formatAverage(
          stats.timeOfDayData.evening.sum,
          stats.timeOfDayData.evening.count
        )
      }
    };

  } catch (error) {
    if (error instanceof StatsError) {
      throw error;
    }
    throw new StatsError('Failed to calculate statistics');
  }
}