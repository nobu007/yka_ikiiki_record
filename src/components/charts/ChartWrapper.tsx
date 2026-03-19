"use client";

import { ReactNode, memo } from "react";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";

interface ChartWrapperProps {
  title?: string;
  height?: number;
  isLoading?: boolean;
  error?: Error | null;
  children: ReactNode;
  isDark?: boolean;
}

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
    const chartId = `chart-${title?.replace(/\s+/g, "-") ?? "default"}`;

    if (isLoading) {
      return (
        <div
          style={{ height }}
          className="w-full flex items-center justify-center"
          role="status"
          aria-label={ACCESSIBILITY_MESSAGES.CHART_LOADING}
        >
          <div className={`animate-spin rounded-full ${UI_CONSTANTS.CHART.SPINNER_SIZE} border-b-2 border-primary`}></div>
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
