import {
  exportStatsToCSV,
  generateCSVFilename,
  type CsvExportOptions,
} from "./csv";
import { type StatsData } from "@/schemas/api";

describe("CSV Export Utility", () => {
  const mockStatsData: StatsData = {
    overview: {
      count: 100,
      avgEmotion: 3.5,
    },
    monthlyStats: [
      { month: "2024-01", count: 30, avgEmotion: 3.2 },
      { month: "2024-02", count: 40, avgEmotion: 3.8 },
    ],
    studentStats: [
      {
        student: "Test Student",
        recordCount: 10,
        avgEmotion: 3.5,
        trendline: [3, 3.5, 4],
      },
    ],
    dayOfWeekStats: [
      { day: "Monday", avgEmotion: 3.4, count: 15 },
      { day: "Tuesday", avgEmotion: 3.6, count: 20 },
    ],
    emotionDistribution: [10, 20, 30, 25, 15],
    timeOfDayStats: {
      morning: 3.3,
      afternoon: 3.6,
      evening: 3.4,
    },
  };

  describe("exportStatsToCSV", () => {
    it("should export stats data to CSV format with headers", () => {
      const csv = exportStatsToCSV(mockStatsData);
      const lines = csv.split("\n");

      expect(lines[0]).toBe("Section,Key,Value");
      expect(lines[1]).toBe("Overview,Record Count,100");
      expect(lines[2]).toBe("Overview,Average Emotion,3.50");
    });

    it("should include monthly stats in CSV", () => {
      const csv = exportStatsToCSV(mockStatsData);
      const lines = csv.split("\n");

      expect(lines).toContainEqual("Monthly Stats,2024-01,30,3.20");
      expect(lines).toContainEqual("Monthly Stats,2024-02,40,3.80");
    });

    it("should include student stats in CSV", () => {
      const csv = exportStatsToCSV(mockStatsData);
      expect(csv).toContain("Student,Test Student,10,3.50");
    });

    it("should include day of week stats in CSV", () => {
      const csv = exportStatsToCSV(mockStatsData);
      expect(csv).toContain("Day of Week,Monday,15,3.40");
      expect(csv).toContain("Day of Week,Tuesday,20,3.60");
    });

    it("should include time of day stats in CSV", () => {
      const csv = exportStatsToCSV(mockStatsData);
      const lines = csv.split("\n");

      expect(lines).toContainEqual("Time of Day,Morning,3.30");
      expect(lines).toContainEqual("Time of Day,Afternoon,3.60");
      expect(lines).toContainEqual("Time of Day,Evening,3.40");
    });

    it("should handle special characters in values by quoting", () => {
      const dataWithSpecialChars: StatsData = {
        ...mockStatsData,
        studentStats: [
          {
            student: 'Student, "Test"',
            recordCount: 5,
            avgEmotion: 3.0,
            trendline: [],
          },
        ],
      };

      const csv = exportStatsToCSV(dataWithSpecialChars);
      expect(csv).toContain('Student,"Student, ""Test""",5,3.00');
    });

    it("should export without headers when requested", () => {
      const options: CsvExportOptions = { includeHeaders: false };
      const csv = exportStatsToCSV(mockStatsData, options);
      const lines = csv.split("\n");

      expect(lines[0]).not.toContain("Section");
      expect(lines[0]).toBe("Overview,Record Count,100");
    });

    it("should support custom separator", () => {
      const options: CsvExportOptions = { separator: ";" };
      const csv = exportStatsToCSV(mockStatsData, options);

      expect(csv).toContain("Section;Key;Value");
      expect(csv).toContain("Overview;Record Count;100");
    });

    it("should handle empty monthly stats", () => {
      const emptyData: StatsData = {
        ...mockStatsData,
        monthlyStats: [],
      };

      const csv = exportStatsToCSV(emptyData);
      expect(csv).toBeTruthy();
      expect(csv.length).toBeGreaterThan(0);
    });

    it("should handle empty student stats", () => {
      const emptyData: StatsData = {
        ...mockStatsData,
        studentStats: [],
      };

      const csv = exportStatsToCSV(emptyData);
      expect(csv).toBeTruthy();
      expect(csv.length).toBeGreaterThan(0);
    });
  });

  describe("generateCSVFilename", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date("2024-03-29T10:30:00Z"));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should generate filename with ISO date format by default", () => {
      const filename = generateCSVFilename();
      expect(filename).toMatch(/^stats_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/);
    });

    it("should generate filename with custom prefix", () => {
      const filename = generateCSVFilename("export");
      expect(filename).toMatch(/^export_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/);
    });

    it("should support JP date format", () => {
      const filename = generateCSVFilename("stats", "JP");
      expect(filename).toMatch(/^stats_.*\.csv$/);
      expect(filename).toContain("2024");
    });
  });
});
