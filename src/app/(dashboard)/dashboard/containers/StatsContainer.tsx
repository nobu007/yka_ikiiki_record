'use client';

import { useStatsFetch } from '@/hooks/useStatsFetch';
import StatsDisplay from '../components/stats/StatsDisplay';

export default function StatsContainer() {
  const { stats, error, isLoading, refetch } = useStatsFetch();

  return (
    <StatsDisplay
      stats={stats!}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}