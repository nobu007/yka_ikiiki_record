import { MonthlyStats, DayOfWeekStats, TimeOfDayStats, StudentStats } from '@/domain/entities/Stats';

// 定数を抽出してコードを簡潔に
const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'] as const;
const DECIMAL_PLACES = 1;
const EMPTY_ARRAY: number[] = [];

/**
 * 統計計算に関するユーティリティ関数
 */

/**
 * 平均値を計算
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(DECIMAL_PLACES));
};

/**
 * 月別統計を計算
 */
export function calculateMonthlyStats(emotions: Array<{date: Date; emotion: number}>): MonthlyStats[] {
  const monthlyData = new Map<string, number[]>();

  emotions.forEach(({ date, emotion }) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthEmotions = monthlyData.get(monthKey) || [];
    monthEmotions.push(emotion);
    monthlyData.set(monthKey, monthEmotions);
  });

  return Array.from(monthlyData.entries())
    .map(([month, monthEmotions]) => ({
      month,
      avgEmotion: calculateAverage(monthEmotions),
      count: monthEmotions.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * 曜日別統計を計算
 */
export function calculateDayOfWeekStats(emotions: Array<{date: Date; emotion: number}>): DayOfWeekStats[] {
  const dayData = new Map<string, number[]>();

  emotions.forEach(({ date, emotion }) => {
    const day = DAYS_OF_WEEK[date.getDay()];
    const dayEmotions = dayData.get(day) || EMPTY_ARRAY.slice();
    dayEmotions.push(emotion);
    dayData.set(day, dayEmotions);
  });

  return DAYS_OF_WEEK.map(day => {
    const emotionsForDay = dayData.get(day) || EMPTY_ARRAY;
    return {
      day,
      avgEmotion: calculateAverage(emotionsForDay),
      count: emotionsForDay.length
    };
  });
}

// 時間帯の定数を抽出
const TIME_RANGES = {
  morning: { start: 5, end: 12 },
  afternoon: { start: 12, end: 18 },
  evening: { start: 18, end: 24 }
} as const;

/**
 * 時間帯別統計を計算
 */
export function calculateTimeOfDayStats(
  emotions: Array<{hour: number; emotion: number}>
): TimeOfDayStats {
  const timeRanges = {
    morning: [] as number[],
    afternoon: [] as number[],
    evening: [] as number[]
  };

  emotions.forEach(({ emotion, hour }) => {
    if (hour >= TIME_RANGES.morning.start && hour < TIME_RANGES.morning.end) {
      timeRanges.morning.push(emotion);
    } else if (hour >= TIME_RANGES.afternoon.start && hour < TIME_RANGES.afternoon.end) {
      timeRanges.afternoon.push(emotion);
    } else {
      timeRanges.evening.push(emotion);
    }
  });

  return {
    morning: calculateAverage(timeRanges.morning),
    afternoon: calculateAverage(timeRanges.afternoon),
    evening: calculateAverage(timeRanges.evening)
  };
}

// 感情分布の定数
const EMOTION_RANGES = {
  MIN: 1,
  MAX: 5,
  LEVELS: 5
} as const;

/**
 * 感情値の分布を計算（1-5の範囲を5段階に分類）
 */
export function calculateEmotionDistribution(emotions: Array<{emotion: number}>): number[] {
  const distribution = new Array(EMOTION_RANGES.LEVELS).fill(0);

  emotions.forEach(({ emotion }) => {
    const index = Math.min(Math.floor(emotion) - EMOTION_RANGES.MIN, EMOTION_RANGES.LEVELS - 1);
    if (index >= 0 && index < EMOTION_RANGES.LEVELS) {
      distribution[index]++;
    }
  });

  return distribution;
}

/**
 * 生徒別の統計を計算
 */
export function calculateStudentStats(
  emotions: Array<{student: number; emotion: number; date: Date}>
): StudentStats[] {
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
    avgEmotion: calculateAverage(data.emotions),
    trendline: calculateTrendline(data.emotions)
  }));
}

/**
 * トレンドラインを計算（直近7件）
 */
export function calculateTrendline(emotions: number[]): number[] {
  return emotions.slice(-7).map(score => Number((score || 0).toFixed(1)));
}

/**
 * ランダムな時刻を生成（5-23時）
 */
export function getRandomHour(): number {
  const { start: minHour, end: maxHour } = TIME_RANGES.morning;
  const totalHours = TIME_RANGES.evening.end - minHour;
  return Math.floor(Math.random() * totalHours) + minHour;
}

// Export a comprehensive calculate function for external use
export function calculateStats(emotions: Array<{date: Date; emotion: number; student: number; hour: number}>) {
  const totalRecords = emotions.length;
  const averageEmotion = calculateAverage(emotions.map(e => e.emotion));
  const emotionDistribution = calculateEmotionDistribution(emotions);
  const monthlyStats = calculateMonthlyStats(emotions);
  const weekdayStats = calculateDayOfWeekStats(emotions);
  const hourlyStats = calculateTimeOfDayStats(emotions);
  const studentStats = calculateStudentStats(emotions);

  return {
    totalRecords,
    averageEmotion,
    emotionDistribution,
    monthlyStats,
    weekdayStats,
    hourlyStats,
    studentStats,
    trend: calculateTrendline(emotions.map(e => e.emotion))
  };
}