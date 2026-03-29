# SPEC: AnomalyDetectionService

## 概要
- **モジュール**: `src/domain/services/AnomalyDetectionService.ts`
- **責務**: 学生の感情記録に対する統計的異常検知を行い、急激な変動、異常パターン、データの欠落を検出するドメインサービス
- **関連する不変条件**:
  - INV-DOM-001: Emotion Value Range (感情値は1.0-5.0の範囲内)
  - INV-DOM-005: Emotion Value Precision (小数点第1位までの精度)

## 入力契約

### detectAnomalies(records, options?)

| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| records | `Record[]` | 配列、空配列可、必須 | - |
| options | `Partial<AnomalyDetectionConfig>` | オプションオブジェクト、undefined可 | DEFAULT_ANOMALY_DETECTION_CONFIG |

### AnomalyDetectionConfig

| プロパティ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| stdDevThreshold | `number` | 0より大きい | 2 |
| minRecordsRequired | `number` | 1以上の整数 | 5 |
| maxDataGapDays | `number` | 1以上の整数 | 7 |
| enableEmotionSpikeDetection | `boolean` | - | true |
| enableEmotionDropDetection | `boolean` | - | true |
| enableUnusualPatternDetection | `boolean` | - | true |
| enableDataGapDetection | `boolean` | - | true |

## 出力契約

### 戻り値: Promise<Anomaly[]>

| 条件 | 保証する内容 |
|--------|-------------|
| 正常系 | 検出された異常の配列（異常がない場合は空配列） |
| 空配列入力 | 空配列を返す |
| 学生ごとの記録数不足 | その学生の分析をスキップ（minRecordsRequired未満） |
| 複数学生 | 各学生の記録を独立して分析し、全学生の異常を含む配列を返す |

### Anomalyオブジェクト構造

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| id | `string` | 一意な異常ID（`anomaly-{timestamp}-{random}`） |
| type | `AnomalyType` | EMOTION_SPIKE, EMOTION_DROP, UNUSUAL_PATTERN, DATA_GAPのいずれか |
| severity | `AnomalySeverity` | LOW, MEDIUM, HIGH, CRITICALのいずれか |
| description | `string` | 人間が読める異常の説明 |
| detectedAt | `Date` | 検出日時 |
| context | `AnomalyContext` | 異常のコンテキスト情報 |
| recommendations | `string[]` | 推奨アクションのリスト |
| acknowledged | `boolean` | 確認フラグ（常にfalse） |

### AnomalyContext構造

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| student | `string` | 対象学生名 |
| startDate | `Date` | 異常期間の開始日 |
| endDate | `Date` | 異常期間の終了日 |
| actualValue | `number` | 実測値 |
| expectedValue | `number` | 期待値（平均または閾値） |
| deviation | `number` | 乖離度 |
| metadata | `Record<string, unknown>` | 追加メタデータ（オプション） |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| 記録がnull/undefined | エラーをスローせず、空配列を返す | - |
| 無効なconfig値 | エラーをスローせず、デフォルト値を使用 | - |
| 計算エラー（空配列の平均など） | 0または安全なデフォルト値を返す | - |

## 境界値

| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 空配列 `[]` | `[]` | 異常なし |
| 記録数 < minRecordsRequired | `[]` | 分析スキップ |
| 記録数 = minRecordsRequired | 異常検出実行 | 最小分析実行 |
| 感情値 = 1.0（最小） | 正常処理 | INV-DOM-001準拠 |
| 感情値 = 5.0（最大） | 正常処理 | INV-DOM-001準拠 |
| 感情値 > mean + 3×stdDev | CRITICAL severity | 極端なスパイク |
| 感情値 < mean - 3×stdDev | CRITICAL severity | 極端なドロップ |
| データギャップ = maxDataGapDays | 異常なし | 閾値未満 |
| データギャップ = maxDataGapDays + 1 | LOW severity | 閾値超過 |
| データギャップ = maxDataGapDays × 3 | CRITICAL severity | 極端なギャップ |

## 検知アルゴリズム

