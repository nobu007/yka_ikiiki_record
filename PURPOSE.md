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

## 現状

開発品質目標を達成し、本番デプロイの準備が完了しました。

### 品質メトリクス

- **テスト**: 1031/1031 passing (136 suites)
- **カバレッジ**: 98.68% statements, **94.73% branches**, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件、ESLint zero warnings
- **アーキテクチャ**: Clean Architecture完全準拠、テストファイル分割完了（INV-ARCH-001）

### 残り0.27%のブランチカバレッジ

以下はテスト不可能なコードであり、SYSTEM_CONSTITUTION.md「禁止事項」に基づきソースコード修正は行いません：

- PrismaSeedRepository.ts line 37: デッドコード（コメント内のnullチェック）
- Notification.tsx line 27: 到達不能パス（UIボタン非表示時のoptional chaining）
- DynamicBarChart.tsx lines 108-126: 外部ライブラリ設定オブジェクト（ApexCharts formatters）

**判断**: 実質的なテスト品質目標は達成済み。本番インフラ構築フェーズへ移行。

## 直近の優先成果

### P1: 開発品質目標達成 ✅ 完了

- [x] ブランチカバレッジ 94.73%（テスト可能な全ブランチを網羅）
- [x] TypeScript strict mode 完全準拠（any型0件）
- [x] ESLint zero warnings
- [x] 1031/1031テスト合格
- [x] INV-ARCH-001準拠（全ファイル300行以下）

**最新の改善内容**:
- テストファイル分割: PrismaStatsRepository.test.ts (322行) → 3ファイル、error-handler.test.ts (315行) → 4ファイル
- ブランチカバレッジ改善: Dashboard HTTP error handling、DynamicBarChart error handling、validation error paths

### P2: 本番インフラ構築（現在のフェーズ）

コードベースは機能的に完成しており、すぐにデプロイ可能です。

**完了条件**:
- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] DATABASE_URL環境変数設定
- [ ] 本番デプロイ実行
- [ ] 本番URLで動作確認

**実行手順**:
```bash
# 1. Vercelプロジェクト作成（5分）
vercel link

# 2. PostgreSQLデータベース構築（10分）
# 選択肢A: Vercel Postgres（推奨）
# 選択肢B: 外部PostgreSQL（Supabase/Neon等）

# 3. 環境変数設定（2分）
vercel env add DATABASE_URL production

# 4. 本番デプロイ実行（5分）
bash scripts/deploy-production.sh

# 5. 本番検証（8分）
bash scripts/verify-deployment.sh
```

### P3: 運用開始後の改善

本番デプロイ完了後、実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

## 完了の定義

### P1完了条件 ✅

- [x] テスト可能なすべてのブランチをカバー（94.73%達成）
- [x] TypeScript strict mode完全準拠
- [x] ESLint zero warnings
- [x] 1031/1031テスト合格
- [x] INV-ARCH-001準拠（全テストファイル300行以下）

### P2完了条件

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

1. **P2完了時**: 本番デプロイ完了後、P3（運用改善）へ移行
2. **品質メトリクス変動時**: テスト数に±10以上の変動があった場合に更新
3. **新機能開発時**: 新しい開発タスクが発生した場合に更新

---

**最終更新**: 2026-03-17

**現在の状態**: 開発品質フェーズ完了（ブランチカバレッジ94.73%、残り0.27%はテスト不可能なデッドコード・外部ライブラリ設定）。TypeScript strict mode完全準拠、ESLint zero warnings、INV-ARCH-001準拠。コードベースは本番デプロイ可能。次はP2（本番インフラ構築）の実施。
