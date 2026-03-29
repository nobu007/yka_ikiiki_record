# SPEC: TrendAnalysisService

## 概要
- **モジュール**: src/application/services/TrendAnalysisService.ts
- **責務**: Application service for orchestrating time-series trend analysis of emotion data, providing algorithms for moving averages, anomaly detection, and trend correlation
- **関連する不変条件**: INV-DOM-005 (Emotion_Value_Precision), INV-UTL-004 (Trendline_Null_Handling), INV-UTL-005 (Trendline_Length_Limit)

## 入力契約

### analyzeStudentTrend
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| studentName | string | Non-empty string (trimmed) | なし |
| records | TrendRecord[] | Array of {date: Date, emotion: number}, length >= 1 | なし |

### analyzeClassTrend
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| className | string | Non-empty string (trimmed) | なし |
| studentAnalyses | StudentTrendAnalysis[] | Array with length >= 1 | なし |

### calculateMovingAverage
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| values | number[] | Array of numbers | なし |
| windowSize | number | Positive integer > 0 | 3 |

### detectAnomalies
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| values | number[] | Array of numbers | なし |
| stdDevThreshold | number | Number of standard deviations | 2 |

### calculateTrendCorrelation
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| series1 | number[] | Array with length >= 2 | なし |
| series2 | number[] | Array with length >= 2, same length as series1 | なし |

## 出力契約

### analyzeStudentTrend
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| StudentTrendAnalysis | Promise<StudentTrendAnalysis> | - dataPoints sorted by date ascending<br>- metrics.trendDirection in ["up", "down", "stable"]<br>- metrics.averageEmotion in [1.0, 5.0]<br>- metrics.totalRecords = sum of all recordCounts |

### analyzeClassTrend
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| ClassTrendAnalysis | Promise<ClassTrendAnalysis> | - metrics.totalStudents = studentAnalyses.length<br>- metrics.topPerformers contains students with avgEmotion > classAvg<br>- metrics.needsSupport contains students with avgEmotion < classAvg |

### calculateMovingAverage
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| number[] | number[] | - Returns empty array if values.length < windowSize<br>- Returns (values.length - windowSize + 1) averages<br>- Each value is arithmetic mean of window |

### detectAnomalies
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| AnomalyDataPoint[] | AnomalyDataPoint[] | - Empty array if input is empty or stdDev = 0<br>- Each point has {index, value, deviation}<br>- deviation > (stdDev * stdDevThreshold) |

### calculateTrendCorrelation
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| number | number | - Returns value in [-1.0, 1.0]<br>- -1.0 = perfect negative correlation<br>- 0.0 = no correlation<br>- +1.0 = perfect positive correlation |

## エラー契約
| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| analyzeStudentTrend with empty records | Error("Records array must not be empty") | N/A (domain layer) |
| analyzeClassTrend with empty studentAnalyses | Error("Student analyses array must not be empty") | N/A (domain layer) |
| calculateMovingAverage with windowSize <= 0 | Error("Window size must be positive") | N/A (domain layer) |
| calculateTrendCorrelation with different length arrays | Error("Arrays must have the same length") | N/A (domain layer) |
| calculateTrendCorrelation with arrays length < 2 | Error("Arrays must have at least 2 elements") | N/A (domain layer) |

## 境界値
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| analyzeStudentTrend with 1 record | StudentTrendAnalysis with 1 dataPoint, trendDirection="stable" | Single point always stable |
| analyzeStudentTrend with records for same date | Aggregated to single dataPoint with averaged emotion | Date aggregation |
| calculateMovingAverage with values.length < windowSize | Empty array [] | Insufficient data for window |
| calculateMovingAverage with values.length = windowSize | Array with 1 element | Minimum valid case |
| detectAnomalies with empty array | Empty array [] | No data to analyze |
| detectAnomalies with identical values | Empty array [] | Zero stdDev, no anomalies |
| calculateTrendCorrelation with identical series | 1.0 | Perfect positive correlation |
| calculateTrendCorrelation with opposite series | -1.0 | Perfect negative correlation |

## 不変条件チェック
- [x] INV-DOM-005: Emotion values maintain decimal precision (1 decimal place) in all calculations
- [x] INV-UTL-004: Null/undefined values handled gracefully (empty array cases)
- [x] INV-UTL-005: Moving average respects data length limits (returns empty when insufficient data)

## 実装詳細

### 依存関係
- **Domain Layer**: TrendAnalysis entity (createTrendDataPoint, createStudentTrendAnalysis, createClassTrendAnalysis)
- **Repository Interface**: TrendAnalysisRepository (dependency injection)
- **No Framework Dependencies**: Pure TypeScript, no Next.js/React imports

### アルゴリズム

