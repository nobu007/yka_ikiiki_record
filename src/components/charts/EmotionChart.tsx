import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Define chart constants to avoid magic numbers
const DEFAULT_CHART_HEIGHT = 300;

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
  type?: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  colors?: string[];
}

const defaultColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
] as const;

export const EmotionChart = React.memo<EmotionChartProps>(({
  data,
  title,
  height = DEFAULT_CHART_HEIGHT,
  type = 'line',
  colors = defaultColors
}) => {
  const getChartOptions = useCallback((): Record<string, unknown> => {
    const baseOptions: Record<string, unknown> = {
      chart: {
        type,
        height,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      colors,
      theme: {
        mode: 'light'
      },
      responsive: [{
        breakpoint: 640,
        options: {
          chart: {
            height: height * 0.7
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    if (title) {
      baseOptions.title = {
        text: title,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#374151'
        }
      };
    }

    if (type === 'pie' || type === 'donut') {
      return {
        ...baseOptions,
        labels: data.labels,
        legend: {
          position: 'bottom'
        }
      };
    }

    return {
      ...baseOptions,
      xaxis: {
        categories: data.labels,
        labels: {
          style: {
            colors: '#6B7280'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6B7280'
          }
        }
      },
      grid: {
        borderColor: '#E5E7EB'
      },
      legend: {
        position: 'top'
      }
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
});

EmotionChart.displayName = 'EmotionChart';
