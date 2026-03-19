import { memo } from "react";
import { USAGE_INSTRUCTIONS } from "@/lib/constants/messages";

export const UsageInstructions = memo(() => {
  return (
    <section className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {USAGE_INSTRUCTIONS.TITLE}
      </h3>
      <ol className="space-y-3 text-sm text-gray-700">
        {USAGE_INSTRUCTIONS.STEPS.map((instruction, index) => (
          <li key={index} className="flex">
            <span className="font-medium mr-2">{index + 1}.</span>
            <span>{instruction}</span>
          </li>
        ))}
      </ol>
    </section>
  );
});

UsageInstructions.displayName = "UsageInstructions";
