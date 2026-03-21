import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { createRecordRepository } from "@/infrastructure/factories/repositoryFactory";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_OPERATIONS } from "@/lib/constants/api";
import type { Record as RecordType } from "@/schemas/api";
import * as XLSX from "xlsx";

const ExportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  student: z.string().optional(),
  format: z.enum(["csv", "xlsx"]).default("csv"),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const searchParams = req.nextUrl.searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());
      const { startDate, endDate, student, format } =
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

      const timestamp = Date.now();

      if (format === "xlsx") {
        const excel = convertToExcel(records);
        return new NextResponse(Buffer.from(excel), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="records-${timestamp}.xlsx"`,
          },
        });
      }

      const csv = convertToCSV(records);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="records-${timestamp}.csv"`,
        },
      });
    },
    {
      operationName: API_OPERATIONS.EXPORT_RECORDS,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    },
  );
}

function convertToCSV(records: RecordType[]): string {
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

function convertToExcel(records: RecordType[]): Uint8Array {
  const headers = [
    "ID",
    "Emotion",
    "Date",
    "Student",
    "Comment",
    "CreatedAt",
    "UpdatedAt",
  ];

  const rows = records.map((record) => ({
    ID: record.id?.toString() || "",
    Emotion: record.emotion,
    Date: formatDate(record.date),
    Student: record.student,
    Comment: record.comment || "",
    CreatedAt: record.createdAt ? formatDate(record.createdAt) : "",
    UpdatedAt: record.updatedAt ? formatDate(record.updatedAt) : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet([headers.map((h) => ({ [h]: h })), ...rows], {
    skipHeader: true,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Uint8Array(excelBuffer);
}
