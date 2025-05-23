'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
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

export default function DynamicBarChart({ data, height = 300, title, isDark = false }: DynamicBarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: height,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
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
      enabled: false,
    },
    xaxis: {
      categories: data.map(item => item.name),
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
  }), [height, data, isDark]);

  const series = useMemo(() => [{
    name: 'スコア',
    data: data.map(item => item.value),
  }], [data]);

  if (!mounted) {
    return (
      <div style={{ height }} className="w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      )}
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
}