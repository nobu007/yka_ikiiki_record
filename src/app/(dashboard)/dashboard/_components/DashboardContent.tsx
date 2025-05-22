"use client";

import { useState } from "react";
import { Stats } from '@/types/stats';
import { useDataGeneration } from '@/hooks/useDataGeneration';
import DataGenerationButton from './DataGenerationButton';
import StatsDisplay from './StatsDisplay';

interface DashboardContentProps {
  initialStats: Stats;
}

export default function DashboardContent({ initialStats }: DashboardContentProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const { loading, generateData } = useDataGeneration(setStats);

  return (
    <div className="p-4 space-y-6">
      <DataGenerationButton loading={loading} onGenerate={generateData} />
      <StatsDisplay stats={stats} />
    </div>
  );
}