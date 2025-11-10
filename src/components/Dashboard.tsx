import React from 'react';
import { APP_CONFIG, MESSAGES } from '@/lib/config';
import { Button, LoadingSpinner, CheckIcon, PlusIcon, Notification } from './ui';
import { UsageInstructions } from './common/UsageInstructions';

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
  const helpText = isGenerating 
    ? MESSAGES.ui.dashboard.helpTextGenerating
    : MESSAGES.ui.dashboard.helpTextReady;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
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
      </div>
    </div>
  );
};