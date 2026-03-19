import { EMOTION_CONFIG, UI_CONFIG } from '@/lib/config';
import { EMOTION_CALCULATION_PARAMS } from '@/lib/constants';

type EmotionData = { date: Date; emotion: number; hour?: number; student?: number };

export const clamp = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(max, value));

export const average = (values: number[]): number =>
  values.length === 0 ? 0 : Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(EMOTION_CALCULATION_PARAMS.DECIMAL_PRECISION));

export const calculateAverage = average;

export const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

export const clampEmotion = (emotion: number): number => 
  clamp(emotion, EMOTION_CONFIG.min, EMOTION_CONFIG.max);

export const generateBaseEmotion = (pattern: keyof typeof EMOTION_CONFIG.baseEmotions): number => {
  const baseValue = EMOTION_CONFIG.baseEmotions[pattern] ?? EMOTION_CONFIG.baseEmotions.normal;
  const adjustedBase = pattern === 'bimodal' && Math.random() < EMOTION_CALCULATION_PARAMS.BIMODAL.THRESHOLD
    ? EMOTION_CALCULATION_PARAMS.BIMODAL.HIGH_VALUE
    : baseValue;
  return clampEmotion(adjustedBase + EMOTION_CONFIG.defaultStddev * generateNormalRandom());
};

export const calculateSeasonalEffect = (date: Date): number => {
  const monthIndex = date.getMonth();
  const factor = EMOTION_CONFIG.seasonalFactors[monthIndex] ?? EMOTION_CALCULATION_PARAMS.SEASONAL.FACTOR_FALLBACK;
  return (factor - EMOTION_CALCULATION_PARAMS.SEASONAL.BASELINE) * EMOTION_CONFIG.seasonalImpact;
};

export const calculateEventEffect = (
  date: Date,
  events: ReadonlyArray<{
    readonly startDate: Date;
    readonly endDate: Date;
    readonly impact: number;
  }>
): number => {
  return events.reduce((total, { startDate, endDate, impact }) => {
    if (date < startDate || date > endDate) return total;

    const duration = endDate.getTime() - startDate.getTime();
    if (duration === 0) return total; // Prevent division by zero

    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);

    return total + impact * intensity * EMOTION_CONFIG.maxEventImpact;
  }, 0);
};

export const getRandomHour = (): number => {
  const totalHours = UI_CONFIG.timeRanges.evening.end - UI_CONFIG.timeRanges.morning.start;
  return Math.floor(Math.random() * totalHours) + UI_CONFIG.timeRanges.morning.start;
};

const filterByTimeRange = (emotions: EmotionData[], start: number, end: number): EmotionData[] =>
  emotions.filter(({ hour }) => hour !== undefined && hour >= start && hour < end);

const groupByMonth = (emotions: EmotionData[]): Map<string, number[]> => {
  const groups = new Map<string, number[]>();
  
  emotions.forEach(({ date, emotion }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });
  
  return groups;
};

const groupByStudent = (emotions: EmotionData[]): Map<number, number[]> => {
  const groups = new Map<number, number[]>();
  
  emotions.forEach(({ emotion, student }) => {
    const key = student ?? 0;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });
  
  return groups;
};

export const calculateMonthlyStats = (emotions: EmotionData[]) => 
  Array.from(groupByMonth(emotions).entries())
    .map(([month, monthEmotions]) => ({
      month,
      avgEmotion: average(monthEmotions),
      count: monthEmotions.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

export const calculateDayOfWeekStats = (emotions: EmotionData[]) => 
  UI_CONFIG.daysOfWeek.map(day => {
    const dayEmotions = emotions.filter(({ date }) => UI_CONFIG.daysOfWeek[date.getDay()] === day);
    return {
      day,
      avgEmotion: average(dayEmotions.map(e => e.emotion)),
      count: dayEmotions.length
    };
  });

export const calculateTimeOfDayStats = (emotions: EmotionData[]) => {
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

export const calculateEmotionDistribution = (emotions: EmotionData[]) => {
  const distribution = new Array(5).fill(0);
  emotions.forEach(({ emotion }) => {
    const index = Math.min(Math.max(Math.floor(emotion) - 1, 0), 4);
    distribution[index]++;
  });
  return distribution;
};

export const calculateStudentStats = (emotions: EmotionData[]) => 
  Array.from(groupByStudent(emotions).entries())
    .map(([student, studentEmotions]) => ({
      student: `学生${student + 1}`,
      recordCount: studentEmotions.length,
      avgEmotion: average(studentEmotions),
      trendline: calculateTrendline(studentEmotions)
    }))
    .sort((a, b) => a.student.localeCompare(b.student));

export const calculateTrendline = (emotions: number[]): number[] =>
  emotions.slice(-EMOTION_CALCULATION_PARAMS.TREND.TRENDLINE_WINDOW).map(score => Number((score || 0).toFixed(EMOTION_CALCULATION_PARAMS.DECIMAL_PRECISION)));

export const calculateEmotionTrend = (emotions: number[]): 'up' | 'down' | 'stable' => {
  if (emotions.length < 2) return 'stable';
  const recent = emotions.slice(-EMOTION_CALCULATION_PARAMS.TREND.RECENT_WINDOW);
  const earlier = emotions.slice(-EMOTION_CALCULATION_PARAMS.TREND.EARLIER_WINDOW_START, -EMOTION_CALCULATION_PARAMS.TREND.EARLIER_WINDOW_END);

  if (earlier.length === 0) return 'stable';

  const recentAvg = average(recent);
  const earlierAvg = average(earlier);
  const diff = recentAvg - earlierAvg;
  if (diff > EMOTION_CALCULATION_PARAMS.TREND.THRESHOLD) return 'up';
  if (diff < -EMOTION_CALCULATION_PARAMS.TREND.THRESHOLD) return 'down';
  return 'stable';
};