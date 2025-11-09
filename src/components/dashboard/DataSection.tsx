import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UI_TEXT, DATA_GENERATION_FEATURES } from '@/lib/constants/messages';

interface DataSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

const CheckIcon = () => (
  <svg 
    className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" 
    fill="currentColor" 
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
      clipRule="evenodd" 
    />
  </svg>
);

const PlusIcon = () => (
  <svg 
    className="h-5 w-5 mr-2" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
    />
  </svg>
);

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
  const buttonClasses = `
    inline-flex items-center justify-center px-6 py-3 border border-transparent 
    text-base font-medium rounded-md text-white transition-all duration-200 
    transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400
    ${isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
  `;

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

export const DataSection = ({ isGenerating, onGenerate }: DataSectionProps) => {
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
};