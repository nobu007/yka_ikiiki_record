"use client";

import { memo } from "react";
import { useDataGeneration } from "@/application/hooks/useDataGeneration";
import type { DataGenerationConfig } from "@/schemas/api";
import GenerationControls from "./GenerationControls";
import EventManager from "./EventManager";
import ClassCharacteristicsEditor from "./ClassCharacteristicsEditor";

interface Props {
  onGenerate: (_config: DataGenerationConfig) => Promise<void>;
  className?: string;
}

const DataGenerationPanel = memo(function DataGenerationPanel({
  onGenerate,
  className = "",
}: Props) {
  const {
    config,
    isGenerating,
    error,
    updateStudentCount,
    updatePeriodDays,
    updateDistributionPattern,
    toggleSeasonalEffects,
    addEvent,
    removeEvent,
    updateClassCharacteristics,
    resetConfig,
    generateData,
  } = useDataGeneration({ onGenerate });

  return (
    <div
      className={`space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}
    >
      <h2 className="text-xl font-semibold mb-4">データ生成設定</h2>

      <GenerationControls
        config={config}
        onUpdateStudentCount={updateStudentCount}
        onUpdatePeriodDays={updatePeriodDays}
        onUpdateDistributionPattern={updateDistributionPattern}
        onToggleSeasonalEffects={toggleSeasonalEffects}
      />

      <EventManager
        events={config.eventEffects}
        onAddEvent={addEvent}
        onRemoveEvent={removeEvent}
      />

      <ClassCharacteristicsEditor
        characteristics={config.classCharacteristics}
        onUpdate={updateClassCharacteristics}
      />

      {error && (
        <div className="p-2 text-red-500 bg-red-100 rounded">
          {error.message}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={generateData}
          disabled={isGenerating}
          className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isGenerating ? "生成中..." : "データを生成"}
        </button>

        <button
          onClick={resetConfig}
          disabled={isGenerating}
          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          リセット
        </button>
      </div>
    </div>
  );
});

DataGenerationPanel.displayName = "DataGenerationPanel";

export default DataGenerationPanel;
