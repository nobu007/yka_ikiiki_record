import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";

export const EmotionDistributionChart = memo<{ data: number[] }>(({ data }) => {
  const labels = ["1", "2", "3", "4", "5"];
  const chartData = useMemo(
    () => ({
      labels,
      series: [
        {
          name: "分布",
          data,
        },
      ],
    }),
    [labels, data],
  );

  return (
    <EmotionChart
      data={chartData}
      title="感情スコア分布"
      type="bar"
      height={UI_CONSTANTS.CHART.HEIGHT.SMALL}
    />
  );
});

EmotionDistributionChart.displayName = "EmotionDistributionChart";
