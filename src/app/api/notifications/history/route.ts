import { NextRequest, NextResponse } from "next/server";
import { withResilientHandler, createError } from "@/lib/api/error-handler";
import { createSuccessResponse } from "@/lib/api/response";
import { createNotificationService } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPriority,
} from "@/domain/entities/NotificationProvider";

interface NotificationHistoryQuery {
  channel?: NotificationChannel;
  status?: NotificationDeliveryStatus;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = request.nextUrl.searchParams;

      const query: NotificationHistoryQuery = {};

      const channel = searchParams.get("channel");
      if (channel) {
        const validChannel = Object.values(NotificationChannel).find(
          (value) => value === channel,
        );
        if (!validChannel) {
          throw createError.badRequest(`Invalid channel: ${channel}`);
        }
        query.channel = validChannel;
      }

      const status = searchParams.get("status");
      if (status) {
        const validStatus = Object.values(NotificationDeliveryStatus).find(
          (value) => value === status,
        );
        if (!validStatus) {
          throw createError.badRequest(`Invalid status: ${status}`);
        }
        query.status = validStatus;
      }

      const priority = searchParams.get("priority");
      if (priority) {
        const validPriority = Object.values(NotificationPriority).find(
          (value) => value === priority,
        );
        if (!validPriority) {
          throw createError.badRequest(`Invalid priority: ${priority}`);
        }
        query.priority = validPriority;
      }

      if (searchParams.get("limit")) {
        const limitStr = searchParams.get("limit")!;
        const limit = parseInt(limitStr, 10);
        if (isNaN(limit) || limit < 0) {
          throw createError.badRequest("Invalid limit value");
        }
        query.limit = limit;
      }

      if (searchParams.get("offset")) {
        const offsetStr = searchParams.get("offset")!;
        const offset = parseInt(offsetStr, 10);
        if (isNaN(offset) || offset < 0) {
          throw createError.badRequest("Invalid offset value");
        }
        query.offset = offset;
      }

      if (searchParams.get("startDate")) {
        const startDateStr = searchParams.get("startDate")!;
        const startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
          throw createError.badRequest("Invalid startDate value");
        }
        query.startDate = startDate;
      }

      if (searchParams.get("endDate")) {
        const endDateStr = searchParams.get("endDate")!;
        const endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          throw createError.badRequest("Invalid endDate value");
        }
        query.endDate = endDate;
      }

      const notificationService = createNotificationService();
      const history = await notificationService.getNotificationHistory(query);

      return createSuccessResponse(
        {
          success: true,
          data: history,
        },
        undefined,
      );
    },
    {
      operationName: API_OPERATIONS.GET_NOTIFICATION_HISTORY,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}
