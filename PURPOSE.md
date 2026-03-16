# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義するものです。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 品質基盤（現在のステータス）

### 品質メトリクス
- ✅ すべてのテスト: 841/841 passing
- ✅ Lintエラー: 0件
- ✅ TypeScript厳格モード: 100%準拠
- ✅ 全体カバレッジ: 98.39% statements, 91.49% branches, 98.38% functions
- ✅ E2Eテスト: 41シナリオ、123テストケース（3ブラウザ対応）

### 完了したマイルストーン
- ✅ **E2Eテスト基盤** - Playwrightによる包括的なE2Eテスト、CI統合完了
- ✅ **Prismaインフラ層** - `IRecordRepository`、`PrismaRecordRepository`、Recordエンティティ、Prismaスキーマ、マイグレーション、シード（750件）
- ✅ **APIルートPrisma統合** - `/api/stats`、`/api/seed` で環境変数 `DATABASE_PROVIDER=mirage|prisma` による切り替え実装完了

**注記**: APIルートはPrisma統合済みだが、Application層フックはまだAPI経由で呼び出しており、Clean Architectureの原則（Application→Domain→Infrastructure）に従っていない。

## 直近の優先成果（次に終わらせるべきこと）

### P1: Application層のClean Architecture統合

**現状**: Application層フック（`useDataGeneration`, `useSeedGeneration`）がAPIルート経由でデータアクセスしており、Clean Architectureに違反している。

**問題点**:
- Application層がPresentation層（APIルート）に依存している
- 依存方向: Application → API → Domain/Infrastructure（❌ 違反）
- 正しい依存方向: Application → Domain ← Infrastructure（✅ 正しい）

**完了条件**:
1. `useDataGeneration` を `StatsService`（Domain）と `IRecordRepository`（Domain interface）を使用するように書き直し
2. `useSeedGeneration` を `StatsService` と `IRecordRepository` を使用するように書き直し
3. 依存性注入（DI）パターンでリポジトリ実装を渡せるようにする
4. 環境変数による実装切り替え（Mirage/Prisma）をApplication層で実装
5. 既存テスト（841件）は全てパスし続けること

**実装範囲**:
- `src/application/hooks/useDataGeneration.ts` - API呼び出し削除、Service/Repository直接使用に変更
- `src/application/hooks/useSeedGeneration.ts` - API呼び出し削除、Service/Repository直接使用に変更
- `src/application/hooks/useStats.ts` - `StatsService` と `IRecordRepository` 使用に変更
- `src/lib/repository-factory.ts` - 環境変数によるリポジトリ実装ファクトリー（新規）
- Application層フックのテスト更新

**制約事項**:
- Clean Architecture厳守：Application層はDomainのみ依存、Infrastructure非依存
- Mirageは開発・テスト用途に残す（完全削除禁止）
- APIルートはPresentation層として残し、外部クライアント用に維持

### P2: 認証・認可機能の追加

**完了条件**: ユーザー認証と基本的な認可が実装されている

**実装タスク**:
1. 認証プロバイダーの選定（NextAuth.js推奨）
2. ユーザーモデルの実装
3. ログイン・ログアウトフローの実装
4. APIルートの保護
5. E2Eテストでの認証フロー検証

### P3: 本番環境デプロイ

**完了条件**: Vercel等で本番環境にデプロイされている

**実装タスク**:
1. 環境変数の設定（DATABASE_URL, AUTH_SECRET等）
2. PostgreSQLデータベースのプロビジョニング（Supabase推奨）
3. Vercelデプロイ設定
4. カスタムドメイン設定
5. モニタリングとエラーログ設定

## 技術方針

### Clean Architectureの実装（現在の違反状態と修正方針）

**現在の違反状態**:
```
❌ 現在: Application → API Routes → Domain/Infrastructure
useDataGeneration → /api/stats → MockStatsRepository
useSeedGeneration → /api/seed → Mirage/Prisma
```

**正しいアーキテクチャ**:
```
✅ 正しい: Application → Domain ← Infrastructure
useDataGeneration → StatsService → IRecordRepository
                           ↑              ↑
                           |              |
                    Domain Layer   Infrastructure Layer
                           |              |
              PrismaRecordRepository, MockStatsRepository
```

