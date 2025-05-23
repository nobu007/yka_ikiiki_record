import { z } from 'zod';

// 基本的な統計情報のスキーマ
export const StatsOverviewSchema = z.object({
  count: z.number(),
  avgEmotion: z.number(),
});

// 月別統計のスキーマ
export const MonthlyStatSchema = z.object({
  month: z.string(),
  avgEmotion: z.number(),
});

// 曜日別統計のスキーマ
export const DayOfWeekStatSchema = z.object({
  day: z.string(),
  avgEmotion: z.number(),
});

// 時間帯別統計のスキーマ
export const TimeOfDayStatsSchema = z.object({
  morning: z.number(),
  afternoon: z.number(),
  evening: z.number(),
});

// 全体の統計情報レスポンススキーマ
export const StatsResponseSchema = z.object({
  overview: StatsOverviewSchema,
  monthlyStats: z.array(MonthlyStatSchema),
  dayOfWeekStats: z.array(DayOfWeekStatSchema),
  timeOfDayStats: TimeOfDayStatsSchema,
});

// シード処理のレスポンススキーマ
export const SeedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// 型定義のエクスポート
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;