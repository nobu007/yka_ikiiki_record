import { useCallback, useMemo } from "react";
import { useStats as useApplicationStats } from "@/application/hooks/useStats";
import { globalLogger } from "@/lib/resilience";

export const useStats = () => {
  const { stats, error, isLoading, refetch } = useApplicationStats();

  const displayError = useMemo(() => {
    if (!error) return null;
    return {
      title: "エラーが発生しました",
      message: error.message,
    };
  }, [error]);

  const displayStats = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
    };
  }, [stats]);

  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      globalLogger.error("PRESENTATION", "REFETCH_ERROR", {
        component: "useStats",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [refetch]);

  return {
    stats: displayStats,
    error: displayError,
    isLoading,
    refetch: handleRefetch,
  };
};
