import { z } from "zod";
import { GENERATION_CONSTRAINTS, GENERATION_DEFAULTS } from "@/lib/constants";

const BaseResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const EmotionDistributionPatternSchema = z.enum([
  "normal",
  "bimodal",
  "stress",
  "happy",
]);

export const EventEffectSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  impact: z
    .number()
    .min(GENERATION_CONSTRAINTS.EVENT_IMPACT.MIN)
    .max(GENERATION_CONSTRAINTS.EVENT_IMPACT.MAX),
});

export const ClassCharacteristicsSchema = z.object({
  baselineEmotion: z
    .number()
    .min(GENERATION_CONSTRAINTS.BASELINE_EMOTION.MIN)
    .max(GENERATION_CONSTRAINTS.BASELINE_EMOTION.MAX),
  volatility: z
    .number()
    .min(GENERATION_CONSTRAINTS.VOLATILITY.MIN)
    .max(GENERATION_CONSTRAINTS.VOLATILITY.MAX),
  cohesion: z
    .number()
    .min(GENERATION_CONSTRAINTS.COHESION.MIN)
    .max(GENERATION_CONSTRAINTS.COHESION.MAX),
});

export const DataGenerationConfigSchema = z.object({
  studentCount: z
    .number()
    .int()
    .min(GENERATION_CONSTRAINTS.STUDENT_COUNT.MIN)
    .max(GENERATION_CONSTRAINTS.STUDENT_COUNT.MAX),
  periodDays: z
    .number()
    .int()
    .min(GENERATION_CONSTRAINTS.PERIOD_DAYS.MIN)
    .max(GENERATION_CONSTRAINTS.PERIOD_DAYS.MAX),
  distributionPattern: EmotionDistributionPatternSchema,
  seasonalEffects: z.boolean(),
  eventEffects: z.array(EventEffectSchema),
  classCharacteristics: ClassCharacteristicsSchema,
});

export const SeedRequestSchema = z.object({
  config: DataGenerationConfigSchema,
});

export const SeedResponseSchema = BaseResponseSchema.extend({
  message: z.string().optional(),
});

const StatsOverviewSchema = z.object({
  count: z.number().int().nonnegative(),
  avgEmotion: z.number().min(1).max(5),
});

const MonthlyStatsSchema = z.object({
  month: z.string(),
  count: z.number().int().nonnegative(),
  avgEmotion: z.number().min(1).max(5),
});

const StudentStatsSchema = z.object({
  student: z.string(),
  recordCount: z.number().int().nonnegative(),
  avgEmotion: z.number().min(1).max(5),
  trendline: z.array(z.number()),
});

const DayOfWeekStatsSchema = z.object({
  day: z.string(),
  avgEmotion: z.number().min(1).max(5),
  count: z.number().int().nonnegative(),
});

const TimeOfDayStatsSchema = z.object({
  morning: z.number().min(1).max(5),
  afternoon: z.number().min(1).max(5),
  evening: z.number().min(1).max(5),
});

const StatsDataSchema = z.object({
  overview: StatsOverviewSchema,
  monthlyStats: z.array(MonthlyStatsSchema),
  studentStats: z.array(StudentStatsSchema),
  dayOfWeekStats: z.array(DayOfWeekStatsSchema),
  emotionDistribution: z.array(z.number()),
  timeOfDayStats: TimeOfDayStatsSchema,
});

export const StatsResponseSchema = BaseResponseSchema.extend({
  data: StatsDataSchema,
});

export const DEFAULT_CONFIG: DataGenerationConfig = {
  studentCount: GENERATION_DEFAULTS.STUDENT_COUNT,
  periodDays: GENERATION_DEFAULTS.PERIOD_DAYS,
  distributionPattern: "normal",
  seasonalEffects: false,
  eventEffects: [],
  classCharacteristics: {
    baselineEmotion: GENERATION_DEFAULTS.BASELINE_EMOTION,
    volatility: GENERATION_DEFAULTS.VOLATILITY,
    cohesion: GENERATION_DEFAULTS.COHESION,
  },
} as const;

export type EmotionDistributionPattern = z.infer<
  typeof EmotionDistributionPatternSchema
>;
export type EventEffect = z.infer<typeof EventEffectSchema>;
export type ClassEvent = EventEffect;
export type ClassCharacteristics = z.infer<typeof ClassCharacteristicsSchema>;
export type DataGenerationConfig = z.infer<typeof DataGenerationConfigSchema>;
export type SeedRequest = z.infer<typeof SeedRequestSchema>;
export type SeedResponse = z.infer<typeof SeedResponseSchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
export type StatsData = z.infer<typeof StatsDataSchema>;

export type ApiResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
};
