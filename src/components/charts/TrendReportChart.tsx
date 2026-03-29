"use client";

import { memo, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ChartWrapper from "./ChartWrapper";
import {
  type StudentTrendAnalysis,
  type ClassTrendAnalysis,
  type TrendDirection,
} from "@/domain/entities/TrendAnalysis";
import { CHART_COLORS } from "@/lib/config";
import { ACCESSIBILITY_MESSAGES } from "@/lib/constants/messages";
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
      <div
        className={`${UI_CONSTANTS.CHART_CONFIG.SKELETON_HEIGHT} bg-gray-200 rounded dark:bg-gray-700`}
      ></div>
    </div>
  ),
});

export interface TrendReportChartProps {
  analysis: StudentTrendAnalysis | ClassTrendAnalysis;
  height?: number;
  title?: string;
  isDark?: boolean;
  showMovingAverage?: boolean;
  movingAverageWindow?: number;
  showAnnotations?: boolean;
}

const TrendDirectionBadge = memo<{
  direction: TrendDirection;
  label: string;
}>(({ direction, label }) => {
  const colors = {
    up: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900",
    down: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900",
    stable: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900",
  };

  const arrows = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors[direction]}`}
    >
      <span aria-hidden="true">{arrows[direction]}</span>
      <span>{label}</span>
    </span>
  );
});

TrendDirectionBadge.displayName = "TrendDirectionBadge";

const MetricsPanel = memo<{
  analysis: StudentTrendAnalysis | ClassTrendAnalysis;
  isClass: boolean;
}>(({ analysis, isClass }) => {
  const metrics = analysis.metrics;

  const metricsItems = useMemo(
    () => [
      {
        label: "Average",
        value: metrics.averageEmotion.toFixed(2),
      },
      {
        label: "Start",
        value: metrics.startEmotion.toFixed(2),
      },
      {
        label: "End",
        value: metrics.endEmotion.toFixed(2),
      },
      {
        label: "Volatility",
        value: metrics.volatility.toFixed(2),
      },
      ...(isClass
        ? [
            {
              label: "Students",
              value: (metrics as typeof metrics & { totalStudents: number })
                .totalStudents,
            },
          ]
        : [
            {
              label: "Records",
              value: (metrics as typeof metrics & { totalRecords: number })
                .totalRecords,
            },
          ]),
    ],
    [metrics, isClass],
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {metricsItems.map((item) => (
        <div
          key={item.label}
          className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-center"
        >
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {item.label}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
});

MetricsPanel.displayName = "MetricsPanel";

const TrendReportChartComponent = memo<TrendReportChartProps>(
  function TrendReportChart({
    analysis,
    height = UI_CONSTANTS.CHART.HEIGHT.LARGE,
    title,
    isDark = false,
    showMovingAverage = false,
    movingAverageWindow = 3,
    showAnnotations = true,
  }) {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<AppError | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const isClass = "className" in analysis;
    const displayName = isClass ? analysis.className : analysis.student;

    const chartData = useMemo(() => {
      try {
        if (isClass) {
          const classAnalysis = analysis as ClassTrendAnalysis;
          return classAnalysis.studentAnalyses.flatMap((student) =>
            student.dataPoints.map((dp) => ({
              date: dp.date,
              emotion: dp.emotion,
              student: student.student,
            })),
          );
        } else {
          const studentAnalysis = analysis as StudentTrendAnalysis;
          return studentAnalysis.dataPoints.map((dp) => ({
            date: dp.date,
            emotion: dp.emotion,
            student: studentAnalysis.student,
          }));
        }
      } catch (err) {
        setError(normalizeError(err));
        return [];
      }
    }, [analysis, isClass]);

    const sortedData = useMemo(
      () => [...chartData].sort((a, b) => a.date.getTime() - b.date.getTime()),
      [chartData],
    );

    const categories = useMemo(
      () =>
        sortedData.map((dp) =>
          dp.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ),
      [sortedData],
    );

    const seriesData = useMemo(
      () => sortedData.map((dp) => dp.emotion),
      [sortedData],
    );

    const movingAverageData = useMemo(() => {
      if (!showMovingAverage || seriesData.length < movingAverageWindow) {
        return [];
      }

      const result: number[] = [];
      for (let i = 0; i <= seriesData.length - movingAverageWindow; i++) {
        const window = seriesData.slice(i, i + movingAverageWindow);
        const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        result.push(avg);
      }

      return result;
    }, [showMovingAverage, seriesData, movingAverageWindow]);

    const annotations = useMemo(() => {
      if (!showAnnotations) return undefined;

      const points: { x: number; y: number; label: string }[] = [];

      if (isClass) {
        const classAnalysis = analysis as ClassTrendAnalysis;
        const topPerformers = classAnalysis.metrics.topPerformers;
        const needsSupport = classAnalysis.metrics.needsSupport;

        if (topPerformers.length > 0) {
          const topStudent = classAnalysis.studentAnalyses.find(
            (s) => s.student === topPerformers[0],
          );
          if (topStudent && topStudent.dataPoints.length > 0) {
            const lastPoint = topStudent.dataPoints[topStudent.dataPoints.length - 1];
            const index = sortedData.findIndex(
              (dp) => dp.date.getTime() === lastPoint.date.getTime(),
            );
            if (index >= 0) {
              points.push({
                x: index,
                y: lastPoint.emotion,
                label: `Top: ${topPerformers[0]}`,
              });
            }
          }
        }

        if (needsSupport.length > 0) {
          const supportStudent = classAnalysis.studentAnalyses.find(
            (s) => s.student === needsSupport[0],
          );
          if (supportStudent && supportStudent.dataPoints.length > 0) {
            const lastPoint =
              supportStudent.dataPoints[supportStudent.dataPoints.length - 1];
            const index = sortedData.findIndex(
              (dp) => dp.date.getTime() === lastPoint.date.getTime(),
            );
            if (index >= 0) {
              points.push({
                x: index,
                y: lastPoint.emotion,
                label: `Support: ${needsSupport[0]}`,
              });
            }
          }
        }
      }

      if (points.length === 0) return undefined;

      return {
        points,
      };
    }, [showAnnotations, isClass, analysis, sortedData]);

    const series = useMemo(() => {
      const baseSeries = [
        {
          name: "Emotion",
          data: seriesData,
        },
      ];

      if (
        showMovingAverage &&
        movingAverageData.length > 0 &&
        movingAverageData.length === seriesData.length - movingAverageWindow + 1
      ) {
        baseSeries.push({
          name: `Moving Average (${movingAverageWindow})`,
          data: [
            ...Array(movingAverageWindow - 1).fill(null),
            ...movingAverageData,
          ] as number[],
        });
      }

      return baseSeries;
    }, [seriesData, showMovingAverage, movingAverageData, movingAverageWindow]);

    const options = useMemo(
      () => ({
        chart: {
          type: "line" as const,
          height,
          toolbar: {
            show: false,
          },
          animations: {
            enabled: mounted && typeof window !== "undefined",
            easing: "easeinout" as const,
            speed: UI_CONSTANTS.CHART_CONFIG.ANIMATION_SPEED_MS,
          },
          background: isDark ? CHART_COLORS.BG_DARK : CHART_COLORS.BG_LIGHT,
        },
        stroke: {
          curve: "smooth" as const,
          width: 3,
        },
        colors: [
          CHART_COLORS.PRIMARY,
          showMovingAverage ? CHART_COLORS.SECONDARY : CHART_COLORS.PRIMARY,
        ],
        fill: {
          type: "gradient" as const,
          gradient: {
            shade: "light" as const,
            type: "vertical" as const,
            shadeIntensity: 0.5,
            gradientToColors: [CHART_COLORS.PRIMARY],
            inverseColors: true,
            opacityFrom: 0.7,
            opacityTo: 0.1,
            stops: [0, 90, 100],
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories,
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
          },
        },
        yaxis: {
          min: 1,
          max: 5,
          tickAmount: 4,
          labels: {
            formatter: (val: number) => val.toFixed(1),
            style: {
              colors: isDark ? CHART_COLORS.GRAY_LIGHT : CHART_COLORS.GRAY_DARK,
            },
          },
          title: {
            text: "Emotion Level",
            style: {
              color: isDark ? CHART_COLORS.GRAY_LIGHT : CHART_COLORS.GRAY_DARK,
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
            formatter: (val: number) => val.toFixed(2),
          },
        },
        annotations,
      }),
      [height, isDark, mounted, categories, annotations, showMovingAverage],
    );

    const wrapperProps = {
      height,
      isLoading: !mounted,
      error,
      isDark,
      title: title || `Trend Report: ${displayName}`,
    };

    return (
      <ChartWrapper {...wrapperProps}>
        {sortedData.length === 0 ? (
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
          <div>
            <div className="mb-4 flex items-center gap-3">
              <TrendDirectionBadge
                direction={analysis.metrics.trendDirection}
                label={
                  analysis.metrics.trendDirection === "up"
                    ? "Improving"
                    : analysis.metrics.trendDirection === "down"
                      ? "Declining"
                      : "Stable"
                }
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {sortedData.length} data points
              </span>
            </div>
            <MetricsPanel analysis={analysis} isClass={isClass} />
            <ReactApexChart
              options={options}
              series={series}
              type="line"
              height={height}
            />
          </div>
        )}
      </ChartWrapper>
    );
  },
);

TrendReportChartComponent.displayName = "TrendReportChartComponent";

export const TrendReportChart = TrendReportChartComponent;
TrendReportChart.displayName = "TrendReportChart";
