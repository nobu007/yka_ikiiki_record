import useSWR from "swr";
import { StatsResponseSchema, StatsResponse } from "@/schemas/api";
import { useState, useCallback } from "react";
import { validateDataSafe } from "@/lib/api/validation";
import { withApiTimeout } from "@/lib/resilience/timeout";
import {
  NetworkError,
  ValidationError,
  AppError,
  ERROR_CODES,
  normalizeError,
} from "@/lib/error-handler";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { StatsData } from "@/schemas/api";

/**
 * Return type for useStats hook
 */
export type UseStatsResult = {
  /** Statistics data if successfully loaded */
  stats: StatsData | undefined;
  /** Error object if request failed */
  error: Error | undefined;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Function to manually trigger a refetch of the data */
  refetch: () => Promise<StatsResponse | undefined>;
};

/**
 * Fetches and validates statistics data from the API.
 *
 * @param {string} url - The API endpoint URL
 * @returns {Promise<StatsResponse>} Validated statistics response
 * @throws {NetworkError} If the API request fails
 * @throws {ValidationError} If response data validation fails
 * @throws {AppError} For other errors
 *
 * @internal This is used internally by useStats hook
 */
const fetcher = async (url: string): Promise<StatsResponse> => {
  try {
    const response = await withApiTimeout(fetch(url));
    if (!response.ok) {
      throw new NetworkError("APIリクエストに失敗しました", response.status);
    }

    const rawData = await response.json();

    const [validated, error] = validateDataSafe(rawData, StatsResponseSchema);
    if (error || !validated) {
      throw new ValidationError(error || "データの検証に失敗しました");
    }

    if (!validated.success) {
      throw new AppError(
        validated.error || ERROR_MESSAGES.UNKNOWN,
        ERROR_CODES.UNKNOWN,
      );
    }

    return validated;
  } catch (e) {
    if (e instanceof AppError) {
      throw e;
    }
    throw new AppError(ERROR_MESSAGES.UNKNOWN, ERROR_CODES.UNKNOWN);
  }
};

/**
 * React hook for fetching and managing statistics data.
 *
 * Provides automatic data fetching, caching, error handling, and refetching
 * capabilities for the statistics API endpoint. Uses SWR for data fetching
 * with timeout enforcement and Zod schema validation.
 *
 * @returns {UseStatsResult} Object containing:
 * - `stats`: Statistics data or undefined if loading/error
 * - `error`: Error object if request failed
 * - `isLoading`: Boolean indicating if data is being fetched
 * - `refetch`: Function to manually trigger a refetch
 *
 * @example
 * ```tsx
 * function StatsDisplay() {
 *   const { stats, error, isLoading, refetch } = useStats();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!stats) return null;
 *
 *   return <div>Count: {stats.overview.count}</div>;
 * }
 * ```
 */
export function useStats(): UseStatsResult {
  const [error, setError] = useState<AppError | null>(null);

  const {
    data: stats,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<StatsResponse>(API_ENDPOINTS.STATS, fetcher, {
    onError: (err) => {
      setError(normalizeError(err));
    },
  });

  const refetch = useCallback(() => {
    setError(null);
    return mutate();
  }, [mutate]);

  return {
    stats: stats?.data,
    error: error || swrError,
    isLoading,
    refetch,
  };
}
