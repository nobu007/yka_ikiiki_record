// Consolidated utility functions

import { EMOTION_CONFIG, UI_CONFIG } from './config';

// Math utilities
export const clamp = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(max, value));

export const average = (values: number[]): number => 
  values.length === 0 ? 0 : Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1));

// Alias for backward compatibility
export const calculateAverage = average;

// Normal distribution generator (Box-Muller transform)
export const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

// Emotion calculation utilities
export const clampEmotion = (emotion: number): number => 
  clamp(emotion, EMOTION_CONFIG.min, EMOTION_CONFIG.max);

export const generateBaseEmotion = (pattern: keyof typeof EMOTION_CONFIG.baseEmotions): number => {
  const baseValue = EMOTION_CONFIG.baseEmotions[pattern] ?? EMOTION_CONFIG.baseEmotions.normal;
  const adjustedBase = pattern === 'bimodal' && Math.random() < 0.5 ? 4.0 : baseValue;
  return clampEmotion(adjustedBase + EMOTION_CONFIG.defaultStddev * generateNormalRandom());
};

export const calculateSeasonalEffect = (date: Date): number => {
  const factor = EMOTION_CONFIG.seasonalFactors[date.getMonth()];
  return (factor - 0.3) * EMOTION_CONFIG.seasonalImpact;
};

export const calculateEventEffect = (date: Date, events: Array<{startDate: Date; endDate: Date; impact: number}>): number => {
  return events.reduce((total, { startDate, endDate, impact }) => {
    if (date < startDate || date > endDate) return total;
    
    const duration = endDate.getTime() - startDate.getTime();
    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);
    
    return total + impact * intensity * EMOTION_CONFIG.maxEventImpact;
  }, 0);
};

// Time utilities
export const getRandomHour = (): number => {
  const totalHours = UI_CONFIG.timeRanges.evening.end - UI_CONFIG.timeRanges.morning.start;
  return Math.floor(Math.random() * totalHours) + UI_CONFIG.timeRanges.morning.start;
};

export const filterByTimeRange = (emotions: Array<{hour?: number}>, start: number, end: number) =>
  emotions.filter(({ hour }) => hour !== undefined && hour >= start && hour < end);

// Grouping utilities
export const groupByMonth = (emotions: Array<{date: Date; emotion: number}>) => {
  const groups = new Map<string, number[]>();
  
  emotions.forEach(({ date, emotion }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });
  
  return groups;
};

export const groupByStudent = (emotions: Array<{emotion: number; student?: number}>) => {
  const groups = new Map<number, number[]>();
  
  emotions.forEach(({ emotion, student }) => {
    const key = student ?? 0;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });
  
  return groups;
};

// Statistics calculation utilities
export const calculateMonthlyStats = (emotions: Array<{date: Date; emotion: number}>) => 
  Array.from(groupByMonth(emotions).entries())
    .map(([month, monthEmotions]) => ({
      month,
      avgEmotion: average(monthEmotions),
      count: monthEmotions.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

export const calculateDayOfWeekStats = (emotions: Array<{date: Date; emotion: number}>) => 
  UI_CONFIG.daysOfWeek.map(day => {
    const dayEmotions = emotions.filter(({ date }) => UI_CONFIG.daysOfWeek[date.getDay()] === day);
    return {
      day,
      avgEmotion: average(dayEmotions.map(e => e.emotion)),
      count: dayEmotions.length
    };
  });

export const calculateTimeOfDayStats = (emotions: Array<{emotion: number; hour?: number}>) => {
  const morningEmotions = filterByTimeRange(emotions, UI_CONFIG.timeRanges.morning.start, UI_CONFIG.timeRanges.morning.end);
  const afternoonEmotions = filterByTimeRange(emotions, UI_CONFIG.timeRanges.afternoon.start, UI_CONFIG.timeRanges.afternoon.end);
  const eveningEmotions = [
    ...filterByTimeRange(emotions, UI_CONFIG.timeRanges.evening.start, UI_CONFIG.timeRanges.evening.end),
    ...filterByTimeRange(emotions, 0, UI_CONFIG.timeRanges.morning.start)
  ];

  return {
    morning: average(morningEmotions.map(e => e.emotion)),
    afternoon: average(afternoonEmotions.map(e => e.emotion)),
    evening: average(eveningEmotions.map(e => e.emotion))
  };
};

export const calculateEmotionDistribution = (emotions: Array<{emotion: number}>) => {
  const distribution = new Array(5).fill(0);
  emotions.forEach(({ emotion }) => {
    const index = Math.min(Math.max(Math.floor(emotion) - 1, 0), 4);
    distribution[index]++;
  });
  return distribution;
};

export const calculateStudentStats = (emotions: Array<{emotion: number; student?: number}>) => 
  Array.from(groupByStudent(emotions).entries())
    .map(([student, studentEmotions]) => ({
      student: `学生${student + 1}`,
      recordCount: studentEmotions.length,
      avgEmotion: average(studentEmotions),
      trendline: studentEmotions.slice(-7).map(score => Number((score || 0).toFixed(1)))
    }))
    .sort((a, b) => a.student.localeCompare(b.student));

export const calculateEmotionTrend = (emotions: number[]): 'up' | 'down' | 'stable' => {
  if (emotions.length < 2) return 'stable';
  const recent = emotions.slice(-3);
  const earlier = emotions.slice(-6, -3);
  const recentAvg = average(recent);
  const earlierAvg = average(earlier);
  const diff = recentAvg - earlierAvg;
  if (diff > 0.2) return 'up';
  if (diff < -0.2) return 'down';
  return 'stable';
};