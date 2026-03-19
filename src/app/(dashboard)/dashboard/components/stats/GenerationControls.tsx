"use client";

import { memo } from "react";
import type {
  DataGenerationConfig,
  EmotionDistributionPattern,
} from "@/schemas/api";
import { GENERATION_CONSTRAINTS } from "@/lib/constants";
import { DASHBOARD_CONTROLS } from "@/lib/constants/messages";

const DISTRIBUTION_PATTERNS: {
  label: string;
  value: EmotionDistributionPattern;
}[] = [
  { label: DASHBOARD_CONTROLS.DISTRIBUTION_PATTERNS.NORMAL, value: "normal" },
  { label: DASHBOARD_CONTROLS.DISTRIBUTION_PATTERNS.BIMODAL, value: "bimodal" },
  { label: DASHBOARD_CONTROLS.DISTRIBUTION_PATTERNS.STRESS, value: "stress" },
  { label: DASHBOARD_CONTROLS.DISTRIBUTION_PATTERNS.HAPPY, value: "happy" },
] as const;

interface Props {
  config: DataGenerationConfig;
  onUpdateStudentCount: (_count: number) => void;
  onUpdatePeriodDays: (_days: number) => void;
  onUpdateDistributionPattern: (_pattern: EmotionDistributionPattern) => void;
  onToggleSeasonalEffects: () => void;
}

const GenerationControls = memo(function GenerationControls({
  config,
  onUpdateStudentCount,
  onUpdatePeriodDays,
  onUpdateDistributionPattern,
  onToggleSeasonalEffects,
}: Props) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="studentCount" className="block text-sm font-medium">
          {DASHBOARD_CONTROLS.STUDENT_COUNT_LABEL}: {config.studentCount}名
        </label>
        <input
          id="studentCount"
          type="range"
          min={String(GENERATION_CONSTRAINTS.STUDENT_COUNT.MIN)}
          max={String(GENERATION_CONSTRAINTS.STUDENT_COUNT.MAX)}
          value={config.studentCount}
          onChange={(e) => onUpdateStudentCount(Number(e.target.value))}
          className="w-full"
          aria-label={DASHBOARD_CONTROLS.STUDENT_COUNT_LABEL}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="periodDays" className="block text-sm font-medium">
          {DASHBOARD_CONTROLS.PERIOD_DAYS_LABEL}: {config.periodDays}日
        </label>
        <input
          id="periodDays"
          type="range"
          min={String(GENERATION_CONSTRAINTS.PERIOD_DAYS.MIN)}
          max={String(GENERATION_CONSTRAINTS.PERIOD_DAYS.MAX)}
          value={config.periodDays}
          onChange={(e) => onUpdatePeriodDays(Number(e.target.value))}
          className="w-full"
          aria-label={DASHBOARD_CONTROLS.PERIOD_DAYS_LABEL}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {DASHBOARD_CONTROLS.EMOTION_DISTRIBUTION_PATTERN}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DISTRIBUTION_PATTERNS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onUpdateDistributionPattern(value)}
              className={`p-2 text-sm rounded ${
                config.distributionPattern === value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.seasonalEffects}
          onChange={onToggleSeasonalEffects}
          className="rounded"
        />
        <label className="text-sm font-medium">
          {DASHBOARD_CONTROLS.SEASONAL_EFFECTS_CHECKBOX}
        </label>
      </div>
    </>
  );
});

GenerationControls.displayName = "GenerationControls";

export default GenerationControls;
