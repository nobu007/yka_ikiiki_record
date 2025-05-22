"use client";

import dynamic from 'next/dynamic';

export interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  width?: number;
  height?: number;
  data?: ChartData[];
  title?: string;
}

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = mod;
    return function Chart({ width, height, data, title }: ChartProps) {
      return (
        <div>
          {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
          <BarChart width={width} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" name="感情スコア" />
          </BarChart>
        </div>
      );
    };
  }),
  { ssr: false }
);

export default DynamicBarChart;