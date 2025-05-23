"use client";

import { useEffect } from 'react';
import { useSeed } from '@/hooks/useSeed';
import DataGenerationButton from '../components/buttons/DataGenerationButton';
import StatsContainer from './StatsContainer';

export default function DashboardContainer() {
  const { generate, isLoading, error } = useSeed();

  useEffect(() => {
    generate().catch(console.error); // 初回マウント時にデータを生成
  }, [generate]);

  return (
    <div className="p-4 space-y-6">
      {/* データ生成ボタン */}
      <DataGenerationButton loading={isLoading} onGenerate={() => generate().catch(console.error)} />

      {/* ローディング／エラー／統計表示 */}
      {isLoading && <p>データ生成中...</p>}
      {error && <p className="text-red-500">エラー: {error.message}</p>}
      {!isLoading && !error && <StatsContainer />}
    </div>
  );
}