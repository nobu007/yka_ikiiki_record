import { useState, useCallback } from 'react';
import {
  DataGenerationConfig,
  DEFAULT_CONFIG,
  EmotionDistributionPattern,
  EventEffect,
  ClassCharacteristics
} from '@/domain/entities/DataGeneration';

interface UseDataGenerationProps {
  onGenerate: (config: DataGenerationConfig) => Promise<void>;
}

export function useDataGeneration({ onGenerate }: UseDataGenerationProps) {
  const [config, setConfig] = useState<DataGenerationConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 生徒数の更新
  const updateStudentCount = useCallback((count: number) => {
    setConfig(prev => ({
      ...prev,
      studentCount: Math.max(10, Math.min(500, count))
    }));
  }, []);

  // 期間の更新
  const updatePeriodDays = useCallback((days: number) => {
    setConfig(prev => ({
      ...prev,
      periodDays: Math.max(7, Math.min(365, days))
    }));
  }, []);

  // 感情分布パターンの更新
  const updateDistributionPattern = useCallback((pattern: EmotionDistributionPattern) => {
    setConfig(prev => ({
      ...prev,
      distributionPattern: pattern
    }));
  }, []);

  // 季節変動の有効/無効切り替え
  const toggleSeasonalEffects = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      seasonalEffects: !prev.seasonalEffects
    }));
  }, []);

  // イベントの追加
  const addEvent = useCallback((event: EventEffect) => {
    setConfig(prev => ({
      ...prev,
      eventEffects: [...prev.eventEffects, event]
    }));
  }, []);

  // イベントの削除
  const removeEvent = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      eventEffects: prev.eventEffects.filter((_, i) => i !== index)
    }));
  }, []);

  // クラス特性の更新
  const updateClassCharacteristics = useCallback((characteristics: Partial<ClassCharacteristics>) => {
    setConfig(prev => ({
      ...prev,
      classCharacteristics: {
        ...prev.classCharacteristics,
        ...characteristics
      }
    }));
  }, []);

  // 設定のリセット
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // データ生成の実行
  const generateData = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await onGenerate(config);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('データ生成に失敗しました'));
    } finally {
      setIsGenerating(false);
    }
  }, [config, onGenerate]);

  return {
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
  };
}