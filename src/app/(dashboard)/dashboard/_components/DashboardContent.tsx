"use client";

import { useEffect } from 'react';
import useDataGeneration from '@/hooks/useDataGeneration';
import DataGenerationButton from './DataGenerationButton';
import StatsDisplay from './StatsDisplay';

export default function DashboardContent() {
  const { generate, isLoading, error } = useDataGeneration();

  useEffect(() => {
    generate(); // 初回マウント時にデータを生成
  }, [generate]);

  return (
    <div className="p-4 space-y-6">
      {/* データ生成ボタン */}
      <DataGenerationButton loading={isLoading} onGenerate={generate} />

      {/* ローディング／エラー／統計表示 */}
      {isLoading && <p>データ生成中...</p>}
      {error && <p className="text-red-500">エラー: {error.message}</p>}
      {!isLoading && !error && <StatsDisplay />}
    </div>
  );
}