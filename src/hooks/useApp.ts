"use client";

import { useState, useCallback } from "react";
import { APP_CONFIG } from "@/lib/config";
import { HTTP_METHODS, HTTP_HEADERS } from "@/lib/constants";
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
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  LOADING_MESSAGES,
} from "@/lib/constants/messages";

/**
 * Custom hook for managing dashboard data generation operations.
 *
 * This hook provides functionality to trigger seed data generation for the dashboard,
 * managing the generation state, notifications, and error handling. It uses the
 * application's default configuration for data generation parameters.
 *
 * @remarks
 * The hook integrates with the notification system to provide user feedback
 * during the generation process. It automatically handles API timeouts,
 * response validation, and error normalization.
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { isGenerating, notification, handleGenerate, isLoadingMessage } = useDashboard();
 *
 *   return (
 *     <div>
 *       {notification && <NotificationBanner {...notification} />}
 *       {isLoadingMessage && <LoadingSpinner message={isLoadingMessage} />}
 *       <button onClick={handleGenerate} disabled={isGenerating}>
 *         {isGenerating ? 'Generating...' : 'Generate Data'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns An object containing:
 *   - `isGenerating`: Boolean indicating whether data generation is in progress
 *   - `notification`: Current notification state (success/error) or null
 *   - `handleGenerate`: Async function to trigger seed data generation
 *   - `isLoadingMessage`: Loading message string during generation, null otherwise
 */
export function useDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { notification, showSuccess, showError, clearNotification } =
    useNotification();

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
          headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
          },
          body: JSON.stringify({ config }),
        }),
      );

      if (!response.ok) {
        throw new NetworkError(
          ERROR_MESSAGES.API_ERROR(response.status, response.statusText),
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
          validated.error || ERROR_MESSAGES.DEFAULT_GENERATION,
          ERROR_CODES.GENERATION,
        );
      }

      showSuccess(SUCCESS_MESSAGES.DATA_GENERATION_COMPLETE);
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
    isLoadingMessage: isGenerating ? LOADING_MESSAGES.GENERATING_DATA : null,
  };
}
