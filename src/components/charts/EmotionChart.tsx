"use client";

import { useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { CHART_COLORS, CHART_CONFIG } from "@/lib/config";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Data structure for chart rendering.
 */
export interface ChartData {
  /** X-axis labels for data points */
  labels: string[];
  /** Data series with names and values */
  series: Array<{
    name: string;
    data: number[];
  }>;
}

/**
 * Props for EmotionChart component.
 */
export interface EmotionChartProps {
  /** Chart data containing labels and series */
  data: ChartData;
  /** Optional chart title */
  title?: string;
  /** Chart height in pixels (default: from CHART_CONFIG) */
  height?: number;
  /** Chart type variant (default: "line") */
  type?: "line" | "bar" | "area" | "pie" | "donut";
  /** Custom color palette (default: CHART_COLORS.PALETTE) */
  colors?: string[];
}

const defaultColors = CHART_COLORS.PALETTE;

/**
 * A flexible chart component for visualizing emotion statistics data.
 *
 * Wraps ApexCharts with dynamic import for client-side only rendering, preventing
 * SSR issues. Supports multiple chart types (line, bar, area, pie, donut) with
 * responsive design and customizable styling.
 *
 * **Features:**
 * - Multiple chart types with unified API
 * - Responsive design with breakpoint-based height adjustment
 * - Dynamic import to prevent SSR hydration issues
 * - Memoized for performance optimization
 * - Customizable colors and styling
 * - Optional title with configurable font styling
 *
 * **Responsive Behavior:**
 * - Above breakpoint: uses configured height
 * - Below breakpoint: reduces height by RESPONSIVE_HEIGHT_RATIO
 * - Legend moves to bottom on mobile
 *
 * @example
 * ```tsx
 * // Line chart
 * <EmotionChart
 *   type="line"
 *   data={{
 *     labels: ["Jan", "Feb", "Mar"],
 *     series: [{ name: "Emotion", data: [65, 70, 75] }]
 *   }}
 *   title="Monthly Emotion Trends"
 * />
 *
 * // Bar chart with custom colors
 * <EmotionChart
 *   type="bar"
 *   data={{...}}
 *   colors={['#FF6B6B', '#4ECDC4']}
 *   height={400}
 * />
 *
 * // Pie chart
 * <EmotionChart
 *   type="pie"
 *   data={{
 *     labels: ["Happy", "Sad", "Neutral"],
 *     series: [{ name: "Distribution", data: [40, 30, 30] }]
 *   }}
 * />
 * ```
 */
export const EmotionChart = memo<EmotionChartProps>(
  ({
    data,
    title,
    height = CHART_CONFIG.DEFAULT_HEIGHT,
    type = "line",
    colors = defaultColors,
  }) => {
    const getChartOptions = useCallback((): Record<string, unknown> => {
      const baseOptions: Record<string, unknown> = {
        chart: {
          type,
          height,
          toolbar: {
            show: false,
          },
          background: "transparent",
        },
        colors,
        theme: {
          mode: "light",
        },
        responsive: [
          {
            breakpoint: CHART_CONFIG.RESPONSIVE_BREAKPOINT,
            options: {
              chart: {
                height: height * CHART_CONFIG.RESPONSIVE_HEIGHT_RATIO,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      };

      if (title) {
        baseOptions.title = {
          text: title,
          style: {
            fontSize: CHART_CONFIG.TITLE_FONT_SIZE,
            fontWeight: "bold",
            color: CHART_COLORS.GRAY_DARK,
          },
        };
      }

      if (type === "pie" || type === "donut") {
        return {
          ...baseOptions,
          labels: data.labels,
          legend: {
            position: "bottom",
          },
        };
      }

      return {
        ...baseOptions,
        xaxis: {
          categories: data.labels,
          labels: {
            style: {
              colors: CHART_COLORS.GRAY_MEDIUM,
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: CHART_COLORS.GRAY_MEDIUM,
            },
          },
        },
        grid: {
          borderColor: CHART_COLORS.GRAY_BORDER,
        },
        legend: {
          position: "top",
        },
      };
    }, [type, height, colors, title, data.labels]);

    return (
      <div className="w-full">
        <Chart
          options={getChartOptions()}
          series={data.series}
          type={type}
          height={height}
        />
      </div>
    );
  },
);

EmotionChart.displayName = "EmotionChart";
