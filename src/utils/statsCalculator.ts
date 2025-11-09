import { MonthlyStats, DayOfWeekStats, TimeOfDayStats, StudentStats } from '@/domain/entities/Stats';

/**
 * 統計計算に関するユーティリティ関数
 */

/**
 * 平均値を計算
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1));
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
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayData = new Map<string, number[]>();

  emotions.forEach(({ date, emotion }) => {
    const day = days[date.getDay()];
    const dayEmotions = dayData.get(day) || [];
    dayEmotions.push(emotion);
    dayData.set(day, dayEmotions);
  });

  return days.map(day => ({
    day,
    avgEmotion: calculateAverage(dayData.get(day) || []),
    count: (dayData.get(day) || []).length
  }));
}

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
    if (hour >= 5 && hour < 12) {
      timeRanges.morning.push(emotion);
    } else if (hour >= 12 && hour < 18) {
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

/**
 * 感情値の分布を計算（1-5の範囲を5段階に分類）
 */
export function calculateEmotionDistribution(emotions: Array<{emotion: number}>): number[] {
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
  return emotions.slice(-7).map(score => Number(score.toFixed(1)));
}

/**
 * ランダムな時刻を生成（5-23時）
 */
export function getRandomHour(): number {
  return Math.floor(Math.random() * 19) + 5; // 5-23時
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