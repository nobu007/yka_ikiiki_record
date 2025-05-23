'use client';

import { useEffect } from 'react';
import useDataGeneration from '@/hooks/useDataGeneration';
import { StatsDisplay } from '../_components/StatsDisplay';

export default function DashboardPage() {
  const { generate, isLoading, error } = useDataGeneration();

  useEffect(() => {
    generate(); // 初回マウント時にシードAPIを実行
  }, [generate]);

  if (isLoading) return <p>データ生成中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return <StatsDisplay />;
}