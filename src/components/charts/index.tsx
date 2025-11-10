// Chart components for data visualization

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
];

export const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  title,
  height = 300,
  type = 'line',
  colors = defaultColors
}) => {
  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        type,
        height,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      colors,
      title: title ? {
        text: title,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#374151'
        }
      } : undefined,
      theme: {
        mode: 'light' as const
      },
      responsive: [{
        breakpoint: 640,
        options: {
          chart: {
            height: height * 0.7
          },
          legend: {
            position: 'bottom' as const
          }
        }
      }]
    };

    if (type === 'pie' || type === 'donut') {
      return {
        ...baseOptions,
        labels: data.labels,
        legend: {
          position: 'bottom' as const
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
        position: 'top' as const
      }
    };
  };

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
};

export const MonthlyEmotionChart: React.FC<{ data: Array<{ month: string; avgEmotion: number }> }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(d => d.month),
    series: [{
      name: '平均感情スコア',
      data: data.map(d => d.avgEmotion)
    }]
  };

  return (
    <EmotionChart
      data={chartData}
      title="月別感情スコア推移"
      type="line"
      height={350}
    />
  );
};

export const DayOfWeekChart: React.FC<{ data: Array<{ day: string; avgEmotion: number }> }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(d => d.day),
    series: [{
      name: '平均感情スコア',
      data: data.map(d => d.avgEmotion)
    }]
  };

  return (
    <EmotionChart
      data={chartData}
      title="曜日別感情スコア"
      type="bar"
      height={300}
    />
  );
};

export const EmotionDistributionChart: React.FC<{ data: number[] }> = ({ data }) => {
  const labels = ['1', '2', '3', '4', '5'];
  const chartData: ChartData = {
    labels,
    series: [{
      name: '分布',
      data
    }]
  };

  return (
    <EmotionChart
      data={chartData}
      title="感情スコア分布"
      type="bar"
      height={250}
    />
  );
};

export const TimeOfDayChart: React.FC<{ data: { morning: number; afternoon: number; evening: number } }> = ({ data }) => {
  const chartData: ChartData = {
    labels: ['朝', '昼', '夜'],
    series: [{
      name: '平均感情スコア',
      data: [data.morning, data.afternoon, data.evening]
    }]
  };

  return (
    <EmotionChart
      data={chartData}
      title="時間帯別感情スコア"
      type="bar"
      height={250}
    />
  );
};

export const StudentEmotionChart: React.FC<{ data: Array<{ student: string; avgEmotion: number }> }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(d => d.student),
    series: [{
      name: '平均感情スコア',
      data: data.map(d => d.avgEmotion)
    }]
  };

  return (
    <EmotionChart
      data={chartData}
      title="生徒別感情スコア"
      type="bar"
      height={400}
    />
  );
};

export const EmotionTrendChart: React.FC<{ data: Array<{ student: string; trendline: number[] }> }> = ({ data }) => {
  const chartData: ChartData = {
    labels: ['7日前', '6日前', '5日前', '4日前', '3日前', '2日前', '1日前'],
    series: data.slice(0, 5).map(student => ({
      name: student.student,
      data: student.trendline
    }))
  };

  return (
    <EmotionChart
      data={chartData}
      title="感情スコア推移（上位5名）"
      type="line"
      height={350}
    />
  );
};