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

## 現状: 開発完了

### 開発品質の現状

**すべての開発作業は完了しています。**

- **テスト**: 974/974 passing (126 suites) - 完全合格
- **カバレッジ**: 98.35% statements, 91.81% branches, 94.57% functions, 98.25% lines
- **TypeScript**: strict mode 完全準拠、**any型0件**
- **ESLint**: zero warnings
- **アーキテクチャ**: Clean Architecture完全準拠
- **品質**: 全テストファイル300行未満、Production-ready

### 完了済みの作業

- ✅ Clean Architecture完全実装（Domain/Application/Infrastructure/Presentation分離）
- ✅ Repository Factoryパターン（Mirage/Prisma環境切り替え）
- ✅ すべてのAPIエンドポイント実装 (`/api/stats`, `/api/seed`, `/api/records`)
- ✅ Reactコンポーネント実装（Dashboard, DataVisualization, EventManager）
- ✅ テストスイート完成（974件、カバレッジ98%+）
- ✅ デプロイスクリプト作成 (`scripts/deploy-production.sh`, `scripts/verify-deployment.sh`)
- ✅ TypeScript strict mode 完全準拠（any型0件、ESLint zero warnings）

## 直近の優先成果

### 開発完了 - 残るはインフラ設定のみ

**重要**: コードベースは完全に完成済みです。残りは**インフラ設定作業のみ**（開発作業は一切ありません）。

#### P1: 本番インフラ構築（初回のみ、30分）

これは開発作業ではなく、インフラ設定作業です：

1. **Vercelプロジェクト作成**（5分）
   ```bash
   cd /home/jinno/yka_ikiiki_record
   vercel link
   ```

2. **PostgreSQLデータベース構築**（10分）
   - 選択肢A: Vercel Postgres（推奨）- Vercel Dashboard → Storage → Create Database → Postgres
   - 選択肢B: 外部PostgreSQL（Supabase/Neon等）- 接続文字列を取得

3. **環境変数設定**（2分）
   ```bash
   vercel env add DATABASE_URL production
   # 接続文字列をペースト
   ```

4. **本番デプロイ実行**（5分）
   ```bash
   bash scripts/deploy-production.sh
   ```

5. **本番検証**（8分）
   ```bash
   bash scripts/verify-deployment.sh
   ```

#### P2: 運用開始後の改善（デプロイ完了後）

デプロイ完了後、実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

**重要**: これらは現在の優先タスクではありません。まずP1のインフラ設定を完了させてください。

## 完了の定義

### MVP完了条件（インフラ設定）

- [ ] Vercelプロジェクト作成 (`vercel link`)
- [ ] PostgreSQLデータベース構築
- [ ] DATABASE_URL環境変数設定
- [ ] 本番デプロイ実行 (`bash scripts/deploy-production.sh`)
- [ ] 本番URLで動作確認 (`bash scripts/verify-deployment.sh`)

### 次のフェーズへの移行条件

MVP完了後、実際の使用に基づいてP2の改善を検討してください。

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

1. **P1完了時**: インフラ設定完了後、次のフェーズ（P2）の検討を開始
2. **品質メトリクス変動時**: テスト数に±10以上の変動があった場合に更新
3. **新機能開発時**: 新しい開発タスクが発生した場合のみ更新（現在は開発完了のため不要）

---

**最終更新**: 2026-03-17

**現在の状態**: 開発完了。コードベースは完全に完成済みで、すべての開発作業・テスト・アーキテクチャ改善が完了している。残るはVercelプロジェクト作成とPostgreSQLデータベース構築のインフラ設定作業のみ（30分で完了）。
