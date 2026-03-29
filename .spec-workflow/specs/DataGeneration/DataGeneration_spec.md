Version: 1.0.0
Last Updated: 2026-03-30
# SPEC: DataGeneration

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|------------|------|
| N/A | - | - | - | - | (パラメータなし) |
## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| N/A | - | - | (戻り値なし) |
## 概要
- **モジュール**: `src/domain/entities/DataGeneration.ts`
- **責務**: データ生成のための型定義、定数、デフォルト設定を提供する
- **関連する不変条件**:
  - INV-DOM-008: Data_Generation_Configuration_Validation
  - INV-DOM-009: Seasonal_Effect_Bounds
  - INV-DOM-010: Emotion_Pattern_Generation
  - INV-GEN-001: EmotionGenerator_Range_Validation
  - INV-GEN-002: DataGeneration_Defaults_Existence

## エクスポートされる型と定数

### 1. EmotionDistributionPattern
感情値の分布パターンを表す型定義。

```typescript
type EmotionDistributionPattern = "normal" | "bimodal" | "stress" | "happy"
```

| パターン | 説明 | 感情値の傾向 |
|---------|------|------------|
| normal | 正規分布 | 平均3.0を中心としたBell curve |
| bimodal | 双峰分布 | 2つのピークを持つ分布 |
| stress | ストレス分布 | 1.0-3.0の範囲に偏る |
| happy | 幸福分布 | 3.0-5.0の範囲に偏る |

### 2. SeasonalEffect
季節ごとの感情補正値を表す型定義。

```typescript
type SeasonalEffect = {
  spring: number;   // 春の補正値
  summer: number;   // 夏の補正値
  autumn: number;   // 秋の補正値
  winter: number;   // 冬の補正値
}
```

**制約**:
- すべての値は非負（>= 0）: INV-DOM-012
- 値の範囲: [0, ∞)

### 3. EventEffect
特定の期間中に発生するイベントの影響を表す型定義。

```typescript
type EventEffect = {
  name: string;        // イベント名
  startDate: Date;     // 開始日
  endDate: Date;       // 終了日
  impact: number;      // 影響値
}
```

**制約**:
- startDate <= endDate（開始日は終了日より前である必要がある）
- impact の範囲: [0, MAX_EVENT_IMPACT] (MAX_EVENT_IMPACT = 0.5)

### 4. ClassCharacteristics
クラスの特性を表す型定義。

```typescript
type ClassCharacteristics = {
  baselineEmotion: number;  // ベースライン感情値 [1.0, 5.0]
  volatility: number;       // ボラティリティ [0, 1]
  cohesion: number;         // 凝結性 [0, 1]
}
```

**制約**:
- baselineEmotion: [1.0, 5.0] (EMOTION_CONSTANTS の範囲)
- volatility: [0, 1] (0 = 変化なし、1 = 最大の変化)
- cohesion: [0, 1] (0 = バラバラ、1 = 凝結している)

### 5. DataGenerationConfig
データ生成設定を表すインターフェース。

```typescript
interface DataGenerationConfig {
  studentCount: number;              // 学生数
  periodDays: number;                // 生成期間（日数）
  distributionPattern: EmotionDistributionPattern;  // 分布パターン
  seasonalEffects: boolean;          // 季節効果を適用するか
  eventEffects: EventEffect[];       // イベント効果配列
  classCharacteristics: ClassCharacteristics;  // クラス特性
}
```

**入力契約**:

| プロパティ | 型 | 制約 | デフォルト値 |
|-----------|-----|------|------------|
| studentCount | `number` | [MIN_STUDENTS, MAX_STUDENTS] = [10, 500] | 30 |
| periodDays | `number` | [MIN_PERIOD_DAYS, MAX_PERIOD_DAYS] = [7, 365] | 30 |
| distributionPattern | `EmotionDistributionPattern` | "normal" \| "bimodal" \| "stress" \| "happy" | "normal" |
| seasonalEffects | `boolean` | true \| false | false |
| eventEffects | `EventEffect[]` | 空配列または有効なEventEffectの配列 | [] |
| classCharacteristics | `ClassCharacteristics` | baselineEmotion: [1.0, 5.0], volatility: [0, 1], cohesion: [0, 1] | {baselineEmotion: 3.0, volatility: 0.5, cohesion: 0.7} |

