import { EMOTION_RANGES, EMOTION_CALCULATION_PARAMS } from "@/lib/constants";
import { UI_CONFIG } from "@/lib/config";
import { average } from "./math";
import type { EmotionData } from "./generation";

/**
 * Calculates the average of emotion values from an array of EmotionData.
 *
 * @param emotions - Array of emotion data objects.
 * @returns The average emotion value, or 0 if array is empty.
 */
const averageEmotion = (emotions: EmotionData[]): number =>
  average(emotions.map((e) => e.emotion));

/**
 * Filters emotion data by hour range.
 *
 * @param emotions - Array of emotion data with optional hour field.
 * @param start - Start hour (inclusive).
 * @param end - End hour (exclusive).
 * @returns Filtered array containing only records within the hour range.
 */
const filterByTimeRange = (
  emotions: EmotionData[],
  start: number,
  end: number,
): EmotionData[] =>
  emotions.filter(
    ({ hour }) => hour !== undefined && hour >= start && hour < end,
  );

/**
 * Groups emotion data by year-month.
 *
 * @param emotions - Array of emotion data with dates.
 * @returns Map with "YYYY-MM" keys and arrays of emotion values.
 */
const groupByMonth = (emotions: EmotionData[]): Map<string, number[]> => {
  const groups = new Map<string, number[]>();

  emotions.forEach(({ date, emotion }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });

  return groups;
};

/**
 * Groups emotion data by student ID.
 *
 * @param emotions - Array of emotion data with optional student field.
 * @returns Map with student ID keys and arrays of emotion values.
 */
const groupByStudent = (emotions: EmotionData[]): Map<number, number[]> => {
  const groups = new Map<number, number[]>();

  emotions.forEach(({ emotion, student }) => {
    const key = student ?? 0;
    const values = groups.get(key) || [];
    values.push(emotion);
    groups.set(key, values);
  });

  return groups;
};

/**
 * Calculates monthly statistics from emotion data.
 *
 * Groups records by month and computes average emotion and count
 * for each month. Results are sorted chronologically.
 *
 * @param emotions - Array of emotion data with dates.
 * @returns Array of monthly stats sorted by month (YYYY-MM format).
 *
 * @example
 * ```ts
 * const data = [
 *   { date: new Date("2024-01-15"), emotion: 50 },
 *   { date: new Date("2024-01-20"), emotion: 60 },
 *   { date: new Date("2024-02-10"), emotion: 55 }
 * ];
 * calculateMonthlyStats(data);
 * // Returns: [
 * //   { month: "2024-01", avgEmotion: 55, count: 2 },
 * //   { month: "2024-02", avgEmotion: 55, count: 1 }
 * // ]
 * ```
 */
