"use client";

import { memo } from "react";
import type { ClassCharacteristics } from "@/schemas/api";
import { GENERATION_CONSTRAINTS } from "@/lib/constants";

interface Props {
  characteristics: ClassCharacteristics;
  onUpdate: (_updates: Partial<ClassCharacteristics>) => void;
}

const ClassCharacteristicsEditor = memo(function ClassCharacteristicsEditor({
  characteristics,
  onUpdate,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">クラス特性</label>

      <div className="space-y-2">
        <label className="block text-xs">
          基準感情値: {characteristics.baselineEmotion}
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
          変動の大きさ: {characteristics.volatility}
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
          クラスの結束度: {characteristics.cohesion}
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
