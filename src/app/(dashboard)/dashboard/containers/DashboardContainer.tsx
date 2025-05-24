"use client";

import { useEffect } from 'react';
import { useSeed } from '@/hooks/useSeed';
import DashboardTemplate from '../components/__templates__/DashboardTemplate';
import StatsContainer from './StatsContainer';

export default function DashboardContainer() {
  const { generate, isLoading, error } = useSeed();

  useEffect(() => {
    generate().catch(console.error); // 初回マウント時にデータを生成
  }, [generate]);

  return (
    <DashboardTemplate
      buttonProps={{
        label: "データを生成",
        onClick: () => generate().catch(console.error),
        loading: isLoading,
      }}
      displayProps={{
        loading: isLoading,
        error: error,
        // StatsContainerをchildren propsとして渡す
        data: !isLoading && !error ? <StatsContainer /> : undefined
      }}
      className="space-y-6"
    />
  );
}