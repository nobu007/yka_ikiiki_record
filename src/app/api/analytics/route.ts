import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import type { Record as RecordType } from "@/schemas/api";

const AnalyticsQuerySchema = z.object({
  student: z.string().optional(),
  months: z.coerce.number().min(1).max(24).default(12),
  granularity: z.enum(["day", "week", "month"]).default("week"),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = req.nextUrl.searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());
      const { student, months, granularity } =
        AnalyticsQuerySchema.parse(queryParams);

      const repository = createRecordRepository();
      const allRecords = await repository.findAll();

      const filteredRecords = student
        ? allRecords.filter((r) => r.student === student)
        : allRecords;

      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const recentRecords = filteredRecords.filter(
        (r) => new Date(r.date) >= cutoffDate,
      );

      const analytics = calculateAnalytics(recentRecords, granularity);

      return NextResponse.json(analytics, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    {
      operationName: API_OPERATIONS.GET_ANALYTICS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}

interface AnalyticsData {
  trend: Array<{
    period: string;
    avgEmotion: number;
    count: number;
  }>;
  summary: {
    overallAvg: number;
    totalRecords: number;
    emotionRange: { min: number; max: number };
    trendDirection: "up" | "down" | "stable";
  };
  distribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

function calculateAnalytics(
  records: RecordType[],
  granularity: "day" | "week" | "month",
): AnalyticsData {
  if (records.length === 0) {
    return {
      trend: [],
      summary: {
        overallAvg: 0,
        totalRecords: 0,
        emotionRange: { min: 0, max: 0 },
        trendDirection: "stable",
      },
      distribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
      },
    };
  }

  const grouped = groupByPeriod(records, granularity);
  const trend = Array.from(grouped.entries())
    .map(([period, recs]) => ({
      period,
      avgEmotion:
        recs.reduce((sum: number, r: RecordType) => sum + r.emotion, 0) /
        recs.length,
      count: recs.length,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const emotions = records.map((r) => r.emotion);
  const overallAvg = emotions.reduce((sum, e) => sum + e, 0) / emotions.length;
  const minEmotion = Math.min(...emotions);
  const maxEmotion = Math.max(...emotions);

  const trendDirection = calculateTrendDirection(trend);

  const distribution = {
    excellent: records.filter((r) => r.emotion >= 4.5).length,
    good: records.filter((r) => r.emotion >= 3.5 && r.emotion < 4.5).length,
    average: records.filter((r) => r.emotion >= 2.5 && r.emotion < 3.5).length,
    poor: records.filter((r) => r.emotion < 2.5).length,
  };

  return {
    trend,
    summary: {
      overallAvg: Math.round(overallAvg * 100) / 100,
      totalRecords: records.length,
      emotionRange: { min: minEmotion, max: maxEmotion },
      trendDirection,
    },
    distribution,
  };
}

function groupByPeriod(
  records: RecordType[],
  granularity: "day" | "week" | "month",
): Map<string, RecordType[]> {
  const grouped = new Map<string, RecordType[]>();

  for (const record of records) {
    const date = new Date(record.date);
    let key: string;

    if (granularity === "day") {
      const isoString = date.toISOString().split("T")[0];
      key = isoString ?? date.toISOString().slice(0, 10);
    } else if (granularity === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const isoString = weekStart.toISOString().split("T")[0];
      key = isoString ?? weekStart.toISOString().slice(0, 10);
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = grouped.get(key);
    if (existing) {
      existing.push(record);
    } else {
      grouped.set(key, [record]);
    }
  }

  return grouped;
}

function calculateTrendDirection(
  trend: Array<{ period: string; avgEmotion: number; count: number }>,
): "up" | "down" | "stable" {
  if (trend.length < 2) {
    return "stable";
  }

  const midPoint = Math.floor(trend.length / 2);
  const firstHalf = trend.slice(0, midPoint);
  const secondHalf = trend.slice(midPoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, t) => sum + t.avgEmotion, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, t) => sum + t.avgEmotion, 0) / secondHalf.length;

  const diff = secondHalfAvg - firstHalfAvg;

  if (diff > 0.2) {
    return "up";
  } else if (diff < -0.2) {
    return "down";
  } else {
    return "stable";
  }
}
