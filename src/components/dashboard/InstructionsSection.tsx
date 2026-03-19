import { memo } from "react";
import { INSTRUCTIONS_SECTION } from "@/lib/constants/messages";

interface Step {
  title: string;
  description: string;
  icon: string;
}

interface InstructionsConfig {
  title: string;
  subtitle: string;
  steps: readonly Step[];
  tips: readonly string[];
}

const INSTRUCTIONS_CONFIG: InstructionsConfig = {
  title: INSTRUCTIONS_SECTION.TITLE,
  subtitle: INSTRUCTIONS_SECTION.SUBTITLE,
  steps: INSTRUCTIONS_SECTION.STEPS,
  tips: INSTRUCTIONS_SECTION.TIPS,
} as const;

const StepNumber: React.FC<{ number: number }> = memo(({ number }) => (
  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
    <span className="text-blue-600 font-semibold text-sm">{number}</span>
  </div>
));

StepNumber.displayName = "StepNumber";

const StepIcon: React.FC<{ icon: string }> = memo(({ icon }) => (
  <svg
    className="h-6 w-6 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={icon}
    />
  </svg>
));

StepIcon.displayName = "StepIcon";

const InstructionStep: React.FC<{ step: Step; index: number }> = memo(
  ({ step, index }) => (
    <div className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-sm">
      <StepNumber number={index + 1} />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 mb-1">
          {step.title}
        </h3>
        <p className="text-sm text-gray-600">{step.description}</p>
      </div>
      <StepIcon icon={step.icon} />
    </div>
  ),
);

InstructionStep.displayName = "InstructionStep";

const StepsList: React.FC = memo(() => (
  <div className="space-y-4 mb-6">
    {INSTRUCTIONS_CONFIG.steps.map((step, index) => (
      <InstructionStep key={index} step={step} index={index} />
    ))}
  </div>
));

StepsList.displayName = "StepsList";

const TipItem: React.FC<{ tip: string }> = memo(({ tip }) => (
  <li className="flex items-start">
    <span className="text-yellow-500 mr-2">•</span>
    {tip}
  </li>
));

TipItem.displayName = "TipItem";

const TipsSection: React.FC = memo(() => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-center mb-2">
      <svg
        className="h-5 w-5 text-yellow-600 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <h4 className="text-sm font-medium text-yellow-800">
        {INSTRUCTIONS_SECTION.HINTS_TITLE}
      </h4>
    </div>
    <ul className="text-sm text-yellow-700 space-y-1">
      {INSTRUCTIONS_CONFIG.tips.map((tip, index) => (
        <TipItem key={index} tip={tip} />
      ))}
    </ul>
  </div>
));

TipsSection.displayName = "TipsSection";

export const InstructionsSection = memo(function InstructionsSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {INSTRUCTIONS_CONFIG.title}
        </h2>
        <p className="text-gray-600">{INSTRUCTIONS_CONFIG.subtitle}</p>
      </header>

      <StepsList />
      <TipsSection />
    </section>
  );
});

InstructionsSection.displayName = "InstructionsSection";