export const calculateMonthlyStats = (emotions: EmotionData[]) =>
  Array.from(groupByMonth(emotions).entries())
    .map(([month, monthEmotions]) => ({
      month,
      avgEmotion: average(monthEmotions),
      count: monthEmotions.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

/**
 * Calculates day-of-week statistics from emotion data.
 *
 * Computes average emotion and record count for each day of the week,
 * maintaining the order defined in UI_CONFIG.
 *
 * @param emotions - Array of emotion data with dates.
 * @returns Array of stats for each day of the week.
 *
 * @example
 * ```ts
 * calculateDayOfWeekStats(data);
 * // Returns: [
 * //   { day: "月", avgEmotion: 52.5, count: 10 },
 * //   { day: "火", avgEmotion: 55.0, count: 8 },
 * //   ... (for all 7 days)
 * // ]
 * ```
 */
export const calculateDayOfWeekStats = (emotions: EmotionData[]) =>
  UI_CONFIG.daysOfWeek.map((day) => {
    const dayEmotions = emotions.filter(
      ({ date }) => UI_CONFIG.daysOfWeek[date.getDay()] === day,
    );
    return {
      day,
      avgEmotion: averageEmotion(dayEmotions),
      count: dayEmotions.length,
    };
  });

/**
 * Calculates time-of-day statistics from emotion data.
 *
 * Groups records into morning, afternoon, and evening time periods
 * based on configured time ranges. Evening includes late night hours
 * (0 to morning start).
 *
 * @param emotions - Array of emotion data with optional hour field.
 * @returns Object with average emotion for each time period.
 *
 * @example
 * ```ts
 * calculateTimeOfDayStats(data);
 * // Returns: {
 * //   morning: 48.5,
 * //   afternoon: 52.3,
 * //   evening: 55.1
 * // }
 * ```
 */
export const calculateTimeOfDayStats = (emotions: EmotionData[]) => {
  const morningEmotions = filterByTimeRange(
    emotions,
    UI_CONFIG.timeRanges.morning.start,
    UI_CONFIG.timeRanges.morning.end,
  );
  const afternoonEmotions = filterByTimeRange(
    emotions,
    UI_CONFIG.timeRanges.afternoon.start,
    UI_CONFIG.timeRanges.afternoon.end,
  );
  const eveningEmotions = [
    ...filterByTimeRange(
      emotions,
      UI_CONFIG.timeRanges.evening.start,
      UI_CONFIG.timeRanges.evening.end,
    ),
    ...filterByTimeRange(emotions, 0, UI_CONFIG.timeRanges.morning.start),
  ];

  return {
    morning: averageEmotion(morningEmotions),
    afternoon: averageEmotion(afternoonEmotions),
    evening: averageEmotion(eveningEmotions),
  };
};

/**
 * Calculates emotion distribution across discrete value ranges.
 *
 * Creates a histogram with DISTRIBUTION_BINS bins, where each bin
 * represents a 1-point range on the emotion scale (e.g., bin 0 = 1-2,
 * bin 1 = 2-3, etc.).
 *
 * @param emotions - Array of emotion data.
 * @returns Array where index represents emotion range and value is count.
 *
 * @example
 * ```ts
 * const data = [
 *   { emotion: 1.5 },
 *   { emotion: 2.3 },
 *   { emotion: 1.8 }
 * ];
 * calculateEmotionDistribution(data);
 * // Returns: [2, 1, 0, 0, ...] (2 in bin 0, 1 in bin 1)
 * ```
 */
export const calculateEmotionDistribution = (emotions: EmotionData[]) => {
  const distribution = new Array(EMOTION_RANGES.DISTRIBUTION_BINS).fill(0);
  emotions.forEach(({ emotion }) => {
    const index = Math.min(
      Math.max(Math.floor(emotion) - 1, 0),
      EMOTION_RANGES.DISTRIBUTION_BINS - 1,
    );
    distribution[index]++;
  });
  return distribution;
};

/**
 * Calculates per-student statistics from emotion data.
 *
 * Groups records by student and computes average emotion, record count,
 * and recent trendline for each student.
 *
 * @param emotions - Array of emotion data with optional student field.
 * @returns Array of student stats sorted alphabetically by student name.
 *
 * @example
 * ```ts
 * calculateStudentStats(data);
 * // Returns: [
 * //   { student: "学生1", recordCount: 25, avgEmotion: 52.3, trendline: [50, 52, 53] },
 * //   { student: "学生2", recordCount: 18, avgEmotion: 48.7, trendline: [45, 48, 49] }
 * // ]
 * ```
 */
export const calculateStudentStats = (emotions: EmotionData[]) =>
  Array.from(groupByStudent(emotions).entries())
    .map(([student, studentEmotions]) => ({
      student: `学生${student + 1}`,
      recordCount: studentEmotions.length,
      avgEmotion: average(studentEmotions),
      trendline: calculateTrendline(studentEmotions),
    }))
    .sort((a, b) => a.student.localeCompare(b.student));

/**
 * Extracts recent emotion values as a formatted trendline.
 *
 * Returns the last N values (TRENDLINE_WINDOW) with consistent
 * decimal precision for visualization.
 *
 * @param emotions - Array of emotion values in chronological order.
 * @returns Array of the most recent emotion values, formatted.
 *
 * @example
 * ```ts
 * calculateTrendline([45, 48, 52, 55, 53, 51, 49]);
 * // Returns: [51, 49] (last 2 values if window is 2)
 * ```
 */
export const calculateTrendline = (emotions: number[]): number[] =>
  emotions
    .slice(-EMOTION_CALCULATION_PARAMS.TREND.TRENDLINE_WINDOW)
    .map((score) =>
      Number(
        (score || 0).toFixed(EMOTION_CALCULATION_PARAMS.DECIMAL_PRECISION),
      ),
    );

/**
 * Determines emotion trend direction by comparing recent vs earlier values.
 *
 * Compares the average of recent records with the average of earlier records
 * to classify trend as "up", "down", or "stable" based on configured threshold.
 *
 * @param emotions - Array of emotion values in chronological order.
 * @returns Trend direction: "up", "down", or "stable".
 *
 * @example
 * ```ts
 * calculateEmotionTrend([45, 48, 52, 55, 58]); // Returns: "up"
 * calculateEmotionTrend([58, 55, 52, 48, 45]); // Returns: "down"
 * calculateEmotionTrend([50, 51, 50, 51, 50]); // Returns: "stable"
 * ```
 */
export const calculateEmotionTrend = (
  emotions: number[],
): "up" | "down" | "stable" => {
  if (emotions.length < 2) return "stable";
  const recent = emotions.slice(
    -EMOTION_CALCULATION_PARAMS.TREND.RECENT_WINDOW,
  );
  const earlier = emotions.slice(
    -EMOTION_CALCULATION_PARAMS.TREND.EARLIER_WINDOW_START,
    -EMOTION_CALCULATION_PARAMS.TREND.EARLIER_WINDOW_END,
  );

  if (earlier.length === 0) return "stable";

  const recentAvg = average(recent);
  const earlierAvg = average(earlier);
  const diff = recentAvg - earlierAvg;
  if (diff > EMOTION_CALCULATION_PARAMS.TREND.THRESHOLD) return "up";
  if (diff < -EMOTION_CALCULATION_PARAMS.TREND.THRESHOLD) return "down";
  return "stable";
};