### 6. EMOTION_CONSTANTS
感情値に関する定数。

```typescript
const EMOTION_CONSTANTS = {
  MIN_EMOTION: 1.0,           // 最小感情値
  MAX_EMOTION: 5.0,           // 最大感情値
  DEFAULT_STDDEV: 0.5,        // デフォルト標準偏差
  SEASONAL_IMPACT: 0.2,       // 季節効果の最大影響値
  MAX_EVENT_IMPACT: 0.5,      // イベント効果の最大影響値
} as const
```

**制約**:
- MIN_EMOTION < MAX_EMOTION
- DEFAULT_STDDEV > 0
- SEASONAL_IMPACT ∈ [0, 1]
- MAX_EVENT_IMPACT ∈ [0, 1]

### 7. DATA_GENERATION_BOUNDS
データ生成の範囲制限。

```typescript
const DATA_GENERATION_BOUNDS = {
  MIN_STUDENTS: 10,      // 最小学生数
  MAX_STUDENTS: 500,     // 最大学生数
  MIN_PERIOD_DAYS: 7,    // 最小期間（日数）
  MAX_PERIOD_DAYS: 365,  // 最大期間（日数）
} as const
```

### 8. DEFAULT_CONFIG
データ生成のデフォルト設定（@/schemas/api から再エクスポート）。

```typescript
const DEFAULT_CONFIG: DataGenerationConfig = {
  studentCount: 30,
  periodDays: 30,
  distributionPattern: "normal",
  seasonalEffects: false,
  eventEffects: [],
  classCharacteristics: {
    baselineEmotion: 3.0,
    volatility: 0.5,
    cohesion: 0.7,
  }
}
```

**制約**:
- studentCount: [10, 500] の範囲内の正の整数
- periodDays: [7, 365] の範囲内の正の整数
- distributionPattern: 有効なパターン値
- seasonalEffects: boolean型
- eventEffects: 空の配列
- classCharacteristics.baselineEmotion: [1.0, 5.0] の範囲内
- classCharacteristics.volatility: 正の値
- classCharacteristics.cohesion: [0, 1] の範囲内

## 型エイリアス

### EmotionRanges
EMOTION_CONSTANTS の型エイリアス。

```typescript
type EmotionRanges = typeof EMOTION_CONSTANTS
```

### GenerationBounds
DATA_GENERATION_BOUNDS の型エイリアス。

```typescript
type GenerationBounds = typeof DATA_GENERATION_BOUNDS
```

## 境界値

### DataGenerationConfig
| プロパティ | 最小値 | 最大値 | 境界値テストケース |
|-----------|-------|-------|-----------------|
| studentCount | 10 | 500 | 10, 11, 499, 500 |
| periodDays | 7 | 365 | 7, 8, 364, 365 |
| distributionPattern | - | - | "normal", "bimodal", "stress", "happy" |
| seasonalEffects | - | - | true, false |
| eventEffects.length | 0 | ∞ | 0, 1, 10 |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | 不正な型 | (型不正な入力) | 例外発生 | TypeError |
| ERR-002 | None入力 | null | 例外発生/デフォルト動作 | TypeError/ValueError |
| ERR-003 | 空コレクション | [] | 例外発生/デフォルト動作 | ValueError |

| classCharacteristics.baselineEmotion | 1.0 | 5.0 | 1.0, 1.1, 4.9, 5.0 |
| classCharacteristics.volatility | 0 | 1 | 0, 0.1, 0.9, 1.0 |
| classCharacteristics.cohesion | 0 | 1 | 0, 0.1, 0.9, 1.0 |

