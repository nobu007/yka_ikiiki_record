import { useState, useCallback } from "react";
import { DataGenerationConfig } from "@/domain/entities/DataGeneration";
import {
  AppError,
  NetworkError,
  normalizeError,
  logError,
} from "@/lib/error-handler";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import { HTTP_METHODS, HTTP_HEADERS } from "@/lib/constants";
import { SeedResponseSchema } from "@/schemas/api";
import { validateDataSafe } from "@/lib/api/validation";
import { withApiTimeout } from "@/lib/resilience/timeout";

/**
 * Custom hook for managing seed data generation with custom configuration.
 *
 * This hook provides a lower-level interface for generating seed data with
 * custom configuration parameters. Unlike `useDashboard` which uses default
 * configuration, this hook allows callers to specify custom period days,
 * student count, and distribution patterns.
 *
 * @remarks
 * The hook throws errors on failure, allowing calling code to handle
 * errors appropriately. It integrates with the autonomous resilience
 * protocols through API timeout enforcement and structured error handling.
 *
 * @example
 * ```tsx
 * function SeedControlPanel() {
 *   const { isGenerating, error, generateSeed } = useSeedGeneration();
 *
 *   const handleGenerate = async () => {
 *     try {
 *       await generateSeed({
 *         periodDays: 90,
 *         studentCount: 30,
 *         distributionPattern: 'random',
 *       });
 *       // Success - handle completion
 *     } catch (err) {
 *       // Error already captured in hook state
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {error && <ErrorMessage error={error} />}
 *       <button onClick={handleGenerate} disabled={isGenerating}>
 *         Generate Custom Seed
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns An object containing:
 *   - `isGenerating`: Boolean indicating whether generation is in progress
 *   - `error`: AppError if generation failed, null otherwise
 *   - `generateSeed`: Async function that accepts a DataGenerationConfig
 *                    and triggers seed data generation
 */
export function useSeedGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const generateSeed = useCallback(
    async (config: DataGenerationConfig): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await withApiTimeout(
          fetch(API_ENDPOINTS.SEED, {
            method: HTTP_METHODS.POST,
            headers: {
              [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
            },
            body: JSON.stringify({ config }),
          }),
        );

        if (!response.ok) {
          throw new NetworkError(
            ERROR_MESSAGES.API_ERROR(response.status, response.statusText),
          );
        }

        const rawData = await response.json();

        const [validated, validationError] = validateDataSafe(
          rawData,
          SeedResponseSchema,
        );
        if (validationError || !validated) {
          throw new AppError(
            validationError || "API response validation failed",
            "VALIDATION_ERROR",
          );
        }

        if (!validated.success) {
          throw new AppError(
            validated.error || ERROR_MESSAGES.DEFAULT_GENERATION,
            "GENERATION_ERROR",
          );
        }
      } catch (e) {
        const appError = normalizeError(e);
        logError(appError, "useSeedGeneration.generateSeed");
        setError(appError);
        throw appError;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { isGenerating, error, generateSeed };
}
