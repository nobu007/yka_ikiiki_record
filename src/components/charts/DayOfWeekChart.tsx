import React, { useMemo } from 'react';
import { EmotionChart } from './EmotionChart';

export const DayOfWeekChart = React.memo<{ data: Array<{ day: string; avgEmotion: number }> }>(({ data }) => {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.day),
    series: [{
      name: '平均感情スコア',
      data: data.map(d => d.avgEmotion)
    }]
  }), [data]);

  return (
    <EmotionChart
      data={chartData}
      title="曜日別感情スコア"
      type="bar"
      height={300}
    />
  );
});

DayOfWeekChart.displayName = 'DayOfWeekChart';
