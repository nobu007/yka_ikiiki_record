"use client";

import { useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { CHART_COLORS } from "@/lib/config";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DEFAULT_CHART_HEIGHT = 300;
const RESPONSIVE_BREAKPOINT = 640;
const RESPONSIVE_HEIGHT_RATIO = 0.7;
const TITLE_FONT_SIZE = "16px";

export interface ChartData {
  labels: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface EmotionChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  type?: "line" | "bar" | "area" | "pie" | "donut";
  colors?: string[];
}

const defaultColors = CHART_COLORS.PALETTE;

export const EmotionChart = memo<EmotionChartProps>(
  ({
    data,
    title,
    height = DEFAULT_CHART_HEIGHT,
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
            breakpoint: RESPONSIVE_BREAKPOINT,
            options: {
              chart: {
                height: height * RESPONSIVE_HEIGHT_RATIO,
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
            fontSize: TITLE_FONT_SIZE,
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
