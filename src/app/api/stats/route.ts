import { NextRequest, NextResponse } from "next/server";
import { StatsResponseSchema } from "@/schemas/api";
import { createSuccessResponse } from "@/lib/api/response";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createStatsService } from "@/infrastructure/factories/repositoryFactory";
import { createError } from "@/lib/api/error-handler";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";

export async function GET(req: NextRequest): Promise<NextResponse> { // eslint-disable-line @typescript-eslint/no-unused-vars
  return withResilientHandler(
    async () => {
      const statsService = createStatsService();
      const stats = await statsService.getStats();

      if (!stats) {
        throw createError.notFound("統計データが見つかりません");
      }

      const response = {
        success: true,
        data: stats,
      };
      return createSuccessResponse(response, StatsResponseSchema);
    },
    {
      operationName: API_OPERATIONS.GET_STATS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
