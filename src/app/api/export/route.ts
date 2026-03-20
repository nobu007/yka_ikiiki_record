import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import type { Record } from "@/schemas/api";

const ExportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  student: z.string().optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = req.nextUrl.searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());
      const { startDate, endDate, student } =
        ExportQuerySchema.parse(queryParams);

      const repository = createRecordRepository();
      let records;

      if (startDate && endDate) {
        records = await repository.findByDateRange(
          new Date(startDate),
          new Date(endDate),
        );
      } else if (student) {
        records = await repository.findByStudent(student);
      } else {
        records = await repository.findAll();
      }

      const csv = convertToCSV(records);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="records-${Date.now()}.csv"`,
        },
      });
    },
    {
      operationName: API_OPERATIONS.EXPORT_RECORDS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}

function convertToCSV(records: Record[]): string {
  if (records.length === 0) {
    return "ID,Emotion,Date,Student,Comment,CreatedAt,UpdatedAt\n";
  }

  const headers = [
    "ID",
    "Emotion",
    "Date",
    "Student",
    "Comment",
    "CreatedAt",
    "UpdatedAt",
  ];
  const rows = records.map((record) => [
    record.id?.toString() || "",
    record.emotion.toString(),
    formatDate(record.date),
    escapeCSV(record.student),
    escapeCSV(record.comment || ""),
    record.createdAt ? formatDate(record.createdAt) : "",
    record.updatedAt ? formatDate(record.updatedAt) : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  const isoString = date.toISOString();
  const parts = isoString.split("T");
  return parts[0] ?? isoString;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
