# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にします。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 品質基盤の現状

- テスト: 971/971 passing (126 suites, 214 TypeScript files)
- カバレッジ: 98.26% statements, 91.49% branches, 94.52% functions, 98.15% lines
- TypeScript: strict mode 完全準拠、**any型0件**（Type Supremacy原則100%達成）
- ESLint: zero warnings
- アーキテクチャ: Clean Architecture + Repository Factoryパターン（完全準拠）
- 全テストファイル300行未満（INV-ARCH-001準拠）
- Clean Architecture違反修正済み: `StatsData`型をcross-cutting層(schemas)へ移植(2026-03-17)

## 直近の優先成果

### P1: インフラストラクチャのプロビジョニング

**完了条件**: VercelプロジェクトとPostgreSQLデータベースが実際に作成され、アクセス可能

**完了の定義**:
- [ ] Vercelプロジェクトが作成されている（`vercel link` 完了）
- [ ] PostgreSQLデータベースがプロビジョニングされている
  - Vercel Postgres または
  - 外部PostgreSQL（Supabase/Neon等）
- [ ] 本番環境の`DATABASE_URL`が環境変数に設定されている
  - 確認コマンド: `vercel env ls DATABASE_URL production`

**実行方法**:
```bash
# 1. Vercelプロジェクトの作成・リンク
vercel link

# 2a. Vercel Postgresの場合（推奨）
# Vercel Dashboard: https://vercel.com/dashboard
# プロジェクト → Storage → Create Database → Postgres

# 2b. 外部PostgreSQLの場合
# データベースを作成し、接続文字列を取得

# 3. 環境変数の設定
vercel env add DATABASE_URL production
# 接続文字列をペースト

# 4. 設定の確認
vercel env ls . | grep DATABASE_URL
```

**現状**: デプロイスクリプト完成済みだが、**インフラ未構築**。Vercelプロジェクト未作成、PostgreSQL未プロビジョニング。

### P2: 本番環境へのデプロイ実行

**完了条件**: Vercelで本番環境が稼働し、アプリケーションがアクセス可能

**完了の定義**:
- [ ] 本番URLが発行されている
- [ ] アプリケーションが本番環境でビルドされている
- [ ] データベースマイグレーションが実行されている

**実行方法**:
```bash
# デプロイ実行（自動化スクリプト使用）
bash scripts/deploy-production.sh

# または手動実行
npm run build
vercel --prod --yes

# データベースマイグレーション
vercel exec -- npm run db:migrate:deploy
```

**依存関係**: P1完了後に実行

**現状**: スクリプト完成済みだが、**P1未完了のため実行不可**。

### P3: 本番環境での動作確認と検証

**完了条件**: 本番環境で主要機能が動作し、E2Eテストがパスする

**完了の定義**:
- [ ] ランディングページ表示 (`/`)
- [ ] ダッシュボード表示 (`/dashboard` - 統計データ、グラフ)
- [ ] テストデータ生成 (`POST /api/seed` - 200/201 status)
- [ ] 統計API動作 (`GET /api/stats` - データ返却)
- [ ] PostgreSQLデータ永続化確認（再アクセス時にデータ保持）
- [ ] E2Eテストスイート実行 (`BASE_URL=<prod-url> npm run test:e2e`)

**依存関係**: P1完了後に実行

**実行方法**:
```bash
# 検証スクリプト実行
bash scripts/verify-deployment.sh

# または手動検証
curl https://your-app.vercel.app/api/stats
curl -X POST https://your-app.vercel.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{"periodDays": 30, "studentCount": 20}'
```

**依存関係**: P1完了後に実行

本番デプロイと動作確認完了後に検討。現在のMVPスコープでは必須ではない。

## 完了の定義

MVP完了条件:

- [ ] P1: インフラプロビジョニング完了（Vercelプロジェクト作成 + PostgreSQL構築 + DATABASE_URL設定）
- [ ] P2: 本番デプロイ完了（アプリケーションデプロイ + データベースマイグレーション）
- [ ] P3: 本番動作確認完了（主要API正常動作 + ダッシュボード表示）
- [ ] 品質メトリクス維持（テスト971件、カバレッジ95%以上、全ファイル300行未満）

## 技術方針

### Clean Architecture in Next.js App Router

**依存方向のルール**:
- **Domain層**: 他の層に依存しない（純粋なビジネスロジック）
- **Infrastructure層**: Domain層のインターフェースを実装
- **Application層（API Routes/Server Components）**: Domain + Infrastructureを使用
- **Presentation層（Client Components）**: Application層（API経由）と通信

**重要な制約**:
- ❌ Client Componentsから直接Domain/Infrastructureをimportしない
- ❌ Domain層からPrisma/Next.jsをimportしない
- ❌ Presentation層からInfrastructure層の型を直接importしない（cross-cutting/schemasを使用）
- ✅ Server Components/API RoutesはDomain Serviceを直接使用
- ✅ Client ComponentsはSWR/fetchでServer Componentsと通信
- ✅ 共有型はcross-cutting層（schemas）で定義し、全レイヤーからimport可能

### Repository Factoryパターン

環境依存の中央管理：

```typescript
// src/infrastructure/factories/repositoryFactory.ts
export function createStatsService(): StatsService {
  const repository = createStatsRepository();
  return new StatsService(repository);
}
```

**データソース切り替え**:
- 開発環境 (`DATABASE_PROVIDER=mirage`): MockStatsRepository（インメモリ）
- 本番環境 (`DATABASE_PROVIDER=prisma`): PrismaRecordRepository（PostgreSQL）

## 更新ルール

1. **P1/P2/P3完了時**: 完了したタスクのチェックボックスをオンにする
2. **品質メトリクス変動時**: テスト数に±10以上の変動があった場合に更新
3. **直近10コミットに基づく再評価**: 優先順位の再検証が必要な場合に更新
4. **インフラ変更時**: Vercelプロジェクト作成、データベース構築等のインフラ変更を反映

---

**最終更新**: 2026-03-17 (直近10コミット反映完了)

**現在の焦点**: P1「インフラストラクチャのプロビジョニング」。デプロイスクリプトは完成しているが、**Vercelプロジェクト未作成・PostgreSQL未構築**がボトルネック。まずVercelプロジェクトを作成し、PostgreSQLデータベースをプロビジョニングすること。
