# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義します。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 品質基盤（全項目達成済み）

- ✅ テスト: 971/971 passing (126 suites)
- ✅ カバレッジ: 98.26% statements, 91.49% branches, 94.52% functions, 98.15% lines
- ✅ TypeScript: strict mode 完全準拠
- ✅ ESLint: zero warnings
- ✅ アーキテクチャ: Clean Architecture + Repository Factoryパターン
- ✅ INV-ARCH-001準拠: 全テストファイルが300行未満（最大162行）
- ✅ デプロイ自動化: deploy-production.sh, verify-deployment.sh実装完了

## 目指す完成状態

1. **本番環境稼働**: Vercel + PostgreSQLで公開されている
2. **データ永続化**: 本番環境でPrisma + PostgreSQLが動作している
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番環境へのデプロイ実行

**完了条件**: Vercelで本番環境が稼働し、PostgreSQLデータベースが接続されている

**実行手順**:
```bash
# 1. Vercelログイン（初回のみ）
vercel login

# 2. デプロイ自動化スクリプト実行
npm run deploy:production

# 3. データベース環境変数設定（Vercelダッシュボード）
#    DATABASE_URL=<your-connection-string>
#    DATABASE_PROVIDER=prisma

# 4. データベースマイグレーション実行
vercel exec -- npm run db:migrate:deploy

# 5. デプロイ検証スクリプト実行
bash scripts/verify-deployment.sh
```

**現在の状態**: デプロイ自動化スクリプト完成済み。全技術的前提条件充足済み。実行のみ待機中。

### P2: 本番環境での動作確認とE2Eテスト実行

**完了条件**: 本番環境でE2Eテストがパスし、主要ユーザー操作が検証されている

**検証項目**:
- ✅ ダッシュボード表示（統計データ、グラフ）
- ✅ テストデータ生成 (`/api/seed`)
- ✅ 統計API動作 (`/api/stats`)
- ✅ PostgreSQLデータ永続化
- ✅ E2Eテストスイート実行

**依存関係**: P1完了後

### P3: 認証・認可機能の実装（将来検討）

本番デプロイと動作確認完了後に検討。現在のスコープでは必須ではない。

## 完了の定義

このプロジェクトのMVP完了条件:

1. **品質基盤**: ✅ 達成済み
2. **データ永続化**: ✅ 達成済み
3. **環境設定**: ✅ 達成済み
4. **デプロイ自動化**: ✅ 達成済み
5. **本番デプロイ実行**: ⏳ P1実行待ち
6. **本番動作確認**: ⏳ P2未着手（P1完了後に開始）

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
- ✅ Server Components/API RoutesはDomain Serviceを直接使用
- ✅ Client ComponentsはSWR/fetchでServer Componentsと通信

### Repository Factoryパターン

環境依存の中央管理とDRY原則の遵守：

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

この文書は以下の場合に更新します:

1. **P1/P2完了時**: 完了したタスクを完了済みに移動
2. **品質メトリクス変動時**: テスト数に大幅な変動があった場合（±10テスト以上）
3. **直近10コミットに基づく再評価**: 優先順位の再検証

---

**最終更新**: 2026-03-17

**現在の焦点**: P1「本番環境へのデプロイ実行」。デプロイ自動化スクリプト完成済み。全技術的前提条件充足済み。実行のみ待機中。
