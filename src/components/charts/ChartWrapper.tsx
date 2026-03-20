"use client";

import { ReactNode, memo } from "react";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

/**
 * Props for ChartWrapper component.
 */
interface ChartWrapperProps {
  /** Optional title displayed above the chart */
  title?: string;
  /** Height of the chart container in pixels (default: from UI_CONSTANTS) */
  height?: number;
  /** Whether the chart is currently loading data */
  isLoading?: boolean;
  /** Error object if chart data failed to load */
  error?: Error | null;
  /** Chart component to render */
  children: ReactNode;
  /** Whether to use dark theme for heading color */
  isDark?: boolean;
}

/**
 * A wrapper component for charts that provides consistent layout, loading states, error handling, and accessibility.
 *
 * This component handles three states:
 * 1. **Loading**: Displays a spinner while data is being fetched
 * 2. **Error**: Displays an error message with accessibility attributes
 * 3. **Success**: Renders the chart with optional title and proper ARIA labels
 *
 * The component is memoized for performance and includes comprehensive accessibility support
 * including proper ARIA roles, labels, and semantic HTML.
 *
 * @example
 * ```tsx
 * <ChartWrapper
 *   title="Monthly Emotion Trends"
 *   height={400}
 *   isLoading={false}
 *   error={null}
 * >
 *   <EmotionChart data={data} />
 * </ChartWrapper>
 * ```
 *
 * @example
 * ```tsx
 * // With loading state
 * <ChartWrapper
 *   title="Student Statistics"
 *   isLoading={true}
 * >
 *   <StudentChart data={[]} />
 * </ChartWrapper>
 * ```
 *
 * @example
 * ```tsx
 * // With error state
 * <ChartWrapper
 *   title="Daily Distribution"
 *   error={new Error("Failed to load data")}
 * >
 *   <DayChart data={[]} />
 * </ChartWrapper>
 * ```
 */
export const ChartWrapper = memo<ChartWrapperProps>(
  ({
    title,
    height = UI_CONSTANTS.CHART.HEIGHT.DEFAULT,
    isLoading,
    error,
    children,
    isDark = false,
  }) => {
    const headingColor = isDark
      ? UI_CONSTANTS.CHART.HEADING_COLOR.DARK
      : UI_CONSTANTS.CHART.HEADING_COLOR.LIGHT;
    const chartId = `chart-${title?.replace(/\s+/g, "-") ?? ACCESSIBILITY_MESSAGES.CHART_DEFAULT_ID}`;

    if (isLoading) {
      return (
        <div
          style={{ height }}
          className="w-full flex items-center justify-center"
          role="status"
          aria-label={ACCESSIBILITY_MESSAGES.CHART_LOADING}
        >
          <div
            className={`animate-spin rounded-full ${UI_CONSTANTS.CHART.SPINNER_SIZE} border-b-2 border-primary`}
          ></div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{ height }}
          className={`w-full flex items-center justify-center ${UI_CONSTANTS.COLOR.ERROR}`}
          role="alert"
          aria-label={ACCESSIBILITY_MESSAGES.CHART_ERROR}
        >
          <p>
            {ACCESSIBILITY_MESSAGES.CHART_ERROR_MESSAGE}: {error.message}
          </p>
        </div>
      );
    }

    return (
      <div
        className="w-full"
        style={{ height }}
        role="region"
        aria-label={title || ACCESSIBILITY_MESSAGES.CHART_DEFAULT}
      >
        {title && (
          <h3
            className={`text-lg font-semibold mb-4 ${headingColor}`}
            id={`${chartId}-title`}
          >
            {title}
          </h3>
        )}
        <div className="overflow-x-auto">{children}</div>
      </div>
    );
  },
);

ChartWrapper.displayName = "ChartWrapper";

export default ChartWrapper;
