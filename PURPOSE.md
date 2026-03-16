# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義するものです。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 達成済みの品質基盤（2026-03-16時点）

### 品質メトリクス
- ✅ すべてのテスト: 841/841 passing（819単体 + 22リポジトリ）
- ✅ Lintエラー: 0件
- ✅ TypeScript厳格モード: 100%準拠
- ✅ 全体カバレッジ: 98.39% statements, 91.49% branches, 98.38% functions
- ✅ E2Eテスト: 41シナリオ、123テストケース（Chromium, Firefox, WebKit対応）

### 完了したマイルストーン
- ✅ **P1: E2Eテスト基盤** - Playwrightによる包括的なE2Eテスト覆盖
  - ランディングページ → ダッシュボード遷移
  - データ生成フロー（生徒数・日数・感情種類の設定）
  - 統計データの表示確認
  - エモーションチャートの描画（6チャートタイプ）
  - CI自動実行設定済み（`.github/workflows/ci.yml`）

- ✅ **P2: データ永続化レイヤーの設計と実装** - Prisma + SQLiteによるClean Architecture準拠のデータ永続化
  - `IRecordRepository` インターフェース（Domain層）
  - `PrismaRecordRepository` 実装（Infrastructure層）
  - RecordエンティティとRepositoryの包括的なテスト（22テスト）
  - Prismaスキーマ、マイグレーション、シードスクリプト（750件のサンプルデータ）
  - Clean Architecture維持（Domain層はPrisma非依存）

## 直近の優先成果（次に終わらせるべきこと）

### P1: Prismaリポジトリのアプリケーション統合

**現状**: `PrismaRecordRepository`は実装済みだが、アプリケーション層で未使用。Mirageモックが依然として動作している。

**完了条件**:
1. Application層のフック（`useDataGeneration`, `useSeedGeneration`）をPrismaリポジトリに接続
2. APIルート（`/api/stats`, `/api/seed`）をPrismaデータソースに切り替え
3. Mirageを開発用モックとして残しつつ、本番データフローを確立
4. 環境変数によるデータソースの切り替え機能（Mirage/Prisma）
5. E2Eテストによる統合動作確認

**実装タスク**:
1. `src/infrastructure/repositories/PrismaRecordRepository.ts`のインスタンス化
2. `src/application/hooks/` 内のフックでPrisma repoを使用
3. `src/app/api/` ルートでPrisma repoを呼び出し
4. `.env` で `DATABASE_PROVIDER=mirage|prisma` を選択可能にする
5. Prisma Clientのシングルトン初期化（`src/lib/prisma.ts`）

**注意点**:
- Clean Architectureを維持：Domain層はPrismaに依存しない
- Mirage開発モックを完全に削除せず、開発・テスト用途に残す
- データ移行スクリプトは不要（初期データはPrisma seedで生成）

### P2: 認証・認可機能の追加

**完了条件**: ユーザー認証と基本的な認可が実装されている

**実装タスク**:
1. 認証プロバイダーの選定（NextAuth.js推奨）
2. ユーザーモデルの実装
3. ログイン・ログアウトフローの実装
4. APIルートの保護（認証済みユーザーのみアクセス可能）
5. E2Eテストでの認証フローの検証

### P3: 本番環境デプロイ

**完了条件**: Vercel等で本番環境にデプロイされている

**実装タスク**:
1. 環境変数の設定（DATABASE_URL, AUTH_SECRET等）
2. PostgreSQLデータベースのプロビジョニング（Supabase推奨）
3. Vercelデプロイ設定
4. カスタムドメイン設定
5. モニタリングとエラーログ設定

## 技術方針

### データ永続化のアーキテクチャ
```
Domain層（インターフェースのみ）:
  - IRecordRepository: findAll, findByDateRange, findByStudent, create, delete

Infrastructure層（実装）:
  - MockStatsRepository（開発・テスト用、Mirageベース）
  - PrismaRecordRepository（本番用、Prisma + SQLite/PostgreSQL）

Application層:
  - useDataGeneration, useSeedGeneration（Repositoryインターフェースを使用）

Presentation層:
  - API Routes, React Components
```

**重要**: Domain層はPrismaを知らない。Interfaceのみを定義する。

### データソース切り替え方針
- 環境変数 `DATABASE_PROVIDER=mirage|prisma` で切り替え
- 開発・テスト: Mirageモック（高速、DB不要）
- 本番: Prisma + PostgreSQL（永続化、スケーラビリティ）
- Application層は同じインターフェース経由でアクセス

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

## 完了の定義

このプロジェクトのMVPが「完了」と見なされる条件:

1. **品質基盤**: ✅ 達成済み（Lint 0件、厳格モード、98%+ coverage、841テスト全パス）
2. **E2Eテスト**: ✅ 達成済み（41シナリオ、3ブラウザ対応）
3. **データ永続化**: ⏳ P1完了で達成（Prisma統合、環境変数切り替え）
4. **認証**: ⏳ P2完了で達成（NextAuth.js、API保護）
5. **デプロイ**: ⏳ P3完了で達成（Vercel、PostgreSQL）

## 更新ルール

この文書は以下の場合に更新します:

1. **P1/P2/P3完了時**: 完了したマイルストーンを「達成済み」として記載
2. **優先順位変更時**: ビジネス要件や技術的制約により優先順位が変更された場合
3. **四半期ごと**: 少なくとも四半期に1回は現状の再評価

---

**最終更新**: 2026-03-16
**更新理由**: 直近10コミットの分析に基づき、P1（E2Eテスト基盤）とP2（Prismaデータ永続化レイヤー）が完了していることを確認。次の最優先タスクとしてP1（Prismaリポジトリのアプリケーション統合）、P2（認証機能）、P3（本番デプロイ）を具体化。MirageからPrismaへの移行ステップを明確化。
**現在のフェーズ**: 統合フェーズ。Prismaリポジトリをアプリケーション層に統合。
