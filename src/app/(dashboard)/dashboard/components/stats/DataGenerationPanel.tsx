'use client';

import { useDataGeneration } from '@/application/hooks/useDataGeneration';
import { DataGenerationConfig, EmotionDistributionPattern } from '@/domain/entities/DataGeneration';
import { useState } from 'react';

const DISTRIBUTION_PATTERNS: { label: string; value: EmotionDistributionPattern }[] = [
  { label: '正規分布', value: 'normal' },
  { label: '二峰分布', value: 'bimodal' },
  { label: 'ストレス型', value: 'stress' },
  { label: 'ハッピー型', value: 'happy' }
];

interface Props {
  onGenerate: (config: DataGenerationConfig) => Promise<void>;
  className?: string;
}

interface NewEventForm {
  name: string;
  startDate: string;
  endDate: string;
  impact: number | '';
}

const DEFAULT_NEW_EVENT: NewEventForm = {
  name: '',
  startDate: '',
  endDate: '',
  impact: ''
};

export default function DataGenerationPanel({ onGenerate, className = '' }: Props) {
  const {
    config,
    isGenerating,
    error,
    updateStudentCount,
    updatePeriodDays,
    updateDistributionPattern,
    toggleSeasonalEffects,
    addEvent,
    removeEvent,
    updateClassCharacteristics,
    resetConfig,
    generateData
  } = useDataGeneration({ onGenerate });

  const [newEvent, setNewEvent] = useState<NewEventForm>(DEFAULT_NEW_EVENT);

  // イベントの追加ハンドラ
  const handleAddEvent = () => {
    if (
      newEvent.name &&
      newEvent.startDate &&
      newEvent.endDate &&
      typeof newEvent.impact === 'number'
    ) {
      addEvent({
        name: newEvent.name,
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        impact: newEvent.impact
      });
      setNewEvent(DEFAULT_NEW_EVENT);
    }
  };

  return (
    <div className={`space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4">データ生成設定</h2>

      {/* 生徒数設定 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          生徒数: {config.studentCount}名
        </label>
        <input
          type="range"
          min="10"
          max="500"
          value={config.studentCount}
          onChange={(e) => updateStudentCount(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 期間設定 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          記録期間: {config.periodDays}日
        </label>
        <input
          type="range"
          min="7"
          max="365"
          value={config.periodDays}
          onChange={(e) => updatePeriodDays(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 感情分布パターン */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">感情分布パターン</label>
        <div className="grid grid-cols-2 gap-2">
          {DISTRIBUTION_PATTERNS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updateDistributionPattern(value)}
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

      {/* 季節変動設定 */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.seasonalEffects}
          onChange={toggleSeasonalEffects}
          className="rounded"
        />
        <label className="text-sm font-medium">季節変動を有効にする</label>
      </div>

      {/* イベント設定 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">イベントの追加</label>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="イベント名"
            value={newEvent.name}
            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={newEvent.startDate}
              onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={newEvent.endDate}
              onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
              className="p-2 border rounded"
            />
          </div>

          <input
            type="number"
            placeholder="影響度 (-1.0 〜 1.0)"
            min="-1"
            max="1"
            step="0.1"
            value={newEvent.impact}
            onChange={(e) => setNewEvent(prev => ({
              ...prev,
              impact: e.target.value ? Number(e.target.value) : ''
            }))}
            className="w-full p-2 border rounded"
          />

          <button
            onClick={handleAddEvent}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            イベントを追加
          </button>
        </div>

        {/* イベントリスト */}
        <div className="space-y-2">
          {config.eventEffects.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-sm">
                {event.name} ({new Date(event.startDate).toLocaleDateString()} 〜 {new Date(event.endDate).toLocaleDateString()})
              </span>
              <button
                onClick={() => removeEvent(index)}
                className="text-red-500 hover:text-red-600"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* クラス特性設定 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">クラス特性</label>

        <div className="space-y-2">
          <label className="block text-xs">
            基準感情値: {config.classCharacteristics.baselineEmotion}
          </label>
          <input
            type="range"
            min="2.5"
            max="3.5"
            step="0.1"
            value={config.classCharacteristics.baselineEmotion}
            onChange={(e) => updateClassCharacteristics({ baselineEmotion: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs">
            変動の大きさ: {config.classCharacteristics.volatility}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={config.classCharacteristics.volatility}
            onChange={(e) => updateClassCharacteristics({ volatility: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs">
            クラスの結束度: {config.classCharacteristics.cohesion}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={config.classCharacteristics.cohesion}
            onChange={(e) => updateClassCharacteristics({ cohesion: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-2 text-red-500 bg-red-100 rounded">
          {error.message}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex space-x-2">
        <button
          onClick={generateData}
          disabled={isGenerating}
          className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : 'データを生成'}
        </button>

        <button
          onClick={resetConfig}
          disabled={isGenerating}
          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          リセット
        </button>
      </div>
    </div>
  );
}