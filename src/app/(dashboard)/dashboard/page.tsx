'use client';

import { useEffect } from 'react';
import useDataGeneration from '@/hooks/useDataGeneration';
import DataGenerationButton from './_components/DataGenerationButton';
import StatsDisplay from './_components/StatsDisplay';

export default function DashboardPage() {
  const { generate, isLoading, error } = useDataGeneration();

  useEffect(() => {
    generate(); // 初回マウント時にシードAPIを実行
  }, [generate]);

  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div className="p-4 space-y-6">
      <DataGenerationButton loading={isLoading} onGenerate={generate} />
      <StatsDisplay />
    </div>
  );
}