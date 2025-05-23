"use client";

import { useEffect } from 'react';
import useDataGeneration from '@/hooks/useDataGeneration';
import StatsDisplay from './StatsDisplay';

export default function DashboardContent() {
  const { generate, isLoading, error } = useDataGeneration();

  useEffect(() => {
    generate(); // 初回マウント時にデータを生成
  }, [generate]);

  return (
    <div className="p-4 space-y-6">
      {isLoading && <p>データ生成中...</p>}
      {error && <p>エラーが発生しました: {error.message}</p>}
      {!isLoading && !error && <StatsDisplay />}
    </div>
  );
}