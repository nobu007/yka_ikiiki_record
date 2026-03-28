# SPEC: EmotionGenerator

## 概要
- **モジュール**: `src/domain/services/EmotionGenerator.ts`
- **責務**: 指定された設定、日付、学生インデックスに基づいて、現実的な感情値を生成する
- **関連する不変条件**:
  - INV-DOM-005: Emotion_Value_Precision
  - INV-DOM-010: Emotion_Pattern_Generation
  - INV-GEN-001: EmotionGenerator_Range_Validation
  - INV-GEN-003: EmotionGenerator_Distribution_Pattern_Support
  - INV-GEN-004: EmotionGenerator_Seasonal_Effects_Application
  - INV-GEN-005: EmotionGenerator_Event_Effects_Application
  - INV-GEN-006: EmotionGenerator_Class_Characteristics_Respect

## 入力契約
| パラメータ | 型 | 制約 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| config | `DataGenerationConfig` | distributionPatternは有効なパターン | なし | データ生成設定 |
| date | `Date` | 有効なDateオブジェクト | なし | 感情値を生成する対象日 |
| _studentIndex | `number` | 0以上の整数 | なし | 学生のインデックス（将来の個人別対応用） |

## DataGenerationConfig 構造
| プロパティ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| distributionPattern | `EmotionDistributionPattern` | "normal" \| "bimodal" \| "stress" \| "happy" | 感情分布パターン |
| classCharacteristics | `ClassCharacteristics` | baselineEmotion: [1.0, 5.0], volatility: [0, 1] | クラス特性 |
| seasonalEffects | `boolean` | true \| false | 季節効果を適用するか |
| eventEffects | `EventEffect[]` | 各effectはstartDate <= endDate | イベント効果配列 |

## 出力契約
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| emotion | `number` | [1.0, 5.0] の範囲内、小数点1桁精度 |

## エラー契約
この関数は例外をスローしない。すべての入力に対して有効な感情値を返す。

## 計算ロジック

### 1. 基本感情生成 (Base Emotion)
```
baseEmotion = generateBaseEmotion(distributionPattern)
```
- `normal`: 正規分布に基づく平均3.0のランダム値
- `bimodal`: 双峰分布（2つのピークを持つ分布）
- `stress`: 低めの感情値に偏った分布
- `happy`: 高めの感情値に偏った分布

### 2. クラス特性の適用
```
emotion = baseEmotion * (1 + (volatility - 0.5) * 0.4)
emotion += (baselineEmotion - 3.0) * 0.5
```
- volatilityが0.5より高い場合、感情値の分散が増加
- baselineEmotionが3.0より高い場合、感情値が上昇
- volatilityが0.5未満、baselineEmotionが3.0未満の場合、逆の効果

### 3. 季節効果の適用 (conditional)
```
if (seasonalEffects === true) {
  emotion += calculateSeasonalEffect(date)
}
```
- 月に基づく季節補正値を加算
- 春: +0.1, 夏: -0.1, 秋: 0.0, 冬: -0.1 (例)

### 4. イベント効果の適用
```
emotion += calculateEventEffect(date, eventEffects)
```
- dateがイベント期間内（startDate <= date <= endDate）の場合、影響値を加算
- 複数のイベントが重なる場合、合計値を加算

### 5. 感情値の制限
```
return clampEmotion(emotion)
```
- 最終値を [1.0, 5.0] の範囲にクランプ

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| distributionPattern = "normal", baselineEmotion = 3.0, volatility = 0.5 | [1.0, 5.0] の範囲内 | 標準設定 |
| distributionPattern = "normal", baselineEmotion = 1.0, volatility = 0.0 | 1.0 に近い値 | 最低ベースライン、低ボラティリティ |
| distributionPattern = "normal", baselineEmotion = 5.0, volatility = 0.0 | 5.0 に近い値 | 最高ベースライン、低ボラティリティ |
| distributionPattern = "stress" | 1.0-3.0 の範囲に偏る | ストレス分布 |
| distributionPattern = "happy" | 3.0-5.0 の範囲に偏る | 幸福分布 |
| seasonalEffects = true, date = 4月 | 春の補正が適用 | 季節効果 |
| eventEffects = [{impact: 0.5}, ...], date = 期間内 | 最大+0.5の影響 | イベント効果 |
| volatility = 1.0 | 分散が最大に | 最大ボラティリティ |
| volatility = 0.0 | 分散が最小に | 最小ボラティリティ |

## 不変条件チェック
- [x] INV-DOM-005: 生成される感情値は小数点以下1桁の精度をサポート
- [x] INV-DOM-010: すべての分布パターンは [1.0, 5.0] の範囲内の値を生成する
- [x] INV-GEN-001: EmotionGenerator は有効な感情値範囲 [1.0, 5.0] を出力する
- [x] INV-GEN-003: EmotionGenerator はすべての分布パターン (normal, bimodal, stress, happy) をサポートする
- [x] INV-GEN-004: seasonalEffects=true の場合、日付に基づいて季節効果を適用する
- [x] INV-GEN-005: 日付がイベント期間内の場合、イベント効果を適用する
- [x] INV-GEN-006: classCharacteristics.volatility と baselineEmotion を生成に使用する

## 依存関係
- `generateBaseEmotion`: utils/statsCalculator/generation.ts
- `calculateSeasonalEffect`: utils/statsCalculator/generation.ts
- `calculateEventEffect`: utils/statsCalculator/generation.ts
- `clampEmotion`: utils/statsCalculator/math.ts

## テスト戦略
1. **分布パターンテスト**: 各パターン (normal, bimodal, stress, happy) が適切な範囲の値を生成すること
2. **クラス特性テスト**: baselineEmotion と volatility が生成値に影響すること
3. **季節効果テスト**: seasonalEffects=true の場合、月に応じた補正が適用されること
4. **イベント効果テスト**: イベント期間内の日付に影響値が加算されること
5. **境界値テスト**: 極端な設定 (baselineEmotion=1.0/5.0, volatility=0.0/1.0) でも有効な範囲内の値が生成されること
6. **結合テスト**: 複数の効果（分布パターン + クラス特性 + 季節 + イベント）が組み合わさっても有効な範囲内の値が生成されること

## 使用例
```typescript
import { generateEmotion } from '@/domain/services/EmotionGenerator';
import { DEFAULT_CONFIG } from '@/schemas/api';

// 標準設定で感情値を生成
const emotion = generateEmotion(DEFAULT_CONFIG, new Date("2024-01-15"), 0);
// => 3.2

// ストレス分布 + 低ベースライン
const config = {
  ...DEFAULT_CONFIG,
  distributionPattern: "stress",
  classCharacteristics: {
    baselineEmotion: 2.0,
    volatility: 0.3,
    cohesion: 0.7
  }
};
const emotion = generateEmotion(config, new Date("2024-01-15"), 0);
// => 1.8
```

## パフォーマンス特性
- 計算複雑度: O(1) - 定数時間で完了
- メモリ使用: 最小 - 一時変数のみ
- 副作用: なし - 純粋関数

## 履歴
- 2026-03-29: SPEC作成 - 実装は既に存在