**修正方針**:
1. Application層フックはDomain Serviceを直接使用
2. Repository実装はDIで注入、環境変数で切り替え
3. APIルートはPresentation層として残し、外部クライアント（ブラウザ、モバイル）用に維持
4. 依存方向: Application → Domain ← Infrastructure（外側から内側への一方向）

### データ永続化のアーキテクチャ
```
Domain層（インターフェースのみ）:
  - IRecordRepository: findAll, findByDateRange, findByStudent, create, delete
  - StatsService: ビジネスロジック（Record集計、統計計算）

Infrastructure層（実装）:
  - MockStatsRepository（開発・テスト用、インメモリ）
  - PrismaRecordRepository（本番用、Prisma + SQLite/PostgreSQL）
  - PrismaStatsRepository（StatsService用、IRecordRepositoryをラップ）
  - PrismaSeedRepository（シードデータ生成）

Application層:
  - useDataGeneration, useSeedGeneration（Service + Repositoryインターフェースを使用）
  - Repository実装はFactoryパターンで環境変数により切り替え

Presentation層:
  - API Routes（外部クライアント用、Server Componentsから呼び出し）
  - React Components（Application層フックを使用）
```

**重要**: Domain層はPrismaを知らない。Interfaceのみを定義する。

### データソース切り替え方針
- Repository Factoryパターンで実装を切り替え
- 環境変数 `DATABASE_PROVIDER=mirage|prisma` で選択
- 開発・テスト: MockStatsRepository（高速、DB不要）
- 本番: PrismaRecordRepository + PostgreSQL（永続化、スケーラビリティ）
- Application層とAPIルートの両方で同じFactoryを使用

### E2Eテスト方針
- Playwrightを使用（既に41シナリオ実装済み）
- ページオブジェクトモデル（POM）パターンを採用
- テストは独立して実行可能にする
- CI/CDパイプラインに組み込む（既に設定済み）

### データベースマイグレーション方針
- Prisma Migrateを使用
- 開発: SQLite（ローカルファイル `prisma/dev.db`）
- 本番: PostgreSQL（Supabase推奨）
- マイグレーションファイルはバージョン管理

### 依存性注入（DI）パターン
```
// Repository Factory
const repository = createRepository(process.env.DATABASE_PROVIDER || 'mirage');
const service = new StatsService(repository);

// Application layer hooks
const { stats, isLoading } = useStats(repository);
const { generateSeed } = useSeedGeneration(service);
```

## 完了の定義

このプロジェクトのMVPが「完了」と見なされる条件:

1. **品質基盤**: ✅ 達成済み（Lint 0件、厳格モード、98%+ coverage、841テスト全パス）
2. **E2Eテスト**: ✅ 達成済み（41シナリオ、3ブラウザ対応）
3. **Clean Architecture統合**: ⏳ P1完了で達成（Application層がDomainのみ依存）
4. **認証**: ⏳ P2完了で達成（NextAuth.js、API保護）
5. **デプロイ**: ⏳ P3完了で達成（Vercel、PostgreSQL）

## 更新ルール

この文書は以下の場合に更新します:

1. **P1/P2/P3完了時**: 完了したマイルストーンを「達成済み」として記載
2. **優先順位変更時**: ビジネス要件や技術的制約により優先順位が変更された場合
3. **四半期ごと**: 少なくとも四半期に1回は現状の再評価
4. **アーキテクチャ違反発見時**: Clean Architecture原則に違反する実装を発見した場合

---

**最終更新**: 2026-03-17
**更新理由**: 直近10コミットの分析に基づき、以下の事実を確認:
- b3dfc7fでAPIルートのPrisma統合は完了
- しかしApplication層フック（useDataGeneration, useSeedGeneration）はまだAPI経由で呼び出し中
- Clean Architecture違反：Application → API → Domain/Infrastructure（❌）
- P1の完了条件を再定義：Application層がDomainのみ依存するように修正
**現在のフェーズ**: アーキテクチャ修正フェーズ。Application層をClean Architectureに準拠させる。
