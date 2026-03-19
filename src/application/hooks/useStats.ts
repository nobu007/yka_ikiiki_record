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
} from "@/lib/error-handler";

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
        validated.error || "不明なエラーが発生しました",
        ERROR_CODES.UNKNOWN,
      );
    }

    return validated;
  } catch (e) {
    if (e instanceof AppError) {
      throw e;
    }
    throw new AppError("不明なエラーが発生しました", ERROR_CODES.UNKNOWN);
  }
};

export function useStats() {
  const [error, setError] = useState<Error | null>(null);

  const {
    data: stats,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<StatsResponse>("/api/stats", fetcher, {
    onError: (err) => {
      setError(
        err instanceof Error ? err : new Error("不明なエラーが発生しました"),
      );
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
