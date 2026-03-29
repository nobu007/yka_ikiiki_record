import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";
import { createTrendAnalysisRepository } from "@/infrastructure/factories/repositoryFactory";
import { TrendAnalysisService } from "@/application/services/TrendAnalysisService";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";

const TrendsQuerySchema = z.object({
  type: z.enum(["student", "class"]).default("student"),
  student: z.string().optional(),
  class: z.string().optional(),
  direction: z.enum(["up", "down", "stable"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/trends
 *
 * Retrieves trend analysis data for students or classes.
 *
 * Query parameters:
 * - type: "student" | "class" (default: "student")
 * - student: Filter by student name (partial match, case-insensitive)
 * - class: Filter by class name (partial match, case-insensitive)
 * - direction: Filter by trend direction ("up" | "down" | "stable")
 * - startDate: ISO date string to filter trends starting from this date
 * - endDate: ISO date string to filter trends ending before this date
 * - limit: Maximum number of results to return (1-100, default: 50)
 * - offset: Number of results to skip for pagination (default: 0)
 *
 * Returns JSON with trend analysis data including:
 * - For type=student: Array of StudentTrendAnalysis with metrics
 * - For type=class: Array of ClassTrendAnalysis with aggregated metrics
 *
 * @example
 * ```bash
 * # Get all student trends
 * curl "http://localhost:3000/api/trends?type=student"
 *
 * # Get trends for a specific student
 * curl "http://localhost:3000/api/trends?type=student&student=Alice"
 *
 * # Get class trends with upward direction
 * curl "http://localhost:3000/api/trends?type=class&direction=up"
 *
 * # Get trends with date range and pagination
 * curl "http://localhost:3000/api/trends?startDate=2026-03-01&endDate=2026-03-31&limit=20&offset=0"
 * ```
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = req.nextUrl.searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());
      const { type, student, class: className, direction, startDate, endDate, limit, offset } =
        TrendsQuerySchema.parse(queryParams);

      const recordRepository = createRecordRepository();
      const trendRepository = createTrendAnalysisRepository();
      const trendService = new TrendAnalysisService(trendRepository);

      const allRecords = await recordRepository.findAll();

      if (type === "student") {
        return await handleStudentTrends(
          allRecords,
          student,
          direction,
          startDate,
          endDate,
          limit,
          offset,
          trendService,
          trendRepository,
        );
      }

      return await handleClassTrends(
        allRecords,
        className,
        direction,
        startDate,
        endDate,
        limit,
        offset,
        trendService,
        trendRepository,
      );
    },
    {
      operationName: API_OPERATIONS.GET_TRENDS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}

async function handleStudentTrends(
  allRecords: Awaited<ReturnType<typeof createRecordRepository> extends { findAll: () => Promise<infer T> } ? T : never>,
  student: string | undefined,
  direction: "up" | "down" | "stable" | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  limit: number,
  offset: number,
  trendService: TrendAnalysisService,
  trendRepository: Awaited<ReturnType<typeof createTrendAnalysisRepository>>,
): Promise<NextResponse> {
  if (!allRecords || allRecords.length === 0) {
    return NextResponse.json(
      {
        type: "student",
        trends: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const studentsToAnalyze = student
    ? Array.from(new Set(allRecords.filter((r) => r.student.includes(student)).map((r) => r.student)))
    : Array.from(new Set(allRecords.map((r) => r.student)));

  if (studentsToAnalyze.length === 0) {
    return NextResponse.json(
      {
        type: "student",
        trends: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const trendAnalyses = [];

  for (const studentName of studentsToAnalyze) {
    const studentRecords = allRecords.filter((r) => r.student === studentName);

    if (studentRecords.length === 0) {
      continue;
    }

    const existingTrend = await trendRepository.getStudentTrend(studentName);

    if (existingTrend) {
      trendAnalyses.push(existingTrend);
    } else {
      const recordsForTrend = studentRecords.map((r) => ({
        date: new Date(r.date),
        emotion: r.emotion,
      }));

      try {
        const analysis = await trendService.analyzeStudentTrend(studentName, recordsForTrend);
        await trendRepository.saveStudentTrend(analysis);
        trendAnalyses.push(analysis);
      } catch {
        continue;
      }
    }
  }

  let filteredTrends = trendAnalyses;

  if (direction) {
    filteredTrends = filteredTrends.filter((t) => t.metrics.trendDirection === direction);
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredTrends = filteredTrends.filter((t) =>
      t.dataPoints.some((dp) => dp.date >= start),
    );
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredTrends = filteredTrends.filter((t) =>
      t.dataPoints.some((dp) => dp.date <= end),
    );
  }

  const totalCount = filteredTrends.length;
  const paginatedTrends = filteredTrends.slice(offset, offset + limit);

  return NextResponse.json(
    {
      type: "student",
      trends: paginatedTrends,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

async function handleClassTrends(
  allRecords: Awaited<ReturnType<typeof createRecordRepository> extends { findAll: () => Promise<infer T> } ? T : never>,
  className: string | undefined,
  direction: "up" | "down" | "stable" | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  limit: number,
  offset: number,
  trendService: TrendAnalysisService,
  trendRepository: Awaited<ReturnType<typeof createTrendAnalysisRepository>>,
): Promise<NextResponse> {
  if (!allRecords || allRecords.length === 0) {
    return NextResponse.json(
      {
        type: "class",
        trends: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const classesToAnalyze = className
    ? Array.from(new Set(allRecords.filter((r) => (r.class || "Unknown").includes(className)).map((r) => r.class || "Unknown")))
    : Array.from(new Set(allRecords.map((r) => r.class || "Unknown")));

  if (classesToAnalyze.length === 0) {
    return NextResponse.json(
      {
        type: "class",
        trends: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const trendAnalyses = [];

  for (const currentClassName of classesToAnalyze) {
    const classRecords = allRecords.filter((r) => r.class === currentClassName || (r.class === undefined && currentClassName === "Unknown"));

    if (classRecords.length === 0) {
      continue;
    }

    const existingTrend = await trendRepository.getClassTrend(currentClassName);

    if (existingTrend) {
      trendAnalyses.push(existingTrend);
    } else {
      const studentsInClass = Array.from(new Set(classRecords.map((r) => r.student)));
      const studentAnalyses = [];

      for (const studentName of studentsInClass) {
        const studentRecords = classRecords.filter((r) => r.student === studentName);

        if (studentRecords.length === 0) {
          continue;
        }

        const recordsForTrend = studentRecords.map((r) => ({
          date: new Date(r.date),
          emotion: r.emotion,
        }));

        try {
          const analysis = await trendService.analyzeStudentTrend(studentName, recordsForTrend);
          studentAnalyses.push(analysis);
        } catch {
          continue;
        }
      }

      if (studentAnalyses.length === 0) {
        continue;
      }

      try {
        const classAnalysis = await trendService.analyzeClassTrend(currentClassName, studentAnalyses);
        await trendRepository.saveClassTrend(classAnalysis);
        trendAnalyses.push(classAnalysis);
      } catch {
        continue;
      }
    }
  }

  let filteredTrends = trendAnalyses;

  if (direction) {
    filteredTrends = filteredTrends.filter((t) => t.metrics.trendDirection === direction);
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredTrends = filteredTrends.filter((t) =>
      t.studentAnalyses.some((sa) =>
        sa.dataPoints.some((dp) => dp.date >= start),
      ),
    );
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredTrends = filteredTrends.filter((t) =>
      t.studentAnalyses.some((sa) =>
        sa.dataPoints.some((dp) => dp.date <= end),
      ),
    );
  }

  const totalCount = filteredTrends.length;
  const paginatedTrends = filteredTrends.slice(offset, offset + limit);

  return NextResponse.json(
    {
      type: "class",
      trends: paginatedTrends,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
