"use client";

import { useState, useCallback } from "react";
import { APP_CONFIG, MESSAGES } from "@/lib/config";
import { HTTP_METHODS } from "@/lib/constants";
import {
  normalizeError,
  getUserFriendlyMessage,
  logError,
  NetworkError,
  ValidationError,
  AppError,
  ERROR_CODES,
} from "@/lib/error-handler";
import { SeedResponseSchema } from "@/schemas/api";
import { validateDataSafe } from "@/lib/api/validation";
import { withApiTimeout } from "@/lib/resilience/timeout";
import { useNotification } from "@/hooks/useNotification";

export function useDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  const handleGenerate = useCallback(async () => {
    try {
      setIsGenerating(true);
      clearNotification();

      const config = {
        periodDays: APP_CONFIG.generation.defaultPeriodDays,
        studentCount: APP_CONFIG.generation.defaultStudentCount,
        distributionPattern: APP_CONFIG.generation.defaultPattern,
      };

      const response = await withApiTimeout(
        fetch(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.seed}`, {
          method: HTTP_METHODS.POST,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        }),
      );

      if (!response.ok) {
        throw new NetworkError(
          MESSAGES.error.api(response.status, response.statusText),
          response.status,
        );
      }

      const rawData = await response.json();

      const [validated, validationError] = validateDataSafe(
        rawData,
        SeedResponseSchema,
      );
      if (validationError || !validated) {
        throw new ValidationError(
          validationError || "API response validation failed",
        );
      }

      if (!validated.success) {
        throw new AppError(
          validated.error || MESSAGES.error.generation,
          ERROR_CODES.GENERATION,
        );
      }

      showSuccess(MESSAGES.success.dataGeneration);
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError, "useDashboard.handleGenerate");
      showError(getUserFriendlyMessage(appError));
    } finally {
      setIsGenerating(false);
    }
  }, [clearNotification, showSuccess, showError]);

  return {
    isGenerating,
    notification,
    handleGenerate,
    isLoadingMessage: isGenerating ? MESSAGES.loading.generating : null,
  };
}
