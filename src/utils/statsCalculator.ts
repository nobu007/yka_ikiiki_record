import { MonthlyStats, DayOfWeekStats, TimeOfDayStats, StudentStats } from '@/domain/entities/Stats';

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'] as const;
const DECIMAL_PLACES = 1;
const TIME_RANGES = { morning: { start: 5, end: 12 }, afternoon: { start: 12, end: 18 }, evening: { start: 18, end: 24 } } as const;
const EMOTION_LEVELS = 5;

type EmotionData = { date: Date; emotion: number; hour?: number; student?: number };

/**
 * 統計計算に関するユーティリティ関数
 */

export const calculateAverage = (values: number[]): number => 
  values.length === 0 ? 0 : Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(DECIMAL_PLACES));

const groupBy = <T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> => {
  const groups = new Map<K, T[]>();
  items.forEach(item => {
    const key = keyFn(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  });
  return groups;
};

export const calculateMonthlyStats = (emotions: EmotionData[]): MonthlyStats[] => {
  const monthlyGroups = groupBy(emotions, ({ date }) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  
  return Array.from(monthlyGroups.entries())
    .map(([month, monthEmotions]) => ({
      month,
      avgEmotion: calculateAverage(monthEmotions.map(e => e.emotion)),
      count: monthEmotions.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const calculateDayOfWeekStats = (emotions: EmotionData[]): DayOfWeekStats[] => 
  DAYS_OF_WEEK.map(day => {
    const dayEmotions = emotions.filter(({ date }) => DAYS_OF_WEEK[date.getDay()] === day);
    return {
      day,
      avgEmotion: calculateAverage(dayEmotions.map(e => e.emotion)),
      count: dayEmotions.length
    };
  });

export const calculateTimeOfDayStats = (emotions: EmotionData[]): TimeOfDayStats => {
  const timeGroups = {
    morning: emotions.filter(({ hour }) => hour !== undefined && hour >= TIME_RANGES.morning.start && hour < TIME_RANGES.morning.end),
    afternoon: emotions.filter(({ hour }) => hour !== undefined && hour >= TIME_RANGES.afternoon.start && hour < TIME_RANGES.afternoon.end),
    evening: emotions.filter(({ hour }) => hour !== undefined && (hour >= TIME_RANGES.evening.start || hour < TIME_RANGES.morning.start))
  };

  return {
    morning: calculateAverage(timeGroups.morning.map(e => e.emotion)),
    afternoon: calculateAverage(timeGroups.afternoon.map(e => e.emotion)),
    evening: calculateAverage(timeGroups.evening.map(e => e.emotion))
  };
};

export const calculateEmotionDistribution = (emotions: EmotionData[]): number[] => {
  const distribution = new Array(EMOTION_LEVELS).fill(0);
  emotions.forEach(({ emotion }) => {
    const index = Math.min(Math.max(Math.floor(emotion) - 1, 0), EMOTION_LEVELS - 1);
    distribution[index]++;
  });
  return distribution;
};

export const calculateStudentStats = (emotions: EmotionData[]): StudentStats[] => {
  const studentGroups = groupBy(emotions, ({ student }) => student ?? 0);
  
  return Array.from(studentGroups.entries())
    .map(([student, studentEmotions]) => ({
      student: `学生${student + 1}`,
      recordCount: studentEmotions.length,
      avgEmotion: calculateAverage(studentEmotions.map(e => e.emotion)),
      trendline: calculateTrendline(studentEmotions.map(e => e.emotion))
    }))
    .sort((a, b) => a.student.localeCompare(b.student));
};

export const calculateTrendline = (emotions: number[]): number[] => 
  emotions.slice(-7).map(score => Number((score || 0).toFixed(1)));

export const getRandomHour = (): number => {
  const totalHours = TIME_RANGES.evening.end - TIME_RANGES.morning.start;
  return Math.floor(Math.random() * totalHours) + TIME_RANGES.morning.start;
};

// Legacy export for backward compatibility
export const calculateStats = {
  calculateMonthlyStats,
  calculateDayOfWeekStats,
  calculateTimeOfDayStats,
  calculateEmotionDistribution,
  calculateStudentStats,
  calculateTrendline
};

// Additional utility functions for emotion calculations
export const calculateAverageEmotion = (emotions: number[]): number => 
  calculateAverage(emotions);

export const calculateEmotionTrend = (emotions: number[]): 'up' | 'down' | 'stable' => {
  if (emotions.length < 2) return 'stable';
  const recent = emotions.slice(-3);
  const earlier = emotions.slice(-6, -3);
  const recentAvg = calculateAverage(recent);
  const earlierAvg = calculateAverage(earlier);
  const diff = recentAvg - earlierAvg;
  if (diff > 0.2) return 'up';
  if (diff < -0.2) return 'down';
  return 'stable';
};