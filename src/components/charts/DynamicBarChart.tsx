"use client";

import dynamic from 'next/dynamic';
import { ResponsiveContainer } from 'recharts';

export interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  height?: number;
  data?: ChartData[];
  title?: string;
}

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = mod;
    return function Chart({ height, data, title }: ChartProps) {
      return (
        <div>
          {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip formatter={(value: number) => value.toFixed(2)} />
              <Legend />
              <Bar dataKey="value" name="感情スコア" className="text-indigo-600" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    };
  }),
  { ssr: false }
);

export default DynamicBarChart;