'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';

// ApexChartsをクライアントサイドのみでロード
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

// メモ化されたチャートコンポーネント
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

  // データのバリデーションと前処理
  const validData = useMemo(() => {
    try {
      return data.map(item => ({
        name: String(item.name),
        value: Number(item.value)
      })).filter(item => !isNaN(item.value));
    } catch (e) {
      console.error('Data processing error:', e);
      return [];
    }
  }, [data]);

  // チャートオプションのメモ化
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: window?.matchMedia('(prefers-reduced-motion: no-preference)').matches,
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
      enabled: validData.length <= 20, // データ点が多い場合は無効化
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
        rotateAlways: validData.length > 10, // データ点が多い場合は回転
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
  }), [height, validData, isDark]);

  // シリーズデータのメモ化
  const series = useMemo(() => [{
    name: 'スコア',
    data: validData.map(item => item.value),
  }], [validData]);

  // デバウンスされたデータ更新
  const debouncedUpdate = useCallback(
    debounce(() => {
      try {
        // チャートの更新処理
        // （必要に応じてチャートの参照を保持して更新）
      } catch (e) {
        console.error('Chart update error:', e);
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

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center"
        role="status"
        aria-label="グラフローディング中"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center text-red-500"
        role="alert"
        aria-label="グラフエラー"
      >
        <p>グラフの表示中にエラーが発生しました</p>
      </div>
    );
  }

  if (validData.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center"
        role="status"
        aria-label="データなし"
      >
        <p className="text-gray-500 dark:text-gray-400">
          表示するデータがありません
        </p>
      </div>
    );
  }

  const chartId = `chart-${title?.replace(/\s+/g, '-') ?? 'default'}`;

  return (
    <div
      className="w-full"
      role="region"
      aria-label={title || '統計グラフ'}
    >
      {title && (
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}
          id={`${chartId}-title`}
        >
          {title}
        </h3>
      )}
      <div className="overflow-x-auto">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={height}
          aria-labelledby={title ? `${chartId}-title` : undefined}
        />
      </div>
    </div>
  );
});

DynamicBarChart.displayName = 'DynamicBarChart';

export default DynamicBarChart;