import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { DownloadIcon, LoadingSpinner } from "@/components/common";
import { logError, normalizeError, AppError, ERROR_CODES } from "@/lib/error-handler";
import { API_ENDPOINTS } from "@/lib/constants/api";

type ExportFormat = "csv" | "xlsx";

interface ExportButtonProps {
  format: ExportFormat;
  disabled?: boolean;
  className?: string;
}

const ExportButtonComponent = memo<ExportButtonProps>(function ExportButton({
  format,
  disabled,
  className,
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);

      const response = await fetch(`${API_ENDPOINTS.EXPORT}?format=${format}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          ERROR_CODES.NETWORK,
          response.status,
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `records.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const appError = normalizeError(error);
      logError(appError, "ExportButton.handleExport");
    } finally {
      setIsExporting(false);
    }
  }, [format]);

  const formatLabel = format === "csv" ? "CSV" : "Excel";

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      aria-label={`Download as ${formatLabel}`}
      className={className}
    >
      {isExporting ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          Exporting...
        </>
      ) : (
        <>
          <DownloadIcon />
          Export {formatLabel}
        </>
      )}
    </Button>
  );
});

export const ExportButton = ExportButtonComponent;
ExportButton.displayName = "ExportButton";
