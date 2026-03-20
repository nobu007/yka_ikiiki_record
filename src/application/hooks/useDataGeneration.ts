import { useState, useCallback } from "react";
import {
  DataGenerationConfig,
  DEFAULT_CONFIG,
  EmotionDistributionPattern,
  EventEffect,
  ClassCharacteristics,
} from "@/domain/entities/DataGeneration";
import { GENERATION_CONSTRAINTS } from "@/lib/constants";
import { normalizeError, type AppError } from "@/lib/error-handler";

/**
 * Props for useDataGeneration hook
 */
export interface UseDataGenerationProps {
  /** Callback function invoked when data generation is triggered */
  onGenerate: (_config: DataGenerationConfig) => Promise<void>;
}

/**
 * Return type for useDataGeneration hook
 */
export interface UseDataGenerationResult {
  /** Current data generation configuration */
  config: DataGenerationConfig;
  /** Whether data generation is currently in progress */
  isGenerating: boolean;
  /** Error from the last generation attempt, if any */
  error: AppError | null;
  /** Update the number of students to generate (clamped to constraints) */
  updateStudentCount: (count: number) => void;
  /** Update the time period in days (clamped to constraints) */
  updatePeriodDays: (days: number) => void;
  /** Update the emotion distribution pattern */
  updateDistributionPattern: (pattern: EmotionDistributionPattern) => void;
  /** Toggle seasonal effects on/off */
  toggleSeasonalEffects: () => void;
  /** Add an event effect to the configuration */
  addEvent: (event: EventEffect) => void;
  /** Remove an event effect by index */
  removeEvent: (index: number) => void;
  /** Update class characteristics (partial update) */
  updateClassCharacteristics: (characteristics: Partial<ClassCharacteristics>) => void;
  /** Reset configuration to defaults */
  resetConfig: () => void;
  /** Execute data generation with current configuration */
  generateData: () => Promise<void>;
}

/**
 * React hook for managing student record data generation configuration and execution.
 *
 * Provides a complete interface for configuring and triggering data generation
 * with support for student counts, time periods, distribution patterns, seasonal
 * effects, events, and class characteristics. All numeric inputs are automatically
 * clamped to system-defined constraints.
 *
 * @param {UseDataGenerationProps} props - Configuration options
 * @param {Function} props.onGenerate - Callback to execute data generation with the current config
 * @returns {UseDataGenerationResult} Object containing config state and control functions
 *
 * @example
 * ```tsx
 * function DataGenerator() {
 *   const { config, isGenerating, error, updateStudentCount, generateData } = useDataGeneration({
 *     onGenerate: async (config) => {
 *       await fetch('/api/seed', {
 *         method: 'POST',
 *         body: JSON.stringify(config),
 *       });
 *     },
 *   });
 *
 *   return (
 *     <>
 *       <input
 *         type="number"
 *         value={config.studentCount}
 *         onChange={(e) => updateStudentCount(Number(e.target.value))}
 *       />
 *       <button onClick={generateData} disabled={isGenerating}>
 *         {isGenerating ? 'Generating...' : 'Generate Data'}
 *       </button>
 *       {error && <div>{error.message}</div>}
 *     </>
 *   );
 * }
 * ```
 */
export function useDataGeneration({ onGenerate }: UseDataGenerationProps) {
  const [config, setConfig] = useState<DataGenerationConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

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
  } satisfies UseDataGenerationResult;
}