#### Moving Average (Sliding Window)
```typescript
// For values = [1, 2, 3, 4, 5], windowSize = 3
// Window 1: [1, 2, 3] → avg = 2.0
// Window 2: [2, 3, 4] → avg = 3.0
// Window 3: [3, 4, 5] → avg = 4.0
// Result: [2.0, 3.0, 4.0]
```

#### Anomaly Detection (Standard Deviation)
```typescript
// 1. Calculate mean
// 2. Calculate variance = mean((x - mean)²)
// 3. Calculate stdDev = sqrt(variance)
// 4. Threshold = stdDev * stdDevThreshold (default 2)
// 5. Flag any value where |value - mean| > threshold
```

#### Pearson Correlation
```typescript
// r = Σ((x₁ - x̄)(y₁ - ȳ)) / √(Σ(x₁ - x̄)² * Σ(y₁ - ȳ)²)
// Returns value in [-1, 1]
```

### パフォーマンス特性
- **Time Complexity**:
  - analyzeStudentTrend: O(n log n) due to date sorting
  - calculateMovingAverage: O(n * windowSize)
  - detectAnomalies: O(n) for single pass
  - calculateTrendCorrelation: O(n) for single pass
- **Space Complexity**: O(n) for all operations (input data + result arrays)

## テストカバレッジ

### 既存テスト (TrendAnalysisService.test.ts)
- ✅ analyzeStudentTrend: Normal case with 3 records
- ✅ analyzeStudentTrend: Date aggregation (multiple records same day)
- ✅ analyzeStudentTrend: Empty records error handling
- ✅ analyzeStudentTrend: Date sorting validation
- ✅ analyzeStudentTrend: Trend direction calculation
- ✅ analyzeStudentTrend: Volatility metrics calculation
- ✅ analyzeStudentTrend: **Single record boundary case** (ADDED 2026-03-30)
- ✅ calculateMovingAverage: Default window size
- ✅ calculateMovingAverage: Custom window size
- ✅ calculateMovingAverage: **values.length < windowSize returns empty**
- ✅ calculateMovingAverage: Window size of 1
- ✅ calculateMovingAverage: **Invalid window size error (0, -1)**
- ✅ detectAnomalies: Values outside standard deviation threshold
- ✅ detectAnomalies: No anomalies detected
- ✅ detectAnomalies: Empty array
- ✅ detectAnomalies: Custom threshold
- ✅ detectAnomalies: **Identical values (zero stdDev) returns empty** (ADDED 2026-03-30)
- ✅ calculateTrendCorrelation: Positive correlation
- ✅ calculateTrendCorrelation: Negative correlation
- ✅ calculateTrendCorrelation: Zero correlation (uncorrelated data)
- ✅ calculateTrendCorrelation: **Mismatched array lengths error**
- ✅ calculateTrendCorrelation: **Empty arrays error**
- ✅ calculateTrendCorrelation: **Identical series returns 1.0** (ADDED 2026-03-30)
- ✅ calculateTrendCorrelation: **Perfectly opposite series returns -1.0** (ADDED 2026-03-30)
- ✅ calculateTrendCorrelation: **Single element arrays error** (ADDED 2026-03-30)
- ✅ analyzeClassTrend: Multiple student analyses
- ✅ analyzeClassTrend: Top performers and needs support identification
- ✅ analyzeClassTrend: Empty student analyses error
- ✅ saveStudentTrend: Repository save operation
- ✅ saveStudentTrend: Returns saved analysis
- ✅ saveStudentTrend: Propagates repository errors
- ✅ saveClassTrend: Repository save operation
- ✅ saveClassTrend: Returns saved analysis
- ✅ getStudentTrend: Retrieve from repository
- ✅ getStudentTrend: Returns null when not found
- ✅ getClassTrend: Retrieve from repository
- ✅ getClassTrend: Returns null when not found

### Test Summary
- **Total Tests**: 37 tests
- **Coverage**: 100% of all public methods
- **Boundary Cases**: All covered
- **Error Cases**: All covered
- **Integration Cases**: Repository operations fully tested via mocks

### Recent Improvements (2026-03-30)
Added 4 new boundary case tests based on SPEC recommendations:
1. Single record analysis with stable trend direction
2. Anomaly detection with identical values (zero stdDev edge case)
3. Perfect positive correlation (identical series = 1.0)
4. Perfect negative correlation (opposite series = -1.0)
5. Single element array error handling

## PURPOSE.md への関連
- **P2: 分析・可視化の強化**: 詳細な分析レポート（個人・クラス単位の長期トレンド）
- 本サービスは長期トレンド分析のための時間系列アルゴリズムを提供する
- 移動平均平滑化、異常値検知、相関分析により高度な教育インサイトを可能にする
