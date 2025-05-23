'use client';

import useSWR from 'swr';
import BarChartOne from '@/components/charts/bar/BarChartOne';

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  });

export function StatsDisplay() {
  const { data, error, isLoading } = useSWR('/api/stats', fetcher);

  if (isLoading) return <p>統計データ読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;
  if (!data || !Array.isArray(data)) return <p>データが見つかりません</p>;

  // データを整形してチャートに渡す
  const chartData = data.map(item => ({
    name: item.date,
    value: item.value,
  }));

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">統計データ</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <BarChartOne data={chartData} />
      </div>
    </div>
  );
}