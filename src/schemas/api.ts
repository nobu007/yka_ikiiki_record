import { z } from 'zod';

// 基本的な統計情報のスキーマ
export const StatsOverviewSchema = z.object({
  count: z.number(),
  avgEmotion: z.number()
});

// 月別統計のスキーマ
export const MonthlyStatSchema = z.object({
  month: z.string(),
  count: z.number(),
  avgEmotion: z.number()
});

// 学生別統計のスキーマ
export const StudentStatSchema = z.object({
  student: z.string(),
  recordCount: z.number(),
  avgEmotion: z.number(),
  trendline: z.array(z.number())
});

// 曜日別統計のスキーマ
export const DayOfWeekStatSchema = z.object({
  day: z.string(),
  avgEmotion: z.number(),
  count: z.number()
});

// 時間帯別統計のスキーマ
export const TimeOfDayStatsSchema = z.object({
  morning: z.number(),
  afternoon: z.number(),
  evening: z.number()
});

// 全体の統計情報レスポンススキーマ
export const StatsResponseSchema = z.object({
  overview: StatsOverviewSchema,
  monthlyStats: z.array(MonthlyStatSchema),
  studentStats: z.array(StudentStatSchema),
  dayOfWeekStats: z.array(DayOfWeekStatSchema),
  emotionDistribution: z.array(z.number()),
  timeOfDayStats: TimeOfDayStatsSchema
});

// シード処理のレスポンススキーマ
export const SeedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional()
});

// 型定義のエクスポート
export type StatsOverview = z.infer<typeof StatsOverviewSchema>;
export type MonthlyStats = z.infer<typeof MonthlyStatSchema>;
export type DayOfWeekStats = z.infer<typeof DayOfWeekStatSchema>;
export type TimeOfDayStats = z.infer<typeof TimeOfDayStatsSchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;