"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ChartWrapper from "./ChartWrapper";
import { CHART_COLORS } from "@/lib/config";
import { ACCESSIBILITY_MESSAGES, CHART_TITLES } from "@/lib/constants/messages";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { normalizeError, type AppError } from "@/lib/error-handler";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label={ACCESSIBILITY_MESSAGES.CHART_LOADING}
      className="animate-pulse"
    >
      <div className={`${UI_CONSTANTS.CHART_CONFIG.SKELETON_HEIGHT} bg-gray-200 rounded dark:bg-gray-700`}></div>
    </div>
  ),
});

export interface ChartData {
  name: string;
  value: number;
}

interface DynamicBarChartProps {
  data: ChartData[];
  height?: number;
  title?: string;
  isDark?: boolean;
}

const DynamicBarChart = memo(function DynamicBarChart({
  data,
  height = 300,
  title,
  isDark = false,
}: DynamicBarChartProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validData = useMemo(() => {
    try {
      return data
        .map((item) => ({
          name: String(item.name),
          value: Number(item.value),
        }))
        .filter((item) => !isNaN(item.value));
    } catch (error) {
      setError(normalizeError(error));
      return [];
    }
  }, [data]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: mounted && typeof window !== "undefined",
          easing: "easeinout",
          speed: UI_CONSTANTS.CHART_CONFIG.ANIMATION_SPEED_MS,
          dynamicAnimation: {
            enabled: true,
            speed: UI_CONSTANTS.CHART_CONFIG.DYNAMIC_ANIMATION_SPEED_MS,
          },
        },
        background: isDark ? CHART_COLORS.BG_DARK : CHART_COLORS.BG_LIGHT,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: UI_CONSTANTS.CHART_CONFIG.BAR_COLUMN_WIDTH,
          borderRadius: UI_CONSTANTS.CHART_CONFIG.BAR_BORDER_RADIUS,
          distributed: false,
        },
      },
      colors: [CHART_COLORS.PRIMARY],
      dataLabels: {
        enabled: validData.length <= UI_CONSTANTS.CHART_CONFIG.DATALABELS_ENABLE_THRESHOLD,
      },
      xaxis: {
        categories: validData.map((item) => item.name),
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: isDark ? CHART_COLORS.GRAY_LIGHT : CHART_COLORS.GRAY_DARK,
          },
          rotateAlways: validData.length > UI_CONSTANTS.CHART_CONFIG.LABEL_ROTATION_THRESHOLD,
        },
      },
      yaxis: {
        min: 0,
        max: UI_CONSTANTS.CHART_CONFIG.YAXIS_MAX_VALUE,
        tickAmount: UI_CONSTANTS.CHART_CONFIG.YAXIS_TICK_AMOUNT,
        labels: {
          formatter: (val) => val.toFixed(UI_CONSTANTS.CHART_CONFIG.YAXIS_LABEL_PRECISION),
          style: {
            colors: isDark ? CHART_COLORS.GRAY_LIGHT : CHART_COLORS.GRAY_DARK,
          },
        },
      },
      grid: {
        borderColor: isDark
          ? CHART_COLORS.BORDER_DARK
          : CHART_COLORS.BORDER_LIGHT,
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: UI_CONSTANTS.CHART_CONFIG.GRID_PADDING_LEFT,
        },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: (val) => val.toFixed(UI_CONSTANTS.CHART_CONFIG.TOOLTIP_VALUE_PRECISION),
        },
      },
    }),
    [height, validData, isDark, mounted],
  );

  const series = useMemo(
    () => [
      {
        name: CHART_TITLES.SERIES_NAME,
        data: validData.map((item) => item.value),
      },
    ],
    [validData],
  );

  const wrapperProps: {
    height: number;
    isLoading: boolean;
    error: Error | null;
    isDark: boolean;
    title?: string;
  } = {
    height,
    isLoading: !mounted,
    error,
    isDark,
  };

  if (title !== undefined) {
    wrapperProps.title = title;
  }

  return (
    <ChartWrapper {...wrapperProps}>
      {validData.length === 0 ? (
        <div
          className="w-full flex items-center justify-center"
          role="status"
          aria-label={ACCESSIBILITY_MESSAGES.NO_DATA}
        >
          <p className="text-gray-500 dark:text-gray-400">
            {ACCESSIBILITY_MESSAGES.NO_DATA_MESSAGE}
          </p>
        </div>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={height}
        />
      )}
    </ChartWrapper>
  );
});

DynamicBarChart.displayName = "DynamicBarChart";

export default DynamicBarChart;
