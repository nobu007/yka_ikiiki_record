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

## 現状: コード完了、デプロイ準備完了

### 開発品質の現状

- **テスト**: 974/974 passing (126 suites) - 完全合格
- **カバレッジ**: 98.35% statements, 91.81% branches, 94.57% functions, 98.25% lines
- **TypeScript**: strict mode 完全準拠、**any型0件**
- **ESLint**: zero warnings
- **アーキテクチャ**: Clean Architecture完全準拠（最近の改善でStatsData型をcross-cutting層に移動）
- **テスト品質**: 全テストファイル300行未満、Seed API TTL cleanupテストカバレッジ97.67%

### 完了済みの開発作業

- ✅ デプロイスクリプト完成 (`scripts/deploy-production.sh`)
- ✅ 検証スクリプト完成 (`scripts/verify-deployment.sh`)
- ✅ Clean Architecture違反修正 (StatsData型をInfrastructure→cross-cutting/schemasに移動)
- ✅ Seed API TTL cleanupテスト強化 (94.28% → 97.67%)
- ✅ Repository Factoryパターン実装 (Mirage/Prisma環境切り替え可能)

## 直近の優先成果

### 現在の焦点: 運用デプロイの実行

**重要**: コードベースは完全にデプロイ準備完了。残りは**運用作業のみ**（開発作業はすべて完了）。

#### ステップ1: Vercelプロジェクト作成（5分）

```bash
# プロジェクトをVercelにリンク
cd /home/jinno/yka_ikiiki_record
vercel link
```

#### ステップ2: PostgreSQLデータベース構築（10分）

**選択肢A: Vercel Postgres（推奨）**
1. Vercel Dashboardを開く: https://vercel.com/dashboard
2. プロジェクトを選択 → Storage → Create Database → Postgres
3. DATABASE_URLをコピー

**選択肢B: 外部PostgreSQL（Supabase/Neon等）**
1. 外部サービスでデータベースを作成
2. 接続文字列（postgresql://...）を取得

#### ステップ3: 環境変数設定（2分）

```bash
vercel env add DATABASE_URL production
# 接続文字列をペースト

# 確認
vercel env ls . | grep DATABASE_URL
```

#### ステップ4: 本番デプロイ実行（5分）

```bash
# 自動化スクリプト実行
bash scripts/deploy-production.sh

# または手動実行
npm run build
vercel --prod --yes

# データベースマイグレーション
vercel exec -- npm run db:migrate:deploy
```

#### ステップ5: 本番検証（5分）

```bash
# 検証スクリプト実行
bash scripts/verify-deployment.sh

# または手動検証
PROD_URL=$(vercel ls --prod | grep lively-demo | awk '{print $2}')
curl https://${PROD_URL}/api/stats
curl -X POST https://${PROD_URL}/api/seed \
  -H "Content-Type: application/json" \
  -d '{"periodDays": 30, "studentCount": 20}'
```

### 完了チェックリスト

運用作業の完了定義:

- [ ] Vercelプロジェクト作成完了 (`vercel link`)
- [ ] PostgreSQLデータベース構築完了
- [ ] DATABASE_URL環境変数設定完了
- [ ] 本番デプロイ実行完了 (`bash scripts/deploy-production.sh`)
- [ ] 本番URLで主要API動作確認 (`/api/stats`, `/api/seed`)
- [ ] ダッシュボード表示確認 (`/dashboard`)
- [ ] 品質メトリクス維持確認（テスト974件、カバレッジ95%以上）

## 完了の定義

### MVP完了条件（運用作業）

- [ ] Vercelプロジェクト作成 (`vercel link`)
- [ ] PostgreSQLデータベース構築
- [ ] DATABASE_URL環境変数設定
- [ ] 本番デプロイ実行 (`bash scripts/deploy-production.sh`)
- [ ] 本番URLで動作確認 (`bash scripts/verify-deployment.sh`)
- [ ] 品質メトリクス維持（テスト974件、カバレッジ95%以上）

### 次のフェーズへの移行条件

MVP完了後、以下の機能拡張を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

**重要**: これらはMVP完了後の検討事項であり、現在はデプロイ完了を最優先する。

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

**最終更新**: 2026-03-17

**現在の焦点**: 運用デプロイの実行。コードベースは完全に完了済みで、すべての開発作業・テスト・アーキテクチャ改善が完了している。残るのはVercelプロジェクト作成とPostgreSQLデータベース構築の運用作業のみ。
