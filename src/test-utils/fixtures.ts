import { Stats } from "@/domain/entities/Stats";

export const createEmptyStats = (): Stats => ({
  overview: { count: 0, avgEmotion: 0 },
  monthlyStats: [],
  studentStats: [],
  dayOfWeekStats: [],
  emotionDistribution: [],
  timeOfDayStats: { morning: 0, afternoon: 0, evening: 0 },
});

export const createValidStats = (overrides: Partial<Stats> = {}): Stats => ({
  overview: { count: 100, avgEmotion: 3.5 },
  monthlyStats: [],
  studentStats: [],
  dayOfWeekStats: [],
  emotionDistribution: [],
  timeOfDayStats: { morning: 10, afternoon: 20, evening: 30 },
  ...overrides,
});
