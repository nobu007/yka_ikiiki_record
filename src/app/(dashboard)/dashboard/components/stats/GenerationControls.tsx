'use client';

import { memo } from 'react';
import { DataGenerationConfig, EmotionDistributionPattern } from '@/domain/entities/DataGeneration';

const DISTRIBUTION_PATTERNS: { label: string; value: EmotionDistributionPattern }[] = [
  { label: '正規分布', value: 'normal' },
  { label: '二峰分布', value: 'bimodal' },
  { label: 'ストレス型', value: 'stress' },
  { label: 'ハッピー型', value: 'happy' }
];

interface Props {
  config: DataGenerationConfig;
  onUpdateStudentCount: (count: number) => void;
  onUpdatePeriodDays: (days: number) => void;
  onUpdateDistributionPattern: (pattern: EmotionDistributionPattern) => void;
  onToggleSeasonalEffects: () => void;
}

const GenerationControls = memo(function GenerationControls({
  config,
  onUpdateStudentCount,
  onUpdatePeriodDays,
  onUpdateDistributionPattern,
  onToggleSeasonalEffects
}: Props) {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          生徒数: {config.studentCount}名
        </label>
        <input
          type="range"
          min="10"
          max="500"
          value={config.studentCount}
          onChange={(e) => onUpdateStudentCount(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          記録期間: {config.periodDays}日
        </label>
        <input
          type="range"
          min="7"
          max="365"
          value={config.periodDays}
          onChange={(e) => onUpdatePeriodDays(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">感情分布パターン</label>
        <div className="grid grid-cols-2 gap-2">
          {DISTRIBUTION_PATTERNS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onUpdateDistributionPattern(value)}
              className={`p-2 text-sm rounded ${
                config.distributionPattern === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
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
        <label className="text-sm font-medium">季節変動を有効にする</label>
      </div>
    </>
  );
});

GenerationControls.displayName = 'GenerationControls';

export default GenerationControls;
