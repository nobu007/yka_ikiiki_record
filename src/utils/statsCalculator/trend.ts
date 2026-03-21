import { EMOTION_CALCULATION_PARAMS } from "@/lib/constants";
import { average } from "./math";

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
