import { z } from 'zod';
import { Stats } from '@/domain/entities/Stats';

// 基本レスポンス型
const BaseResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional()
});

// 感情分布パターンの定義
const EmotionDistributionPatternSchema = z.enum(['normal', 'bimodal', 'stress', 'happy']);

// イベント効果の定義
const EventEffectSchema = z.object({
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  impact: z.number().min(-1).max(1)
});

// クラス特性の定義
const ClassCharacteristicsSchema = z.object({
  baselineEmotion: z.number().min(2.5).max(3.5),
  volatility: z.number().min(0.1).max(1.0),
  cohesion: z.number().min(0.1).max(1.0)
});

// データ生成設定の定義
export const DataGenerationConfigSchema = z.object({
  studentCount: z.number().min(10).max(500),
  periodDays: z.number().min(7).max(365),
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
  data: z.undefined()
});

// 統計データレスポンスの定義
export const StatsResponseSchema = BaseResponseSchema.extend({
  data: z.custom<Stats>()
});

// 型定義のエクスポート
export type SeedRequest = z.infer<typeof SeedRequestSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;