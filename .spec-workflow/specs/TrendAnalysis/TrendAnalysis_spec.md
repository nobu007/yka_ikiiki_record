# SPEC: TrendAnalysis

## 概要
- **モジュール**: `src/domain/entities/TrendAnalysis.ts`
- **責務**: 生徒およびクラスの感情データの長期的トレンド分析を提供する
- **関連する不変条件**: INV-DOMAIN-001 (ドメインエンティティの不変性), INV-TYPE-001 (型安全性)

## 入力契約

### createTrendDataPoint(params)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| params.date | Date | 必須、有効なDateオブジェクト | - |
| params.emotion | number | 必須、1.0～5.0の範囲 | - |
| params.recordCount | number | 必須、0以上の整数 | - |

### createStudentTrendAnalysis(params)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| params.student | string | 必須、空文字列以外 | - |
| params.dataPoints | TrendDataPoint[] | 必須、空配列以外 | - |

### createClassTrendAnalysis(params)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| params.className | string | 必須、空文字列以外 | - |
| params.studentAnalyses | StudentTrendAnalysis[] | 必須、空配列以外 | - |

### calculateTrendDirection(values)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| values | number[] | 必須、数値配列 | - |

### calculateMovingAverage(values, windowSize)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| values | number[] | 必須、数値配列 | - |
| windowSize | number | 必須、正の整数 | - |

## 出力契約

### createTrendDataPoint
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| dataPoint | TrendDataPoint | emotionが1.0～5.0の範囲内、recordCountが0以上 |

### createStudentTrendAnalysis
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| analysis | StudentTrendAnalysis | metricsが計算され、trendDirectionが"up"/"down"/"stable"のいずれか |

### createClassTrendAnalysis
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| analysis | ClassTrendAnalysis | metrics.topPerformersとmetrics.needsSupportが排他的 |

### calculateTrendDirection
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| direction | TrendDirection | 配列長<2の場合"stable"、差分が閾値(0.1)未満の場合"stable" |

### calculateMovingAverage
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| averages | number[] | windowSizeがvalues.length以上の場合空配列、それ以外は移動平均値の配列 |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| emotion < 1.0 または emotion > 5.0 | Error: "Emotion must be between 1 and 5" | - |
| recordCount < 0 | Error: "Record count must be non-negative" | - |
| studentが空文字列 | Error: "Student name must not be empty" | - |
| dataPointsが空配列 | Error: "Data points array must not be empty" | - |
| classNameが空文字列 | Error: "Class name must not be empty" | - |
| studentAnalysesが空配列 | Error: "Student analyses array must not be empty" | - |
| windowSize <= 0 | Error: "Window size must be positive" | - |

## 境界値

### createTrendDataPoint
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| emotion = 1.0 | 有効なデータポイント | 最小境界値 |
| emotion = 5.0 | 有効なデータポイント | 最大境界値 |
| emotion = 0.999 | Error("Emotion must be between 1 and 5") | 最小値未満 |
| emotion = 5.001 | Error("Emotion must be between 1 and 5") | 最大値超過 |
| recordCount = 0 | 有効なデータポイント | 最小境界値 |
| recordCount = -1 | Error("Record count must be non-negative") | 負の値 |

### calculateTrendDirection
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| [3.5] | "stable" | 単一データポイント |
| [3.5, 3.5] | "stable" | 変化なし |
| [3.5, 3.6] | "stable" | 変化が閾値(0.1)未満 |
| [3.5, 3.65] | "up" | 変化が閾値以上で増加 |
| [3.65, 3.5] | "down" | 変化が閾値以上で減少 |

### calculateMovingAverage
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| windowSize = 1 | 元の配列と同じ | 各要素がそのまま平均値 |
| windowSize > values.length | [] | データ不足 |
| windowSize = 0 | Error("Window size must be positive") | 無効なウィンドウサイズ |

