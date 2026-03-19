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
import { HTTP_METHODS } from "@/lib/constants";
import { SeedResponseSchema } from "@/schemas/api";
import { validateDataSafe } from "@/lib/api/validation";
import { withApiTimeout } from "@/lib/resilience/timeout";

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
            headers: { "Content-Type": "application/json" },
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
