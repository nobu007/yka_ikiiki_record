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

## 現状: 品質改善・保守フェーズ

### 開発品質の現状

**コア機能は実装完了しており、現在は品質向上とテストカバレッジの改善に注力しています。**

- **テスト**: 974/974 passing (126 suites) - 完全合格
- **カバレッジ**: 98.35% statements, 91.81% branches, 94.57% functions, 98.25% lines
- **TypeScript**: strict mode 完全準拠、**any型0件**
- **ESLint**: zero warnings
- **アーキテクチャ**: Clean Architecture完全準拠
- **状態**: 開発環境で完全に動作、Mirageモックプロバイダーで機能検証済み

### 完了済みの作業

- ✅ Clean Architecture完全実装（Domain/Application/Infrastructure/Presentation分離）
- ✅ Repository Factoryパターン（Mirage/Prisma環境切り替え）
- ✅ すべてのAPIエンドポイント実装 (`/api/stats`, `/api/seed`, `/api/records`)
- ✅ Reactコンポーネント実装（Dashboard, DataVisualization, EventManager）
- ✅ テストスイート完成（974件、カバレッジ98%+）
- ✅ TypeScript strict mode 完全準拠（any型0件、ESLint zero warnings）

## 直近の優先成果

### P1: テストカバレッジ改善（現在進行中）

**直近の実績（コミット 9c308e5）**:
- Seed APIのTTL cleanupロジックに対するテストを追加
- `app/api/seed/route.ts`のカバレッジ: 94.28% → 97.67% (+3.39%)
- テスト数: 971 → 974 (+3件)

**次の重点対象**:
- ブランチカバレッジの向上（現在91.81% → 目標95%以上）
- エッジケースのテスト補強
- 境界値テストの追加

### P2: 本番インフラ構築（P1完了後）

コードベースは機能的に完成しています。本番デプロイに必要な作業：

1. **Vercelプロジェクト作成**（5分）
   ```bash
   vercel link
   ```

2. **PostgreSQLデータベース構築**（10分）
   - 選択肢A: Vercel Postgres（推奨）
   - 選択肢B: 外部PostgreSQL（Supabase/Neon等）

3. **環境変数設定**（2分）
   ```bash
   vercel env add DATABASE_URL production
   ```

4. **本番デプロイ実行**（5分）
   ```bash
   bash scripts/deploy-production.sh
   ```

5. **本番検証**（8分）
   ```bash
   bash scripts/verify-deployment.sh
   ```

### P3: 運用開始後の改善（本番デプロイ完了後）

実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

## 完了の定義

### P1完了条件（テスト品質向上）

- [ ] ブランチカバレッジ 95%以上（現在91.81%）
- [ ] すべての重要なエッジケースをテスト済み
- [ ] カバレッジの抜け漏れ箇所を特定・補完済み

### P2完了条件（インフラ設定）

- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] DATABASE_URL環境変数設定
- [ ] 本番デプロイ実行
- [ ] 本番URLで動作確認

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

1. **品質メトリクス変動時**: テスト数に±10以上の変動があった場合に更新
2. **P1完了時**: カバレッジ目標達成後、P2（インフラ構築）へ移行
3. **P2完了時**: 本番デプロイ完了後、P3（運用改善）の検討を開始
4. **新機能開発時**: 新しい開発タスクが発生した場合に更新

---

**最終更新**: 2026-03-17

**現在の状態**: 機能実装完了、テスト品質向上フェーズ。直近のコミットではseed APIのTTL cleanupロジックに対するテスト補強を実施（カバレッジ94.28% → 97.67%）。次はブランチカバレッジの向上とエッジケースのテスト補強が優先。
