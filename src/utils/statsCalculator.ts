import { MonthlyStats, DayOfWeekStats, TimeOfDayStats, StudentStats } from '@/domain/entities/Stats';

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'] as const;
const TIME_RANGES = { morning: { start: 5, end: 12 }, afternoon: { start: 12, end: 18 }, evening: { start: 18, end: 24 } } as const;

type EmotionData = { date: Date; emotion: number; hour?: number; student?: number };

export const calculateAverage = (values: number[]): number => 
  values.length === 0 ? 0 : Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1));

export const calculateMonthlyStats = (emotions: EmotionData[]): MonthlyStats[] => {
  const monthlyGroups = new Map<string, EmotionData[]>();
  
  emotions.forEach(({ date, emotion }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const group = monthlyGroups.get(key) || [];
    group.push({ date, emotion });
    monthlyGroups.set(key, group);
  });
  
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
  const distribution = new Array(5).fill(0);
  emotions.forEach(({ emotion }) => {
    const index = Math.min(Math.max(Math.floor(emotion) - 1, 0), 4);
    distribution[index]++;
  });
  return distribution;
};

export const calculateStudentStats = (emotions: EmotionData[]): StudentStats[] => {
  const studentGroups = new Map<number, EmotionData[]>();
  
  emotions.forEach(({ emotion, student }) => {
    const key = student ?? 0;
    const group = studentGroups.get(key) || [];
    group.push({ emotion, student: key });
    studentGroups.set(key, group);
  });
  
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