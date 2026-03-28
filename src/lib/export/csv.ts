import { type StatsData } from "@/schemas/api";

export interface CsvExportOptions {
  includeHeaders?: boolean;
  separator?: string;
  dateFormat?: "ISO" | "JP";
}

function formatDate(date: Date, format: "ISO" | "JP"): string {
  if (format === "ISO") {
    return date.toISOString().split("T")[0] ?? date.toISOString();
  }
  return date.toLocaleDateString("ja-JP");
}

function escapeCSVValue(value: string): string {
  const needsQuotes = value.includes(",") || value.includes('"') || value.includes("\n");
  if (!needsQuotes) {
    return value;
  }
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function convertStatsToCsvRows(
  data: StatsData,
  options: CsvExportOptions
): string[][] {
  const rows: string[][] = [];

  if (options.includeHeaders !== false) {
    rows.push(["Section", "Key", "Value"]);
  }

  rows.push(["Overview", "Record Count", data.overview.count.toString()]);
  rows.push([
    "Overview",
    "Average Emotion",
    data.overview.avgEmotion.toFixed(2),
  ]);

  data.monthlyStats.forEach((stat) => {
    rows.push([
      "Monthly Stats",
      escapeCSVValue(stat.month),
      `${stat.count},${stat.avgEmotion.toFixed(2)}`,
    ]);
  });

  data.dayOfWeekStats.forEach((stat) => {
    rows.push([
      "Day of Week",
      escapeCSVValue(stat.day),
      `${stat.count},${stat.avgEmotion.toFixed(2)}`,
    ]);
  });

  data.studentStats.forEach((stat) => {
    rows.push([
      "Student",
      escapeCSVValue(stat.student),
      `${stat.recordCount},${stat.avgEmotion.toFixed(2)}`,
    ]);
  });

  rows.push([
    "Time of Day",
    "Morning",
    data.timeOfDayStats.morning.toFixed(2),
  ]);
  rows.push([
    "Time of Day",
    "Afternoon",
    data.timeOfDayStats.afternoon.toFixed(2),
  ]);
  rows.push([
    "Time of Day",
    "Evening",
    data.timeOfDayStats.evening.toFixed(2),
  ]);

  return rows;
}

export function exportStatsToCSV(
  data: StatsData,
  options: CsvExportOptions = {}
): string {
  const rows = convertStatsToCsvRows(data, options);
  return rows.map((row) => row.join(options.separator || ",")).join("\n");
}

export function generateCSVFilename(
  prefix: string = "stats",
  format: "ISO" | "JP" = "ISO"
): string {
  const now = new Date();
  const dateStr = formatDate(now, format);
  const timeStr = (now.toTimeString().split(" ")[0] ?? "00-00-00").replace(/:/g, "-");
  return `${prefix}_${dateStr}_${timeStr}.csv`;
}
