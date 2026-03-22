# SPEC: infrastructure.repositories.PrismaRecordRepository.PrismaRecordRepository

**Version**: 1.0.0
**Last Updated**: 2026-03-22
**Source**: src/infrastructure/repositories/PrismaRecordRepository.ts:10
**Type**: class

---

## 1. 概要

classの実装

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| constructor | prisma?: PrismaClient | No | - | - | パラメータ |
| PrismaClient |  | No | - | - | パラメータ |
| findById | id: number | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.findUnique({
        where: { id },
      } | No | - | - | パラメータ |
| if | !record | No | - | - | パラメータ |
| toDomain | record | No | - | - | パラメータ |
| findAll |  | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.findMany({
        orderBy: { date: "desc" },
      } | No | - | - | パラメータ |
| map | (record | No | - | - | パラメータ |
| toDomain | record | No | - | - | パラメータ |
| findByDateRange | startDate: Date, endDate: Date | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      } | No | - | - | パラメータ |
| map | (record | No | - | - | パラメータ |
| toDomain | record | No | - | - | パラメータ |
| findByStudent | student: string | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.findMany({
        where: { student },
        orderBy: { date: "desc" },
      } | No | - | - | パラメータ |
| map | (record | No | - | - | パラメータ |
| toDomain | record | No | - | - | パラメータ |
| save | record: Record | No | - | - | パラメータ |
| safeParse | record | No | - | - | パラメータ |
| if | !validationResult.success | No | - | - | パラメータ |
| error | "PRISMA_REPOSITORY", "VALIDATION_ERROR", {
        error: "Attempted to save invalid record",
        validationErrors: validationResult.error.errors,
        data: record,
      } | No | - | - | パラメータ |
| ValidationError | 
        `Cannot save invalid record: ${validationResult.error.errors.map((e | No | - | - | パラメータ |
| join | ", " | No | - | - | パラメータ |
| toPrisma | validationResult.data | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.upsert({
        where: { id: record.id || DATABASE_CONSTRAINTS.ID_FALLBACK },
        update: recordData,
        create: recordData,
      } | No | - | - | パラメータ |
| toDomain | saved | No | - | - | パラメータ |
| saveMany | records: Record[] | No | - | - | パラメータ |
| for | const record of records | No | - | - | パラメータ |
| safeParse | record | No | - | - | パラメータ |
| if | !validationResult.success | No | - | - | パラメータ |
| push | {
          record,
          errors: validationResult.error.errors.map((e | No | - | - | パラメータ |
| if | validationErrors.length > 0 | No | - | - | パラメータ |
| error | "PRISMA_REPOSITORY", "VALIDATION_ERROR", {
        error: "Attempted to save invalid records in batch",
        failedRecords: validationErrors.length,
        totalRecords: records.length,
        validationErrors,
      } | No | - | - | パラメータ |
| flatMap | (e | No | - | - | パラメータ |
| join | "; " | No | - | - | パラメータ |
| ValidationError | 
        `Cannot save invalid records: ${validationErrors.length} of ${records.length} records failed validation. Errors: ${errorMessages}`,
        {
          failedCount: validationErrors.length,
          totalCount: records.length,
          validationErrors,
        },
       | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.createMany({
        data: records.map((record | No | - | - | パラメータ |
| toPrisma | record | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.findMany({
        where: {
          id: {
            in: records
              .map((r | No | - | - | パラメータ |
| filter | (id | No | - | - | パラメータ |
| map | (record | No | - | - | パラメータ |
| toDomain | record | No | - | - | パラメータ |
| delete | id: number | No | - | - | パラメータ |
| withDatabaseTimeout | 
      this.prisma.record.delete({
        where: { id },
      } | No | - | - | パラメータ |
| deleteAll |  | No | - | - | パラメータ |
| withDatabaseTimeout | this.prisma.record.deleteMany({} | No | - | - | パラメータ |
| count |  | No | - | - | パラメータ |
| withDatabaseTimeout | this.prisma.record.count( | No | - | - | パラメータ |
| disconnect |  | No | - | - | パラメータ |
| if | this.shouldDisconnect | No | - | - | パラメータ |
| withDatabaseTimeout | this.prisma.$disconnect( | No | - | - | パラメータ |
| toDomain | prismaRecord: {
    id: number;
    emotion: number;
    date: Date;
    student: string;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | No | - | - | パラメータ |
| if | prismaRecord.comment !== null | No | - | - | パラメータ |
| toPrisma | record: Record | No | - | - | パラメータ |
| if | record.id !== undefined | No | - | - | パラメータ |
| if | record.comment !== undefined | No | - | - | パラメータ |

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
- 影響範囲: src/infrastructure/repositories/PrismaRecordRepository.tsからimportされている箇所

## 11. 既存テスト対応

| テストファイル | テスト関数 | 対応ケース |
|--------------|-----------|-----------|
| (該当なし) | - | - |
