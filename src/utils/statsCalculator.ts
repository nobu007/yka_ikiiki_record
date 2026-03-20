import { EMOTION_CONFIG, UI_CONFIG } from "@/lib/config";
import { EMOTION_CALCULATION_PARAMS, EMOTION_RANGES } from "@/lib/constants";

type EmotionData = {
  date: Date;
  emotion: number;
  hour?: number;
  student?: number;
};

/**
 * Clamps a numeric value between minimum and maximum bounds.
 *
 * @param value - The value to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped value, constrained between min and max.
 *
 * @example
 * ```ts
 * clamp(5, 0, 10); // Returns: 5
 * clamp(-5, 0, 10); // Returns: 0
 * clamp(15, 0, 10); // Returns: 10
 * ```
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Calculates the arithmetic mean of an array of numbers.
 *
 * Returns 0 for empty arrays. Uses decimal precision from configuration
 * for consistent floating-point results.
 *
 * @param values - Array of numbers to average.
 * @returns The arithmetic mean, or 0 if array is empty.
 *
 * @example
 * ```ts
 * average([1, 2, 3, 4, 5]); // Returns: 3.00
 * average([]); // Returns: 0
 * ```
 */
export const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : Number(
        (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(
          EMOTION_CALCULATION_PARAMS.DECIMAL_PRECISION,
        ),
      );

/** Alias for {@link average} function. */
export const calculateAverage = average;

/**
 * Generates a random number following a standard normal distribution (mean=0, std=1).
 *
 * Uses the Box-Muller transform to convert two uniform random numbers
 * into a single normally-distributed random number.
 *
 * @returns A random number from standard normal distribution.
 *
 * @example
 * ```ts
 * const value = generateNormalRandom();
 * // Typically returns values between -3 and +3
 * ```
 */
export const generateNormalRandom = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Clamps an emotion value to the configured valid range.
 *
 * @param emotion - The emotion value to clamp.
 * @returns The emotion value constrained between EMOTION_CONFIG.min and EMOTION_CONFIG.max.
 *
 * @example
 * ```ts
 * clampEmotion(150); // Returns: 100 (if max is 100)
 * clampEmotion(-10); // Returns: 0 (if min is 0)
 * clampEmotion(50);  // Returns: 50
 * ```
 */
export const clampEmotion = (emotion: number): number =>
  clamp(emotion, EMOTION_CONFIG.min, EMOTION_CONFIG.max);

/**
 * Generates a base emotion value with optional pattern variation.
 *
 * Applies configured base emotion values and adds random noise based on
 * standard deviation. Special handling for "bimodal" pattern creates
 * a distribution with two peaks.
 *
 * @param pattern - The emotion pattern key from EMOTION_CONFIG.baseEmotions.
 * @returns A generated emotion value within valid range.
 *
 * @example
 * ```ts
 * generateBaseEmotion("normal"); // Returns: value around 50 with noise
 * generateBaseEmotion("bimodal"); // Returns: either low or high values
 * ```
 */
export const generateBaseEmotion = (
  pattern: keyof typeof EMOTION_CONFIG.baseEmotions,
): number => {
  const baseValue =
    EMOTION_CONFIG.baseEmotions[pattern] ?? EMOTION_CONFIG.baseEmotions.normal;
  const adjustedBase =
    pattern === "bimodal" &&
    Math.random() < EMOTION_CALCULATION_PARAMS.BIMODAL.THRESHOLD
      ? EMOTION_CALCULATION_PARAMS.BIMODAL.HIGH_VALUE
      : baseValue;
  return clampEmotion(
    adjustedBase + EMOTION_CONFIG.defaultStddev * generateNormalRandom(),
  );
};

/**
 * Calculates seasonal emotion effect based on month of year.
 *
 * Uses configured seasonal factors to adjust emotion values based on
 * temporal patterns (e.g., lower emotions in winter, higher in spring).
 *
 * @param date - The date for which to calculate seasonal effect.
 * @returns Seasonal adjustment value to be added to base emotion.
 *
 * @example
 * ```ts
 * calculateSeasonalEffect(new Date("2024-01-01")); // Winter (negative adjustment)
 * calculateSeasonalEffect(new Date("2024-04-01")); // Spring (positive adjustment)
 * ```
 */
export const calculateSeasonalEffect = (date: Date): number => {
  const monthIndex = date.getMonth();
  const factor =
    EMOTION_CONFIG.seasonalFactors[monthIndex] ??
    EMOTION_CALCULATION_PARAMS.SEASONAL.FACTOR_FALLBACK;
  return (
    (factor - EMOTION_CALCULATION_PARAMS.SEASONAL.BASELINE) *
    EMOTION_CONFIG.seasonalImpact
  );
};

/**
 * Calculates cumulative emotion effect from active events.
 *
 * Events have a sine-wave intensity curve that peaks in the middle
 * of the event duration. Multiple events can overlap and their
 * effects are summed.
 *
 * @param date - The date for which to calculate event effects.
 * @param events - Array of events with date ranges and impact values.
 * @returns Sum of all active event effects at the given date.
 *
 * @example
 * ```ts
 * const events = [
 *   { startDate: new Date("2024-01-01"), endDate: new Date("2024-01-07"), impact: 0.5 }
 * ];
 * calculateEventEffect(new Date("2024-01-04"), events); // Returns: positive effect
 * calculateEventEffect(new Date("2024-02-01"), events); // Returns: 0 (no active events)
 * ```
 */
export const calculateEventEffect = (
  date: Date,
  events: ReadonlyArray<{
    readonly startDate: Date;
    readonly endDate: Date;
    readonly impact: number;
  }>,
): number => {
  return events.reduce((total, { startDate, endDate, impact }) => {
    if (date < startDate || date > endDate) return total;

    const duration = endDate.getTime() - startDate.getTime();
    if (duration === 0) return total;

    const progress = (date.getTime() - startDate.getTime()) / duration;
    const intensity = Math.sin(progress * Math.PI);

    return total + impact * intensity * EMOTION_CONFIG.maxEventImpact;
  }, 0);
};

/**
 * Generates a random hour within configured time ranges.
 *
 * Returns a value between morning start and evening end, representing
 * a plausible hour for student record entries.
 *
 * @returns A random hour value (0-23).
 *
 * @example
 * ```ts
 * getRandomHour(); // Returns: e.g., 14 (2 PM)
 * ```
 */
export const getRandomHour = (): number => {
  const totalHours =
    UI_CONFIG.timeRanges.evening.end - UI_CONFIG.timeRanges.morning.start;
  return (
    Math.floor(Math.random() * totalHours) + UI_CONFIG.timeRanges.morning.start
  );
};

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
      avgEmotion: average(dayEmotions.map((e) => e.emotion)),
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
    morning: average(morningEmotions.map((e) => e.emotion)),
    afternoon: average(afternoonEmotions.map((e) => e.emotion)),
    evening: average(eveningEmotions.map((e) => e.emotion)),
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
