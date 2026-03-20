import { useState, useCallback } from "react";
import {
  DataGenerationConfig,
  DEFAULT_CONFIG,
  EmotionDistributionPattern,
  EventEffect,
  ClassCharacteristics,
} from "@/domain/entities/DataGeneration";
import { GENERATION_CONSTRAINTS } from "@/lib/constants";
import { normalizeError } from "@/lib/error-handler";

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
        GENERATION_CONSTRAINTS.STUDENT_COUNT.MIN,
        Math.min(GENERATION_CONSTRAINTS.STUDENT_COUNT.MAX, count),
      ),
    }));
  }, []);

  const updatePeriodDays = useCallback((days: number) => {
    setConfig((prev) => ({
      ...prev,
      periodDays: Math.max(
        GENERATION_CONSTRAINTS.PERIOD_DAYS.MIN,
        Math.min(GENERATION_CONSTRAINTS.PERIOD_DAYS.MAX, days),
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
    } catch (error) {
      setError(normalizeError(error));
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
