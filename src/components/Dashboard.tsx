import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { APP_CONFIG } from "@/lib/config";
import { Button } from "./ui";
import { LoadingSpinner, CheckIcon, PlusIcon, Notification } from "./common";
import { UsageInstructions } from "./common/UsageInstructions";
import { DataVisualization } from "./dashboard/DataVisualization";
import { StatsResponseSchema, StatsData } from "@/schemas/api";
import { validateDataSafe } from "@/lib/api/validation";
import {
  normalizeError,
  logError,
  AppError,
  ERROR_CODES,
} from "@/lib/error-handler";
import { withApiTimeout } from "@/lib/resilience/timeout";
import { API_ENDPOINTS } from "@/lib/constants/api";
import {
  UI_TEXT,
  DASHBOARD_FEATURES,
  HELP_TEXT,
  DASHBOARD_EMPTY_STATE,
  LOADING_MESSAGES,
} from "@/lib/constants/messages";

interface DashboardProps {
  isGenerating: boolean;
  onGenerate: () => void;
  notification: {
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  };
  onNotificationClose?: () => void;
}

const DashboardComponent = memo<DashboardProps>(
  function Dashboard({ isGenerating, onGenerate, notification, onNotificationClose }) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const helpText = useMemo(
      () => (isGenerating ? HELP_TEXT.GENERATING : HELP_TEXT.READY),
      [isGenerating],
    );

    const fetchStats = useCallback(async () => {
      try {
        setIsLoading(true);
        const response = await withApiTimeout(fetch(API_ENDPOINTS.SEED));

        if (!response.ok) {
          throw new AppError(
            `HTTP ${response.status}: ${response.statusText}`,
            ERROR_CODES.NETWORK,
            response.status,
          );
        }

        const rawData = await response.json();

        const [validated, validationError] = validateDataSafe(
          rawData,
          StatsResponseSchema,
        );
        if (validationError || !validated) {
          throw new AppError(
            validationError || "API response validation failed",
            ERROR_CODES.VALIDATION,
            500,
          );
        }

        if (validated.success && validated.data) {
          setStats(validated.data);
        }
      } catch (error) {
        const appError = normalizeError(error);
        logError(appError, "Dashboard.fetchStats");
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchStats();
    }, [fetchStats]);

    useEffect(() => {
      if (notification.show && notification.type === "success") {
        fetchStats();
      }
    }, [notification.show, notification.type, fetchStats]);

    const featuresList = useMemo(
      () =>
        DASHBOARD_FEATURES.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <CheckIcon />
            {feature}
          </li>
        )),
      [],
    );

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {UI_TEXT.DASHBOARD.TITLE}
              </h1>
              <p className="text-gray-600">{APP_CONFIG.description}</p>
            </header>

            {notification.show && (
              <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                {...(onNotificationClose && { onClose: onNotificationClose })}
              />
            )}

            <main className="space-y-8">
              <section className="bg-gray-50 rounded-lg p-6">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {UI_TEXT.DASHBOARD.DATA_GENERATION}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {UI_TEXT.DASHBOARD.DATA_GENERATION_DESCRIPTION}
                  </p>

                  <div className="bg-white rounded-md p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {UI_TEXT.FEATURES.GENERATED_DATA}
                    </h3>
                    <ul className="space-y-2">{featuresList}</ul>
                  </div>
                </header>

                <div className="flex items-center justify-center">
                  <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    aria-describedby="generate-help"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        {UI_TEXT.DASHBOARD.GENERATING_BUTTON}
                      </>
                    ) : (
                      <>
                        <PlusIcon />
                        {UI_TEXT.DASHBOARD.GENERATE_BUTTON}
                      </>
                    )}
                  </Button>
                </div>

                <p
                  id="generate-help"
                  className="mt-4 text-sm text-gray-500 text-center"
                >
                  {helpText}
                </p>
              </section>

              <UsageInstructions />
            </main>
          </div>

          {/* Data Visualization Section */}
          {stats && !isLoading && <DataVisualization data={stats} />}

          {isLoading && (
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <LoadingSpinner size="md" />
              <p className="mt-4 text-gray-600">{LOADING_MESSAGES.CARD}</p>
            </div>
          )}

          {!stats && !isLoading && (
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {DASHBOARD_EMPTY_STATE.TITLE}
              </h3>
              <p className="text-gray-600 mb-4">
                {DASHBOARD_EMPTY_STATE.DESCRIPTION}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const Dashboard = DashboardComponent;
Dashboard.displayName = "Dashboard";
