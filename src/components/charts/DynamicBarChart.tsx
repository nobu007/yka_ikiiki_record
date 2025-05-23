'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';

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
}

export default function DynamicBarChart({ data, height = 300, title }: DynamicBarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
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
    },
    yaxis: {
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(1),
      },
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => val.toFixed(2),
      },
    },
  };

  const series = [{
    name: 'スコア',
    data: data.map(item => item.value),
  }];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
}