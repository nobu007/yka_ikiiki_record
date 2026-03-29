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
  channel?: string;
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = request.nextUrl.searchParams;

      const query: NotificationHistoryQuery = {};

      if (searchParams.get("channel")) {
        const channel = searchParams.get("channel")!;
        if (!Object.values(NotificationChannel).includes(channel as NotificationChannel)) {
          throw createError.badRequest(`Invalid channel: ${channel}`);
        }
        query.channel = channel;
      }

      if (searchParams.get("status")) {
        const status = searchParams.get("status")!;
        if (!Object.values(NotificationDeliveryStatus).includes(status as NotificationDeliveryStatus)) {
          throw createError.badRequest(`Invalid status: ${status}`);
        }
        query.status = status;
      }

      if (searchParams.get("priority")) {
        const priority = searchParams.get("priority")!;
        if (!Object.values(NotificationPriority).includes(priority as NotificationPriority)) {
          throw createError.badRequest(`Invalid priority: ${priority}`);
        }
        query.priority = priority;
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
