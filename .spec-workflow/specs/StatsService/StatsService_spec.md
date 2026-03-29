# SPEC: domain.services.StatsService.StatsService

Version: 1.0.0
Last Updated: 2026-03-30
**Source**: src/domain/services/StatsService.ts:39
**Type**: class

---

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
## 1. 概要

classの実装

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| constructor | private readonly repository: StatsRepository | No | - | - | パラメータ |
| getStats |  | No | - | - | パラメータ |
| log | stats.overview.count, stats.overview.avgEmotion | No | - | - | パラメータ |
| getStats |  | No | - | - | パラメータ |
| getStats |  | No | - | - | パラメータ |
| generation | student count, days, patterns | No | - | - | パラメータ |
| generateSeedData | {
   *   studentCount: 30,
   *   periodDays: 100,
   *   pattern: "normal"
   * } | No | - | - | パラメータ |
| generateSeedData | 
    config: DataGenerationConfig = DEFAULT_CONFIG,
   | No | - | - | パラメータ |
| generateStatsData | config | No | - | - | パラメータ |
| saveStats | stats | No | - | - | パラメータ |
| generateStatsData | config: DataGenerationConfig | No | - | - | パラメータ |
| generateEmotionData | config | No | - | - | パラメータ |
| map | (e | No | - | - | パラメータ |
| calculateAverage | emotions | No | - | - | パラメータ |
| calculateMonthlyStats | allEmotions | No | - | - | パラメータ |
| calculateStudentStats | allEmotions | No | - | - | パラメータ |
| calculateDayOfWeekStats | allEmotions | No | - | - | パラメータ |
| calculateEmotionDistribution | allEmotions | No | - | - | パラメータ |
| calculateTimeOfDayStats | allEmotions | No | - | - | パラメータ |
| generateEmotionData | config: DataGenerationConfig | No | - | - | パラメータ |
| Date |  | No | - | - | パラメータ |
| setDate | startDate.getDate( | No | - | - | パラメータ |
| for | 
      let studentIndex = 0;
      studentIndex < config.studentCount;
      studentIndex++
     | No | - | - | パラメータ |
| for | let day = 0; day < config.periodDays; day++ | No | - | - | パラメータ |
| Date | startDate | No | - | - | パラメータ |
| setDate | date.getDate( | No | - | - | パラメータ |
| floor | Math.random( | No | - | - | パラメータ |
| for | let i = 0; i < recordCount; i++ | No | - | - | パラメータ |
| push | {
            date,
            student: studentIndex,
            emotion: generateEmotion(config, date, studentIndex | No | - | - | パラメータ |
| getRandomHour |  | No | - | - | パラメータ |

## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| result | void | - | classの戻り値 |

## 4. 前提条件（Preconditions）

- 入力パラメータが適切に型チェックされていること

## 5. 事後条件（Postconditions）

- 戻り値が定義された型であること

## 6. 不変条件（Invariants）

- なし

## 7. 境界値テストケース

| ID | 入力 | 期待出力 | カテゴリ | 根拠 |
|----|------|----------|----------|------|
| BV-001 | 正常値 | 正常動作 | 正常系 | 標準入力 |
| BV-002 | 最小値 | 正常動作 | 最小境界 | 型の下限 |
| BV-003 | 最大値 | 正常動作 | 最大境界 | 型の上限 |
| BV-004 | 空入力 | エラー | 空入力 | 空コレクション |

## 8. エラーシナリオ

| ID | シナリオ | 入力例 | 期待動作 | 例外型 |
|----|----------|--------|----------|--------|
| ERR-001 | 型不正 | 不正な型 | エラー発生 | TypeError |
| ERR-002 | None入力 | null | エラー発生 | TypeError |
| ERR-003 | 範囲外 | 範囲外の値 | エラー発生 | RangeError |

## 9. 正常系テストケース

| ID | 入力 | 期待出力 | 説明 |
|----|------|----------|------|
| TC-001 | 正常入力 | 正常出力 | 基本動作 |

## 10. 回帰テスト要件

- 変更時に確認すべき既存機能: このclassに依存する全コンポーネント
- 影響範囲: src/domain/services/StatsService.tsからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
