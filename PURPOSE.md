# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にします。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 品質基盤の現状

- テスト: 971/971 passing (126 suites, 214 TypeScript files)
- カバレッジ: 98.26% statements, 91.49% branches, 94.52% functions, 98.15% lines
- TypeScript: strict mode 完全準拠、**any型0件（Type Supremacy原則100%達成）**
- ESLint: zero warnings
- アーキテクチャ: Clean Architecture + Repository Factoryパターン（完全準拠）
- INV-ARCH-001準拠: 全テストファイルが300行未満

## 直近完了した改善

- Clean Architecture違反修正: Presentation層がInfrastructure層の型（GeneratedStats）に依存する問題を解消
- 型安全性完全達成: 最後の`any`型を排除し、SYSTEM_CONSTITUTION.md Type Supremacy原則に100%準拠
- 未使用コード削除: 重複排除原則に基づき未使用関数を削除

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番環境へのデプロイ完了

**完了条件**: Vercelで本番環境が稼働し、PostgreSQLデータベースが接続されている

**実行手順**:
```bash
# 1. Vercelプロジェクト設定（初回のみ）
vercel login
vercel link

# 2. 本番デプロイ実行
npm run deploy:production

# 3. Vercelダッシュボードで環境変数を設定
#    DATABASE_URL=<PostgreSQL-connection-string>
#    DATABASE_PROVIDER=prisma

# 4. 本番環境でデータベースマイグレーション実行
vercel exec -- npm run db:migrate:deploy

# 5. デプロイ検証
bash scripts/verify-deployment.sh
```

**完了の定義**:
- [ ] Vercelで本番URLが発行されている
- [ ] 本番環境で `/api/stats` が正常に動作する
- [ ] 本番環境で `/api/seed` が正常に動作する
- [ ] PostgreSQLにデータが保存されている
- [ ] ダッシュボードが表示される

**デプロイ準備完了項目**:
- ✅ デプロイ自動化スクリプト完成 (`scripts/deploy-production.sh`, `scripts/verify-deployment.sh`)
- ✅ 本番ビルド検証完了
- ✅ デプロイ実行コマンド追加 (`npm run deploy:production`)
- ✅ PostgreSQLマイグレーションスクリプト完了

**次のアクション**:
- P1完了にはVercelアカウントとPostgreSQLデータベースのプロビジョニングが必要
- デプロイ実行時は上記の手順コマンドを順次実行

### P2: 本番環境での動作確認と検証

**完了条件**: 本番環境で主要機能が動作し、E2Eテストがパスする

**検証手順**:
```bash
# P1完了後に自動検証スクリプトを実行
bash scripts/verify-deployment.sh

# または手動検証
curl -X POST https://<production-url>/api/seed
curl https://<production-url>/api/stats
# ブラウザで /dashboard にアクセス
```

**検証項目**:
- [ ] ランディングページ表示 (`/`)
- [ ] ダッシュボード表示 (`/dashboard` - 統計データ、グラフ)
- [ ] テストデータ生成 (`POST /api/seed` - 200/201 status)
- [ ] 統計API動作 (`GET /api/stats` - データ返却)
- [ ] PostgreSQLデータ永続化確認（再アクセス時にデータ保持）
- [ ] E2Eテストスイート実行 (`BASE_URL=<prod-url> npm run test:e2e`)

**完了の定義**:
- [ ] 全エンドポイントが200系レスポンスを返す
- [ ] ダッシュボードがデータを正しく表示
- [ ] PostgreSQLにデータが保存されている
- [ ] E2Eテストが全件パス

**依存関係**: P1完了後に実行

### P3: 認証・認可機能の実装（将来検討）

本番デプロイと動作確認完了後に検討。現在のMVPスコープでは必須ではない。

## 完了の定義

MVP完了条件:

- [ ] P1: 本番デプロイ完了（実行待ち - スクリプト完成済み）
- [ ] P2: 本番動作確認完了（P1完了後に実施）
- [ ] 品質メトリクス維持（テスト971件、カバレッジ98%以上、全ファイル300行未満）

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

1. **P1/P2完了時**: 完了したタスクのチェックボックスをオンにする
2. **品質メトリクス変動時**: テスト数に±10以上の変動があった場合に更新
3. **直近10コミットに基づく再評価**: 優先順位の再検証が必要な場合に更新

---

**最終更新**: 2026-03-17 (直近10コミット反映完了)

**現在の焦点**: P1「本番環境へのデプロイ完了」。全自動化スクリプト完了済み。Vercelプロジェクト設定とPostgreSQLプロビジョニング後にデプロイ実行可能。
