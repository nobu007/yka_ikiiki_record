"use client";

import { memo } from "react";
import { useDashboard } from "@/hooks/useApp";
import { ErrorBoundary, LoadingOverlay } from "@/components/common";
import { Dashboard } from "@/components/Dashboard";
import { LOADING_MESSAGES } from "@/lib/constants/messages";

const DashboardPage = memo(function DashboardPage() {
  const { isGenerating, notification, handleGenerate, isLoadingMessage } =
    useDashboard();

  return (
    <ErrorBoundary>
      <LoadingOverlay
        isLoading={isGenerating}
        message={isLoadingMessage || LOADING_MESSAGES.GENERATING_DATA}
      />

      <Dashboard
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        notification={notification}
      />
    </ErrorBoundary>
  );
});

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
