import { z } from 'zod';
import { Stats } from '@/domain/entities/Stats';

const BaseResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional()
});

export const EmotionDistributionPatternSchema = z.enum(['normal', 'bimodal', 'stress', 'happy']);

export const EventEffectSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  impact: z.number().min(-1).max(1)
});

export const ClassCharacteristicsSchema = z.object({
  baselineEmotion: z.number().min(2.5).max(3.5),
  volatility: z.number().min(0.1).max(1.0),
  cohesion: z.number().min(0.1).max(1.0)
});

export const DataGenerationConfigSchema = z.object({
  studentCount: z.number().int().min(10).max(500),
  periodDays: z.number().int().min(7).max(365),
  distributionPattern: EmotionDistributionPatternSchema,
  seasonalEffects: z.boolean(),
  eventEffects: z.array(EventEffectSchema),
  classCharacteristics: ClassCharacteristicsSchema
});

export const SeedRequestSchema = z.object({
  config: DataGenerationConfigSchema
});

export const SeedResponseSchema = BaseResponseSchema.extend({
  data: z.undefined(),
  message: z.string().optional()
});

export const StatsResponseSchema = BaseResponseSchema.extend({
  data: z.custom<Stats>()
});

export type EmotionDistributionPattern = z.infer<typeof EmotionDistributionPatternSchema>;
export type EventEffect = z.infer<typeof EventEffectSchema>;
export type ClassCharacteristics = z.infer<typeof ClassCharacteristicsSchema>;
export type DataGenerationConfig = z.infer<typeof DataGenerationConfigSchema>;
export type SeedRequest = z.infer<typeof SeedRequestSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;

export type ApiResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
};