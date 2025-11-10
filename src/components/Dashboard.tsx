import React, { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG, MESSAGES } from '@/lib/config';
import { Button, LoadingSpinner, CheckIcon, PlusIcon, Notification } from './ui';
import { UsageInstructions } from './common/UsageInstructions';
import { DataVisualization } from './dashboard/DataVisualization';
import { GeneratedStats } from '@/infrastructure/services/dataService';

interface DashboardProps {
  isGenerating: boolean;
  onGenerate: () => void;
  notification: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  onNotificationClose?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isGenerating,
  onGenerate,
  notification,
  onNotificationClose
}) => {
  const [stats, setStats] = useState<GeneratedStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const helpText = isGenerating 
    ? MESSAGES.ui.dashboard.helpTextGenerating
    : MESSAGES.ui.dashboard.helpTextReady;

  // Consolidated data fetching function
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/seed');
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Don't set stats on error to maintain previous state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch existing data when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh data after successful generation
  useEffect(() => {
    if (notification.show && notification.type === 'success') {
      fetchStats();
    }
  }, [notification.show, notification.type, fetchStats]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {MESSAGES.ui.dashboard.title}
            </h1>
            <p className="text-gray-600">
              {APP_CONFIG.description}
            </p>
          </header>
          
          {notification.show && (
            <Notification
              show={notification.show}
              message={notification.message}
              type={notification.type}
              onClose={onNotificationClose}
            />
          )}
          
          <main className="space-y-8">
            <section className="bg-gray-50 rounded-lg p-6">
              <header className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {MESSAGES.ui.dashboard.dataGeneration}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {MESSAGES.ui.dashboard.dataGenerationDescription}
                </p>
                
                <div className="bg-white rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    生成されるデータ
                  </h3>
                  <ul className="space-y-2">
                    {MESSAGES.ui.features.generatedData.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
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
                      {MESSAGES.ui.dashboard.generatingButton}
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      {MESSAGES.ui.dashboard.generateButton}
                    </>
                  )}
                </Button>
              </div>
              
              <p id="generate-help" className="mt-4 text-sm text-gray-500 text-center">
                {helpText}
              </p>
            </section>

            <UsageInstructions />
          </main>
        </div>

        {/* Data Visualization Section */}
        {stats && !isLoading && (
          <DataVisualization data={stats} />
        )}

        {isLoading && (
          <div className="bg-white shadow-lg rounded-xl p-8 text-center">
            <LoadingSpinner size="md" />
            <p className="mt-4 text-gray-600">データを読み込み中...</p>
          </div>
        )}

        {!stats && !isLoading && (
          <div className="bg-white shadow-lg rounded-xl p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">データがありません</h3>
            <p className="text-gray-600 mb-4">上のボタンをクリックしてテストデータを生成してください</p>
          </div>
        )}
      </div>
    </div>
  );
};