### StudentTrendAnalysis
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 単一データポイント | volatility = 0 | 分散なし |
| 全て同じ感情値 | volatility = 0 | 変動なし |

### ClassTrendAnalysis
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 全生徒が同じ平均感情 | topPerformers = [], needsSupport = [] | 誰もクラス平均を上回らない/下回らない |
| 1名のみの生徒 | topPerformers = [], needsSupport = [] | 比較対象がいない |

## 不変条件チェック

- [ ] INV-DOMAIN-001: ドメインエンティティの不変性
  - すべてのfactory関数はバリデーションを実行
  - 不正な入力は早期に例外をスロー
  - 出力されるオブジェクトは常に有効な状態

- [ ] INV-TYPE-001: 型安全性
  - TrendDirectionは"up"|"down"|"stable"のみ
  - すべての数値は実行時に範囲チェックされる
  - 配列の空チェックは実行時に行われる

- [ ] INV-MATH-001: 計算の正確性
  - 平均値は sum / count で計算
  - ボラティリティは標準偏差(分散の平方根)で計算
  - トレンド方向は最初と最後の値の差分で判定

## 実装の詳細要件

### トレンド方向の判定ロジック
- 閾値(TREND_THRESHOLD)は0.1
- 最初の値と最後の値の差分の絶対値が閾値未満の場合"stable"
- 差分が正の場合"up"、負の場合"down"

### ボラティリティの計算
- 標準偏差を使用: sqrt(average((x - avg)^2))
- 単一データポイントの場合は0を返す
- 2つ以上のデータポイントが必要

### 移動平均の計算
- 単純移動平均(SMA)を使用
- ウィンドウ内の値の算術平均
- データがウィンドウサイズ未満の場合は空配列を返す

### クラスメトリクスの分類
- クラス平均感情 = 全生徒の平均感情の平均
- topPerformers = クラス平均より高い生徒
- needsSupport = クラス平均より低い生徒
- クラス平均と等しい生徒はどちらにも含まれない

### 防御的プログラミング
- `calculateAverage`: 空配列の場合0を返す（到達不可能コードだが安全策）
- `createClassTrendMetrics`: 空配列チェック（到達不可能だが安全策）

**注**: Line 110と211は防御的プログラミングによる到達不可能コード。
- Line 110: `calculateAverage`は常に非空配列で呼ばれる（すべての呼び出し元でバリデーション済み）
- Line 211: `createClassTrendMetrics`は`createClassTrendAnalysis`からのみ呼ばれ、そこでバリデーション済み
- これらのチェックは将来のリファクタリングや誤使用に対する安全策として維持

## テストカバレッジ要件

### 必須テストケース
1. **createTrendDataPoint**: 正常系、境界値(1.0, 5.0)、異常値(0.9, 5.1)、負のrecordCount
2. **createStudentTrendAnalysis**: 正常系、空配列、空文字列、トレンド判定(up/down/stable)
3. **createClassTrendAnalysis**: 正常系、空配列、空文字列、topPerformers/needsSupportの分類
4. **calculateTrendDirection**: up/down/stableの判定、単一データポイント、閾値境界
5. **calculateMovingAverage**: 正常系、データ不足、windowSize=1、異常なwindowSize
6. **ボラティリティ計算**: 単一データポイント、複数データポイント
7. **型安全性**: すべての型制約の検証
8. **エッジケース**: 極端な感情値、大規模データ、365日分のデータ

### カバレッジ目標
- ステートメント: 100%
- ブランチ: 95%以上
- 関数: 100%
- 行: 100%

**注意**: Line 110と211は防御的プログラミングによる到達不可能コードであり、
カバレッジ計算から除外することが合理的。これらは安全策として維持される。

## 依存関係

- 外部依存なし（純粋なドメインロジック）
- 他のドメインエンティティへの依存なし

## 将来の拡張可能性

- 季節性調整オプションの追加
- 外れ値検出と除外機能
- カスタムトレンド閾値の設定
- 加重移動平均のサポート