### 1. Emotion Spike Detection（感情スパイク検知）
- **条件**: 感情値 > 平均 + (stdDevThreshold × 標準偏差)
- **Severity**:
  - CRITICAL: 3×標準偏差以上
  - HIGH: 2.5×標準偏差以上
  - MEDIUM: 2×標準偏差以上
  - LOW: 2×標準偏差未満
- **推奨事項**:
  - 記録された感情値の正確性を確認
  - 特別なイベントや祝典が発生したか確認
  - 4.5超の場合: 一時的な陽性状態か検討、ベースラインへの回帰をモニタ

### 2. Emotion Drop Detection（感情ドロップ検知）
- **条件**: 感情値 < 平均 - (stdDevThreshold × 標準偏差)
- **Severity**: Spikeと同じ基準
- **推奨事項**:
  - 外部ストレス要因や困難の有無を確認
  - 追加のサポートやカウンセリングの提供を検討
  - 2.0未満の場合: 緊急対応、最近の出来事や行動変化をレビュー

### 3. Unusual Pattern Detection（異常パターン検知）
- **条件**: 平均以上の感情値が3回以上連続
- **Severity**: 常にMEDIUM
- **推奨事項**:
  - 来週の感情パターンをモニタ
  - 気分に影響する外部要因を確認
  - この期間中のクラスダイナミクスをレビュー

### 4. Data Gap Detection（データギャップ検知）
- **条件**: 連続する記録間の日数 > maxDataGapDays
- **Severity**:
  - CRITICAL: ギャップ ≧ 3×maxDataGapDays
  - HIGH: ギャップ ≧ 2×maxDataGapDays
  - MEDIUM: ギャップ ≧ 1.5×maxDataGapDays
  - LOW: ギャップ < 1.5×maxDataGapDays
- **推奨事項**:
  - 学生の感情の毎日の記録の一貫性を確保
  - データ収集手順をレビュー
  - 14日超の場合: データが信頼できない可能性、学生の状況確認を検討

## 不変条件チェック

- [x] **INV-DOM-001**: 全感情値が1.0-5.0の範囲内であることを検証（入力Recordは既に検証済みと仮定）
- [x] **INV-DOM-005**: 感情値の小数点第1位までの精度を維持（計算結果の丸め処理）
- [x] **計算安全性**: 空配列、単一要素配列での標準偏差計算時の除算ゼロを防ぐ

## 実装上の制約

1. **学生ごとの独立分析**: 異なる学生の記録は混ぜて分析しない
2. **日付順ソート**: 分析前に記録を日付昇順でソート
3. **統計的仮定**: 感情値が正規分布に従うと仮定し、平均±標準偏差ベースの閾値を使用
4. **非破壊的**: 入力records配列を変更しない
5. **非同期**: メソッドはasyncであるが、実際のI/Oは行わない（将来の拡張用）

## テストカバレッジ要件

- [x] 正常系：スパイク、ドロップ、パターン、ギャップの各検知
- [x] 境界値：minRecordsRequired、stdDevThreshold、maxDataGapDays
- [x] 複数学生：各学生の独立分析
- [x] コンフィギュレーション：カスタム閾値、検知の有効/無効
- [x] エッジケース：空配列、日付なし、単一学生
- [x] Severity計算：偏差に基づく正しい分類
- [x] 推奨事項：異常タイプごとの適切な推奨

## 依存関係

- **入力**: `Record[]` from `@/schemas/api`
- **出力**: `Anomaly[]`, `AnomalyType`, `AnomalySeverity`, `AnomalyContext` from `@/domain/entities/Anomaly`
- **定数**: `DEFAULT_ANOMALY_DETECTION_CONFIG` from `@/domain/entities/Anomaly`

## 使用例

```typescript
const service = new AnomalyDetectionService({
  stdDevThreshold: 2.5,
  minRecordsRequired: 10,
  maxDataGapDays: 14
});

const anomalies = await service.detectAnomalies(studentRecords);

// 結果のフィルタリング
const criticalAnomalies = anomalies.filter(a => a.severity === AnomalySeverity.CRITICAL);
const spikeAnomalies = anomalies.filter(a => a.type === AnomalyType.EMOTION_SPIKE);
```
