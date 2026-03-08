'use client';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
import ChartWrapper from './ChartWrapper';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div role="status" aria-label="グラフローディング中" className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
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
  isDark = false
}: DynamicBarChartProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validData = useMemo(() => {
    try {
      return data.map(item => ({
        name: String(item.name),
        value: Number(item.value)
      })).filter(item => !isNaN(item.value));
    } catch (error) {
      // Set error state for better debugging
      setError(error instanceof Error ? error : new Error('Data transformation failed'));
      return [];
    }
  }, [data]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: mounted && typeof window !== 'undefined',
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: isDark ? '#1f2937' : '#ffffff',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
        distributed: false,
      },
    },
    colors: ['#4F46E5'],
    dataLabels: {
      enabled: validData.length <= 20,
    },
    xaxis: {
      categories: validData.map(item => item.name),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? '#9ca3af' : '#4b5563',
        },
        rotateAlways: validData.length > 10,
      },
    },
    yaxis: {
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(1),
        style: {
          colors: isDark ? '#9ca3af' : '#4b5563',
        },
      },
    },
    grid: {
      borderColor: isDark ? '#374151' : '#f1f1f1',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val) => val.toFixed(2),
      },
    },
  }), [height, validData, isDark, mounted]);

  const series = useMemo(() => [{
    name: 'スコア',
    data: validData.map(item => item.value),
  }], [validData]);

  const debouncedUpdate = useCallback(
    debounce(() => {
      try {
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to update chart'));
      }
    }, 250),

    []
  );

  useEffect(() => {
    if (mounted) {
      debouncedUpdate();
    }
    return () => {
      debouncedUpdate.cancel();
    };
  }, [mounted, debouncedUpdate]);

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
    <ChartWrapper
      {...wrapperProps}
    >
      {validData.length === 0 ? (
        <div
          className="w-full flex items-center justify-center"
          role="status"
          aria-label="データなし"
        >
          <p className="text-gray-500 dark:text-gray-400">
            表示するデータがありません
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

DynamicBarChart.displayName = 'DynamicBarChart';

export default DynamicBarChart;