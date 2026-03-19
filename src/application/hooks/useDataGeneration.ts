import { useState, useCallback } from "react";
import {
  DataGenerationConfig,
  DEFAULT_CONFIG,
  EmotionDistributionPattern,
  EventEffect,
  ClassCharacteristics,
  DATA_GENERATION_BOUNDS,
} from "@/domain/entities/DataGeneration";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

interface UseDataGenerationProps {
  onGenerate: (_config: DataGenerationConfig) => Promise<void>;
}

export function useDataGeneration({ onGenerate }: UseDataGenerationProps) {
  const [config, setConfig] = useState<DataGenerationConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStudentCount = useCallback((count: number) => {
    setConfig((prev) => ({
      ...prev,
      studentCount: Math.max(
        DATA_GENERATION_BOUNDS.MIN_STUDENTS,
        Math.min(DATA_GENERATION_BOUNDS.MAX_STUDENTS, count),
      ),
    }));
  }, []);

  const updatePeriodDays = useCallback((days: number) => {
    setConfig((prev) => ({
      ...prev,
      periodDays: Math.max(
        DATA_GENERATION_BOUNDS.MIN_PERIOD_DAYS,
        Math.min(DATA_GENERATION_BOUNDS.MAX_PERIOD_DAYS, days),
      ),
    }));
  }, []);

  const updateDistributionPattern = useCallback(
    (pattern: EmotionDistributionPattern) => {
      setConfig((prev) => ({
        ...prev,
        distributionPattern: pattern,
      }));
    },
    [],
  );

  const toggleSeasonalEffects = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      seasonalEffects: !prev.seasonalEffects,
    }));
  }, []);

  const addEvent = useCallback((event: EventEffect) => {
    setConfig((prev) => ({
      ...prev,
      eventEffects: [...prev.eventEffects, event],
    }));
  }, []);

  const removeEvent = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      eventEffects: prev.eventEffects.filter((_, i) => i !== index),
    }));
  }, []);

  const updateClassCharacteristics = useCallback(
    (characteristics: Partial<ClassCharacteristics>) => {
      setConfig((prev) => ({
        ...prev,
        classCharacteristics: {
          ...prev.classCharacteristics,
          ...characteristics,
        },
      }));
    },
    [],
  );

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const generateData = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await onGenerate(config);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(ERROR_MESSAGES.GENERATION));
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
    generateData,
  };
}
