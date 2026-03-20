"use client";

import { memo } from "react";
import type { ClassCharacteristics } from "@/schemas/api";
import { GENERATION_CONSTRAINTS } from "@/lib/constants";
import { DASHBOARD_CONTROLS } from "@/lib/constants/messages";

interface Props {
  characteristics: ClassCharacteristics;
  onUpdate: (updates: Partial<ClassCharacteristics>) => void;
}

const ClassCharacteristicsEditor = memo(function ClassCharacteristicsEditor({
  characteristics,
  onUpdate,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        {DASHBOARD_CONTROLS.CLASS_CHARACTERISTICS.TITLE}
      </label>

      <div className="space-y-2">
        <label className="block text-xs">
          {DASHBOARD_CONTROLS.CLASS_CHARACTERISTICS.BASELINE_EMOTION_LABEL}:{" "}
          {characteristics.baselineEmotion}
        </label>
        <input
          type="range"
          min={String(GENERATION_CONSTRAINTS.BASELINE_EMOTION.MIN)}
          max={String(GENERATION_CONSTRAINTS.BASELINE_EMOTION.MAX)}
          step="0.1"
          value={characteristics.baselineEmotion}
          onChange={(e) =>
            onUpdate({ baselineEmotion: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs">
          {DASHBOARD_CONTROLS.CLASS_CHARACTERISTICS.VOLATILITY_LABEL}:{" "}
          {characteristics.volatility}
        </label>
        <input
          type="range"
          min={String(GENERATION_CONSTRAINTS.VOLATILITY.MIN)}
          max={String(GENERATION_CONSTRAINTS.VOLATILITY.MAX)}
          step="0.1"
          value={characteristics.volatility}
          onChange={(e) => onUpdate({ volatility: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs">
          {DASHBOARD_CONTROLS.CLASS_CHARACTERISTICS.COHESION_LABEL}:{" "}
          {characteristics.cohesion}
        </label>
        <input
          type="range"
          min={String(GENERATION_CONSTRAINTS.COHESION.MIN)}
          max={String(GENERATION_CONSTRAINTS.COHESION.MAX)}
          step="0.1"
          value={characteristics.cohesion}
          onChange={(e) => onUpdate({ cohesion: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
});

ClassCharacteristicsEditor.displayName = "ClassCharacteristicsEditor";

export default ClassCharacteristicsEditor;
