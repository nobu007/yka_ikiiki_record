import { z } from 'zod';
import { Stats } from '@/domain/entities/Stats';

// 基本レスポンス型
const BaseResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional()
});

// 感情分布パターンの定義
export const EmotionDistributionPatternSchema = z.enum(['normal', 'bimodal', 'stress', 'happy']);

// イベント効果の定義
export const EventEffectSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  impact: z.number().min(-1).max(1)
});

// クラス特性の定義
export const ClassCharacteristicsSchema = z.object({
  baselineEmotion: z.number().min(2.5).max(3.5),
  volatility: z.number().min(0.1).max(1.0),
  cohesion: z.number().min(0.1).max(1.0)
});

// データ生成設定の定義
export const DataGenerationConfigSchema = z.object({
  studentCount: z.number().int().min(10).max(500),
  periodDays: z.number().int().min(7).max(365),
  distributionPattern: EmotionDistributionPatternSchema,
  seasonalEffects: z.boolean(),
  eventEffects: z.array(EventEffectSchema),
  classCharacteristics: ClassCharacteristicsSchema
});

// シード生成リクエストの定義
export const SeedRequestSchema = z.object({
  config: DataGenerationConfigSchema
});

// シード生成レスポンスの定義
export const SeedResponseSchema = BaseResponseSchema.extend({
  data: z.undefined(),
  message: z.string().optional()
});

// 統計データレスポンスの定義
export const StatsResponseSchema = BaseResponseSchema.extend({
  data: z.custom<Stats>()
});

// 型定義のエクスポート
export type EmotionDistributionPattern = z.infer<typeof EmotionDistributionPatternSchema>;
export type EventEffect = z.infer<typeof EventEffectSchema>;
export type ClassCharacteristics = z.infer<typeof ClassCharacteristicsSchema>;
export type DataGenerationConfig = z.infer<typeof DataGenerationConfigSchema>;
export type SeedRequest = z.infer<typeof SeedRequestSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;

// APIレスポンスの共通型
export type ApiResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
};