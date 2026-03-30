import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createSuccessResponse } from "@/lib/api/response";
import { createStatsService } from "@/infrastructure/factories/repositoryFactory";
import { isPrismaProvider } from "@/lib/config/env";
import {
  dataService,
  DataGenerationConfig,
} from "@/infrastructure/services/dataService";
import { StatsData } from "@/schemas/api";
import { APP_CONFIG } from "@/lib/config";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { SUCCESS_MESSAGES } from "@/lib/constants/messages";
import { GENERATION_DEFAULTS, CACHE_CONSTANTS } from "@/lib/constants";
import { API_OPERATIONS } from "@/lib/constants/api";

const SeedRequestSchema = z.object({
  config: z.object({
    periodDays: z
      .number()
      .min(1)
      .max(365)
      .default(APP_CONFIG.generation.defaultPeriodDays),
    studentCount: z
      .number()
      .min(1)
      .max(100)
      .default(APP_CONFIG.generation.defaultStudentCount),
    distributionPattern: z
      .enum(["normal", "bimodal", "stress", "happy"])
      .default(APP_CONFIG.generation.defaultPattern),
    classCharacteristics: z
      .object({
        volatility: z
          .number()
          .min(0)
          .max(1)
          .default(GENERATION_DEFAULTS.VOLATILITY),
        baselineEmotion: z
          .number()
          .min(1)
          .max(5)
          .default(GENERATION_DEFAULTS.BASELINE_EMOTION),
      })
      .optional(),
    seasonalEffects: z.boolean().default(true),
    eventEffects: z
      .array(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
          impact: z.number().min(-1).max(1),
        }),
      )
      .default([]),
  }),
});

interface StoredData {
  data: StatsData;
  timestamp: number;
  config: DataGenerationConfig;
}

let storedData: StoredData | null = null;
const DATA_TTL = CACHE_CONSTANTS.DATA_TTL_MS;

const cleanupOldData = () => {
  if (storedData && Date.now() - storedData.timestamp > DATA_TTL) {
    storedData = null;
  }
};

if (process.env.NODE_ENV === "test") {
  module.exports.resetStoredData = () => {
    storedData = null;
  };

  module.exports.setStoredDataWithTimestamp = (timestamp: number) => {
    storedData = {
      data: {
        overview: { count: 100, avgEmotion: 3.5 },
        monthlyStats: [],
        studentStats: [],
        dayOfWeekStats: [],
        emotionDistribution: [10, 20, 40, 20, 10],
        timeOfDayStats: { morning: 3.2, afternoon: 3.5, evening: 3.0 },
      },
      timestamp,
      config: {
        studentCount: 20,
        periodDays: 30,
        distributionPattern: "normal",
        seasonalEffects: true,
        eventEffects: [],
      },
    };
  };

  module.exports.getStoredData = () => storedData;
  module.exports.cleanupOldData = cleanupOldData;
  module.exports.DATA_TTL = DATA_TTL;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      // Diagnostic logging for E2E test debugging (ISS-003 / PR-003)
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log('[DEBUG] Seed API: POST request received');
      }

      if (isPrismaProvider()) {
        const statsService = createStatsService();
        await statsService.generateSeedData();

        // Diagnostic logging for E2E test debugging (ISS-003 / PR-003)
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
          console.log('[DEBUG] Seed API: Prisma seed data generation complete');
        }

        return createSuccessResponse({
          success: true,
          message: SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE,
        });
      }

      const body = await req.json();
      const { config } = SeedRequestSchema.parse(body);

      // Diagnostic logging for E2E test debugging (ISS-003 / PR-003)
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log('[DEBUG] Seed API: Request config:', config);
      }

      const transformedConfig: DataGenerationConfig = {
        studentCount: config.studentCount,
        periodDays: config.periodDays,
        distributionPattern: config.distributionPattern,
        seasonalEffects: config.seasonalEffects,
        eventEffects: config.eventEffects,
        classCharacteristics: config.classCharacteristics || {
          volatility: GENERATION_DEFAULTS.VOLATILITY,
          baselineEmotion: GENERATION_DEFAULTS.BASELINE_EMOTION,
        },
      };

      const stats = dataService.generateStats(transformedConfig);
      storedData = {
        data: stats,
        timestamp: Date.now(),
        config: transformedConfig,
      };

      // Diagnostic logging for E2E test debugging (ISS-003 / PR-003)
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log('[DEBUG] Seed API: Data generation complete');
        console.log('[DEBUG] Seed API: Response message:', SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE);
      }

      return createSuccessResponse({
        success: true,
        message: SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE,
      });
    },
    {
      operationName: API_OPERATIONS.POST_SEED,
      timeoutMs: DEFAULT_TIMEOUTS.command,
    },
  );
}

export async function GET(): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      if (isPrismaProvider()) {
        const statsService = createStatsService();
        const stats = await statsService.getStats();

        return createSuccessResponse({
          success: true,
          data: stats,
        });
      }

      cleanupOldData();

      if (!storedData) {
        return NextResponse.json(
          {
            success: false,
            error: SUCCESS_MESSAGES.NO_DATA,
          },
          { status: 404 },
        );
      }

      return createSuccessResponse({
        success: true,
        data: storedData.data,
        metadata: {
          timestamp: storedData.timestamp,
          age: Date.now() - storedData.timestamp,
          config: storedData.config,
        },
      });
    },
    {
      operationName: API_OPERATIONS.GET_SEED,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
