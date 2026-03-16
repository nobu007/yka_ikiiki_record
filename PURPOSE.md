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

## 現状: テスト品質向上フェーズ

### 開発品質の現状

**コア機能は実装完了しており、ブランチカバレッジ95%達成に向けて最終段階のテスト補強を行っています。**

- **テスト**: 1018/1018 passing (129 suites) - 完全合格
- **カバレッジ**: 98.6% statements, **93.56% branches**, 94.57% functions, 98.53% lines
- **TypeScript**: strict mode 完全準拠、**any型0件**
- **ESLint**: zero warnings
- **アーキテクチャ**: Clean Architecture完全準拠
- **状態**: 開発環境で完全に動作、Mirageモックプロバイダーで機能検証済み

### 完了済みの作業

- ✅ Clean Architecture完全実装（Domain/Application/Infrastructure/Presentation分離）
- ✅ Repository Factoryパターン（Mirage/Prisma環境切り替え）
- ✅ すべてのAPIエンドポイント実装 (`/api/stats`, `/api/seed`, `/api/records`)
- ✅ Reactコンポーネント実装（Dashboard, DataVisualization, EventManager）
- ✅ テストスイート完成（1018件、カバレッジ98%+）
- ✅ TypeScript strict mode 完全準拠（any型0件、ESLint zero warnings）
- ✅ 境界値テスト網羅（useDataGeneration: student count 10-500, period days 7-365）
- ✅ 条件分岐テスト補強（EmotionChart, DynamicBarChart, error-handler）
- ✅ バリデーションエラーパステスト網羅（useSeedGeneration, useDashboard, API routes）

## 直近の優先成果

### P1: テストカバレッジ改善（最終段階）

**直近の実績（コミット 1572800, a45dae1）**:
- 境界値テスト網羅（useDataGeneration: student count 10-500, period days 7-365）
- EmotionChartのgetChartOptions条件分岐テスト（pie/donut vs standard）
- バリデーションエラーパステスト網羅（useSeedGeneration, useDashboard, API routes）
- error-handlerの非テスト環境ログフォーマットテスト
- PrismaStatsRepositoryの境界外インデックスフォールバックテスト
- ブランチカバレッジ: 91.81% → 93.56% (+1.75%)
- テスト数: 974 → 1018 (+44件)

**次の重点対象（未カバー分岐の特定）**:
- `Dashboard.tsx`: 89.28% branches (line 43未カバー)
- `DynamicBarChart.tsx`: 89.47% branches (lines 53-54, 108-126未カバー)
- `EmotionChart.tsx`: 85.71% branches (line 38未カバー)
- `PrismaSeedRepository.ts`: 90% branches (line 37未カバー)
- `PrismaStatsRepository.ts`: 83.33% branches (line 62未カバー)
- `utils/statsCalculator.ts`: 94.28% branches (lines 30, 143未カバー)

**目標**: ブランチカバレッジ 93.56% → 95%以上 (+1.44%)

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

- [ ] ブランチカバレッジ 95%以上（現在93.56%）
- [ ] 残りの未カバー分岐を特定・テスト追加:
  - [ ] Dashboard.tsx (line 43)
  - [ ] DynamicBarChart.tsx (lines 53-54, 108-126)
  - [ ] EmotionChart.tsx (line 38)
  - [ ] PrismaSeedRepository.ts (line 37)
  - [ ] PrismaStatsRepository.ts (line 62)
  - [ ] utils/statsCalculator.ts (lines 30, 143)
- [ ] 境界値テストの完全網羅（完了）

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

**現在の状態**: 機能実装完了、テスト品質向上フェーズの最終段階。直近のコミット(1572800, a45dae1)ではバリデーションエラーパステストと境界値テストを追加（ブランチカバレッジ91.81% → 93.56%、テスト数974 → 1018）。残り1.44%分の未カバー分岐（6ファイル）を特定済み。次はこれらの分岐に対するテスト補強を行い、ブランチカバレッジ95%達成を目指す。