### EMOTION_CONSTANTS
| 定数 | 値 | 検証項目 |
|------|-----|---------|
| MIN_EMOTION | 1.0 | MIN_EMOTION < MAX_EMOTION |
| MAX_EMOTION | 5.0 | MAX_EMOTION > MIN_EMOTION |
| DEFAULT_STDDEV | 0.5 | DEFAULT_STDDEV > 0 |
| SEASONAL_IMPACT | 0.2 | 0 <= SEASONAL_IMPACT <= 1 |
| MAX_EVENT_IMPACT | 0.5 | 0 <= MAX_EVENT_IMPACT <= 1 |

### DATA_GENERATION_BOUNDS
| 定数 | 値 | 検証項目 |
|------|-----|---------|
| MIN_STUDENTS | 10 | MIN_STUDENTS < MAX_STUDENTS |
| MAX_STUDENTS | 500 | MAX_STUDENTS > MIN_STUDENTS |
| MIN_PERIOD_DAYS | 7 | MIN_PERIOD_DAYS < MAX_PERIOD_DAYS |
| MAX_PERIOD_DAYS | 365 | MAX_PERIOD_DAYS > MIN_PERIOD_DAYS |

## 不変条件チェック
- [x] INV-DOM-008: DataGenerationConfig は studentCount > 0, periodDays > 0, 有効な distributionPattern, [1.0, 5.0] の classCharacteristics を検証する
- [x] INV-DOM-009: SeasonalEffect の値（spring/summer/autumn/winter）は非負
- [x] INV-DOM-010: すべての感情分布パターンは [1.0, 5.0] の範囲内の値を生成する
- [x] INV-GEN-001: EMOTION_CONSTANTS は有効な感情値範囲 [1.0, 5.0] を定義する
- [x] INV-GEN-002: DataGenerationConfig はすべてのオプションフィールドにデフォルト値を持つ

## 依存関係
- `@/schemas/api`: DEFAULT_CONFIG の定義元
- `@/lib/constants`: EMOTION_RANGES の定義元（検証用）

## テスト戦略
1. **DEFAULT_CONFIG テスト**: すべてのプロパティが制約を満たすことを検証
2. **EMOTION_CONSTANTS テスト**: 定数値の妥当性を検証
3. **DATA_GENERATION_BOUNDS テスト**: 範囲定義の妥当性を検証
4. **型テスト**: 各型定義が正しくエクスポートされることを検証
5. **境界値テスト**: 各プロパティの最小値、最大値、境界付近の値を検証
6. **統合テスト**: DataGenerationConfig が関連する定数と整合していることを検証

## 使用例
```typescript
import {
  DEFAULT_CONFIG,
  EMOTION_CONSTANTS,
  DATA_GENERATION_BOUNDS,
  type DataGenerationConfig,
  type EmotionDistributionPattern
} from '@/domain/entities/DataGeneration';

// デフォルト設定を使用
const config1: DataGenerationConfig = DEFAULT_CONFIG;

// カスタム設定を作成
const config2: DataGenerationConfig = {
  ...DEFAULT_CONFIG,
  studentCount: 50,
  periodDays: 90,
  distributionPattern: "bimodal",
  seasonalEffects: true,
  eventEffects: [
    {
      name: "Exam Week",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-07"),
      impact: 0.3
    }
  ],
  classCharacteristics: {
    baselineEmotion: 2.5,
    volatility: 0.7,
    cohesion: 0.8
  }
};

// 定数を参照
const minEmotion = EMOTION_CONSTANTS.MIN_EMOTION;  // 1.0
const maxStudents = DATA_GENERATION_BOUNDS.MAX_STUDENTS;  // 500
```

## パフォーマンス特性
- すべての値はコンパイル時に決定される定数
- 実行時の計算コスト: なし
- メモリ使用: 最小 - 型定義のみ

## 関連モジュール
- `src/domain/services/EmotionGenerator.ts`: DataGenerationConfig を使用して感情値を生成
- `src/domain/services/StatsService.ts`: DataGenerationConfig を使用して統計データを生成
- `src/schemas/api.ts`: DEFAULT_CONFIG の定義元

## 履歴
- 2026-03-29: SPEC作成 - 実装は既に存在


## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: (このSPECに関連する機能)
- 影響範囲: (このSPECを使用しているモジュール)
- 回帰テストケース: (変更時の挙動確認)
