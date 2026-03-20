import { useCallback, useMemo } from "react";
import { useStats as useApplicationStats } from "@/application/hooks/useStats";
import { globalLogger } from "@/lib/resilience";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * Presentation layer hook for consuming and formatting statistics data.
 *
 * Wraps the application layer's useStats hook to provide presentation-specific
 * error formatting and refetch error handling. This hook transforms raw
 * application data into UI-ready formats.
 *
 * @returns Object containing:
 *   - stats: Formatted statistics data or null if not loaded
 *   - error: Formatted error object with title and message, or null if no error
 *   - isLoading: Boolean indicating if data is currently being fetched
 *   - refetch: Function to manually trigger a data refetch with error handling
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { stats, error, isLoading, refetch } = useStats();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorAlert title={error.title} message={error.message} />;
 *
 *   return <StatsDisplay data={stats} onRefresh={refetch} />;
 * }
 * ```
 */
export const useStats = () => {
  const { stats, error, isLoading, refetch } = useApplicationStats();

  const displayError = useMemo(() => {
    if (!error) return null;
    return {
      title: ERROR_MESSAGES.TITLE,
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
