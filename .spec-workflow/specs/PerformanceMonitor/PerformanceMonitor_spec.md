# SPEC: PerformanceMonitor

## 概要
- **モジュール**: `src/lib/resilience/performance-monitor.ts`
- **責務**: アプリケーションのパフォーマンス指標の追跡・分析・監視を行う
- **関連する不変条件**: INV-RESILIENCE-001 (自律的耐久性プロトコル)

## 入力契約

### measure(name, fn, metadata?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| name | string | 必須、一意識別子 | - |
| fn | () => T | 必須、同期関数 | - |
| metadata | Record\<string, unknown\> | 任意、追加メタデータ | undefined |

### measureAsync(name, fn, metadata?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| name | string | 必須、一意識別子 | - |
| fn | () => Promise\<T\> | 必須、非同期関数 | - |
| metadata | Record\<string, unknown\> | 任意、追加メタデータ | undefined |

### trackRender(componentName, renderTime, propsHash?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| componentName | string | 必須、コンポーネント名 | - |
| renderTime | number | 必須、レンダリング時間(ms) | - |
| propsHash | string | 任意、propsのハッシュ値 | undefined |

### constructor(config?)
| パラメータ | 型 | 制約 | デフォルト |
|-----------|-----|------|-----------|
| config.maxMetrics | number | 任意、最大メトリクス保存数 | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_MAX_METRICS |
| config.slowRenderThreshold | number | 任意、低速レンダリング閾値(ms) | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_SLOW_RENDER_THRESHOLD |
| config.enabled | boolean | 任意、有効/無効フラグ | PERFORMANCE_MONITOR_CONSTANTS.DEFAULT_ENABLED |

## 出力契約

### measure(name, fn, metadata?)
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | T | fnの実行結果を返す。実行時間は記録され、メトリクスが保存される |

### measureAsync(name, fn, metadata?)
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| result | Promise\<T\> | fnの実行結果を解決するPromise。実行時間は記録され、メトリクスが保存される |

### trackRender(componentName, renderTime, propsHash?)
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| void | void | レンダリングメトリクスが記録される。renderTimeが閾値を超える場合、WARNレベルでログ出力される |

### getStats(name)
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| stats | PerformanceStats \| undefined | 指定されたメトリク名の統計情報。メトリクスが存在しない場合はundefined |

### getRenderStats(componentName)
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| stats | RenderStats \| undefined | 指定されたコンポーネントのレンダリング統計。メトリクスが存在しない場合はundefined |

### getAllMetricNames()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| names | string[] | すべてのメトリク名の配列 |

### getAllComponentNames()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| names | string[] | すべてのコンポーネント名の配列 |

### clear()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| void | void | すべてのメトリクスが削除される。INFOレベルでログ出力される |

### getSummary()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| summary | { metrics: Record\<string, PerformanceStats\>, renders: Record\<string, RenderStats\> } | すべてのメトリクスとレンダリング統計を含むオブジェクト |

### destroy()
| 戻り値 | 型 | 保証する条件 |
|--------|-----|-------------|
| void | void | clear()を呼び出し、INFOレベルでログ出力される |

## エラー契約

| 条件 | 例外/レスポンス | HTTPステータス |
|------|----------------|---------------|
| config.maxMetricsが負の値 | メトリクス保存制限が無効化される動作 | - |
| config.slowRenderThresholdが負の値 | すべてのレンダリングが低速と判定される動作 | - |
| measureAsyncでfnがPromiseを拒否 | 拒否されたPromiseがそのまま伝播される | - |

## 境界値

### measure/measureAsync
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| nameが空文字列 | メトリクスが記録される | 有効な識別子として扱われる |
| fnが実行時に例外をスロー | 例外がそのまま伝播される | メトリクスは記録されない |
| fnの実行時間が極めて短い(0.001ms未満) | durationは有効な小数値として記録される | performance.now()の精度に依存 |

### trackRender
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| renderTimeが0 | メトリクスが記録される | 有効なレンダリング時間として扱われる |
| renderTimeが負の値 | メトリクスが記録されるが、統計計算で正しく扱われるか保証されない |
| renderTimeが閾値を超える | WARNレベルでログ出力される | slowRenderThresholdに依存 |

### getStats/getRenderStats
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| 存在しないname/componentName | undefinedを返す | エラーはスローされない |
| メトリクスが1つのみ | avgDuration/minDuration/maxDurationがすべて同じ値 |

### config.maxMetrics
| 入力 | 期待出力 | 備考 |
|------|---------|------|
| maxMetricsを超えたメトリクス | 古いメトリクスから順に削除される | FIFO (First In, First Out) |

## 不変条件チェック

- [ ] INV-RESILIENCE-001: メトリクス記録時の構造化ロギングプロトコルを遵守
  - `globalLogger.debug()` で METRIC_RECORDED イベントを記録
  - `globalLogger.warn()` で SLOW_RENDER イベントを記録（閾値超過時）
  - `globalLogger.info()` で INITIALIZED/CLEARED/DESTROYED イベントを記録

- [ ] INV-MEMORY-001: メモリリーク防止
  - maxMetricsで制限を超えた古いメトリクスは自動削除
  - destroy()メソッドですべてのMapをクリア

- [ ] INV-TYPE-001: 型安全性
  - すべてのパブリックメソッドで型パラメータTを適切に推論
  - PerformanceStats/RenderStatsの数値はtoFixed(3)で3桁に丸められ、パースされる

## 実装の詳細要件

### メトリクス記録のタイミング
- measure/measureAsync: 関数の実行前後でperformance.now()を呼び出し、差分を記録
- trackRender: 呼び出し時点で即時に記録

### メトリクスの保存戦略
- 各メトリク名ごとにPerformanceMetric[]をMapで管理
- 配列の長さがmaxMetricsを超えた場合、shift()で最古の要素を削除
- propsHashが提供された場合、RenderMetricに含めて記録

### 統計計算
- avgDuration: 全期間の合計 / 件数
- minDuration/maxDuration: Math.min/Math.maxで算出
- slowRenderCount: slowRenderThresholdを超える件数をカウント
- すべての数値は小数点第3位に丸められる

### グローバルインスタンス
- globalPerformanceMonitorとしてデフォルト設定でエクスポート
- アプリケーション全体で共有されるシングルトン

## テストカバレッジ要件

### 必須テストケース
1. **measure**: 同期関数の実行時間計測
2. **measureAsync**: 非同期関数の実行時間計測
3. **trackRender**: レンダリング時間の記録
4. **getStats**: メトリクス統計の取得
5. **getRenderStats**: レンダリング統計の取得
6. **getAllMetricNames/getAllComponentNames**: 登録済み名前一覧の取得
7. **clear**: すべてのメトリクスのクリア
8. **getSummary**: すべての統計の取得
9. **destroy**: リソースのクリーンアップ
10. **maxMetricsによるFIFO削除**: 古いメトリクスの自動削除
11. **slowRenderThresholdによるWARNログ**: 低速レンダリングの検出
12. **enabled=falseの場合の動作**: モニタリング無効時の挙動

### 境界値テスト
1. 空のメトリクス名での記録
2. 単一メトリクスの統計（avg=min=max）
3. 極めて短い/長い実行時間
4. 負の値や異常な入力の挙動
