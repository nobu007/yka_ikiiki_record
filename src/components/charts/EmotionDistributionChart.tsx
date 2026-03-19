import { useMemo, memo } from "react";
import { EmotionChart } from "./EmotionChart";
import { UI_CONSTANTS } from "@/lib/constants/ui";
import { EMOTION_RANGES } from "@/lib/constants";
import { CHART_TITLES } from "@/lib/constants/messages";

export const EmotionDistributionChart = memo<{ data: number[] }>(({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: [...EMOTION_RANGES.LABELS],
      series: [
        {
          name: "分布",
          data,
        },
      ],
    }),
    [data],
  );

  return (
    <EmotionChart
      data={chartData}
      title={CHART_TITLES.EMOTION_DISTRIBUTION}
      type="bar"
      height={UI_CONSTANTS.CHART.HEIGHT.SMALL}
    />
  );
});

EmotionDistributionChart.displayName = "EmotionDistributionChart";
