import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CheckIcon, PlusIcon } from '@/components/common/Icons';
import { UI_TEXT, DATA_GENERATION_FEATURES } from '@/lib/constants/messages';
import { getButtonClasses } from '@/lib/constants/ui';

interface DataSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

const FeatureList = () => (
  <div className="bg-white rounded-md p-4 mb-6">
    <h3 className="text-sm font-medium text-gray-700 mb-3">{UI_TEXT.FEATURES.GENERATED_DATA}</h3>
    <ul className="space-y-2">
      {DATA_GENERATION_FEATURES.map((feature) => (
        <li key={feature} className="flex items-center text-sm text-gray-600">
          <CheckIcon />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

interface GenerateButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

const GenerateButton = ({ isGenerating, onClick }: GenerateButtonProps) => {
  const buttonClasses = getButtonClasses('primary', isGenerating);

  return (
    <button 
      onClick={onClick} 
      disabled={isGenerating} 
      className={buttonClasses}
      aria-describedby="generate-help"
    >
      {isGenerating ? (
        <>
          <LoadingSpinner size="sm" color="white" className="mr-2" />
          {UI_TEXT.DASHBOARD.GENERATING_BUTTON}
        </>
      ) : (
        <>
          <PlusIcon />
          {UI_TEXT.DASHBOARD.GENERATE_BUTTON}
        </>
      )}
    </button>
  );
};

export const DataSection = React.memo(({ isGenerating, onGenerate }: DataSectionProps) => {
  const helpText = isGenerating 
    ? UI_TEXT.DASHBOARD.HELP_TEXT_GENERATING
    : UI_TEXT.DASHBOARD.HELP_TEXT_READY;

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {UI_TEXT.DASHBOARD.DATA_GENERATION}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {UI_TEXT.DASHBOARD.DATA_GENERATION_DESCRIPTION}
        </p>
        <FeatureList />
      </header>
      
      <div className="flex items-center justify-center">
        <GenerateButton isGenerating={isGenerating} onClick={onGenerate} />
      </div>
      
      <p id="generate-help" className="mt-4 text-sm text-gray-500 text-center">
        {helpText}
      </p>
    </section>
  );
});
DataSection.displayName = 'DataSection';