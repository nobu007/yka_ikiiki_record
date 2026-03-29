import { NextRequest, NextResponse } from "next/server";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createBackupService } from "@/infrastructure/factories/repositoryFactory";
import { createSuccessResponse, createError } from "@/lib/api/error-handler";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";

interface RestoreRequest {
  backupId: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      let body: RestoreRequest;

      try {
        body = await request.json();
      } catch {
        throw createError.badRequest("Invalid request body");
      }

      if (!body.backupId) {
        throw createError.badRequest("backupId is required");
      }

      const backupService = createBackupService();

      try {
        const result = await backupService.restoreBackup(body.backupId);

        return createSuccessResponse(
          {
            success: true,
            data: result,
          },
          undefined,
        );
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            throw createError.notFound(error.message);
          }
          if (error.message.includes("Cannot restore backup")) {
            throw createError.badRequest(error.message);
          }
        }
        throw error;
      }
    },
    {
      operationName: API_OPERATIONS.RESTORE_BACKUP,
      timeoutMs: DEFAULT_TIMEOUTS.database,
    },
  );
}
