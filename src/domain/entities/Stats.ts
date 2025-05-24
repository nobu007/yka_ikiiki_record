/**
 * 感情記録の統計情報に関するドメインエンティティ
 */

export interface StatsOverview {
  count: number;
  avgEmotion: number;
}

export interface MonthlyStats {
  month: string;
  count: number;
  avgEmotion: number;
}

export interface StudentStats {
  student: string;
  recordCount: number;
  avgEmotion: number;
  trendline: number[];
}

export interface DayOfWeekStats {
  day: string;
  avgEmotion: number;
  count: number;
}

export interface TimeOfDayStats {
  morning: number;
  afternoon: number;
  evening: number;
}

export interface Stats {
  overview: StatsOverview;
  monthlyStats: MonthlyStats[];
  studentStats: StudentStats[];
  dayOfWeekStats: DayOfWeekStats[];
  emotionDistribution: number[];
  timeOfDayStats: TimeOfDayStats;
}