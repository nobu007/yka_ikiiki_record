import { NextRequest, NextResponse } from "next/server";
import { withResilientHandler, createError } from "@/lib/api/error-handler";
import { createSuccessResponse } from "@/lib/api/response";
import { createBackupService } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import type { BackupMetadata } from "@/domain/entities/Backup";

interface CreateBackupRequest {
  source?: string;
  entities?: string[];
  correlationId?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      let body: CreateBackupRequest;

      try {
        body = await request.json();
      } catch {
        throw createError.badRequest("Invalid request body");
      }

      const metadata: BackupMetadata = {
        source: body.source ?? "manual",
        entities: body.entities ?? ["Record", "Stats", "AuditLog"],
        correlationId: body.correlationId,
      };

      const backupService = createBackupService();
      const backup = await backupService.createBackup(metadata, "api-user");

      return createSuccessResponse(
        {
          success: true,
          data: backup,
        },
        undefined,
      );
    },
    {
      operationName: API_OPERATIONS.CREATE_BACKUP,
      timeoutMs: DEFAULT_TIMEOUTS.database,
    },
  );
}

interface BackupQuery {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = request.nextUrl.searchParams;

      const query: BackupQuery = {};
      if (searchParams.get("status")) {
        query.status = searchParams.get("status")!;
      }
      if (searchParams.get("source")) {
        query.source = searchParams.get("source")!;
      }
      if (searchParams.get("limit")) {
        query.limit = parseInt(searchParams.get("limit")!, 10);
      }
      if (searchParams.get("offset")) {
        query.offset = parseInt(searchParams.get("offset")!, 10);
      }

      const backupService = createBackupService();
      const backups = await backupService.listBackups(query);

      return createSuccessResponse(
        {
          success: true,
          data: backups,
        },
        undefined,
      );
    },
    {
      operationName: API_OPERATIONS.LIST_BACKUPS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
