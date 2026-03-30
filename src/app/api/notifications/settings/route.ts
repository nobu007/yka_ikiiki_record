import { NextRequest, NextResponse } from "next/server";
import { withResilientHandler, createError } from "@/lib/api/error-handler";
import { createSuccessResponse } from "@/lib/api/response";
import { createNotificationService } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import type { NotificationConfig } from "@/domain/entities/NotificationProvider";

interface UpdateSettingsRequest {
  enabled?: boolean;
  channels?: string[];
  priorities?: Record<string, string>;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  rateLimits?: {
    maxPerHour: number;
    maxPerDay: number;
  };
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const notificationService = createNotificationService();
      const settings = notificationService.getNotificationSettings();

      return createSuccessResponse(
        {
          success: true,
          data: settings,
        },
        undefined,
      );
    },
    {
      operationName: API_OPERATIONS.GET_NOTIFICATION_SETTINGS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      let body: UpdateSettingsRequest;

      try {
        body = await request.json();
      } catch {
        throw createError.badRequest("Invalid request body");
      }

      const notificationService = createNotificationService();

      try {
        notificationService.updateConfig(body as NotificationConfig);
      } catch (error) {
        if (error instanceof Error) {
          throw createError.badRequest(
            `Invalid settings: ${error.message}`,
          );
        }
        throw createError.badRequest("Invalid settings");
      }

      const updatedSettings = notificationService.getNotificationSettings();

      return createSuccessResponse(
        {
          success: true,
          data: updatedSettings,
        },
        undefined,
      );
    },
    {
      operationName: API_OPERATIONS.UPDATE_NOTIFICATION_SETTINGS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
