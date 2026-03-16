# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義します。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 品質基盤（全項目達成済み）

- ✅ テスト: 951/951 passing (122 suites)
- ✅ カバレッジ: 96.99% statements, 94.73% branches, 95.56% functions, 97.56% lines
- ✅ TypeScript: strict mode 準拠（最近22ファイルの型エラーを修正）
- ✅ ESLint: zero warnings
- ✅ アーキテクチャ: Repository Factoryパターン実装完了（DRY違反对策）
- ✅ PostgreSQL: Prismaマイグレーション準備完了
- ✅ 本番デプロイ準備: READMEにVercel/Supabaseデプロイ手順を完備

## 目指す完成状態

1. **本番環境稼働**: Vercel + PostgreSQLで公開されている
2. **データ永続化**: 本番環境でPrisma + PostgreSQLが動作している
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番環境へのデプロイ実行（最優先・未着手）

**完了条件**: Vercelで本番環境が稼働し、PostgreSQLデータベースが接続されている

**実行手順**:
```bash
# 1. Vercelプロジェクト作成
vercel login
vercel

# 2. データベース作成（選択肢）
#    - Option A: Vercel Postgres
#    - Option B: Supabase

# 3. 環境変数設定（Vercelダッシュボード）
DATABASE_URL=<your-connection-string>
DATABASE_PROVIDER=prisma

# 4. 本番デプロイ
vercel --prod

# 5. データベースマイグレーション
prisma migrate deploy
```

**技術的前提条件**: ✅ 全項目充足済み
- ✅ コード品質: 96.99% coverage、951 tests passing
- ✅ アーキテクチャ: Clean Architecture、Repository Factory
- ✅ データ層: Prisma + PostgreSQL準備完了
- ✅ デプロイ設定: vercel.json、README手順完備

**現在の状態**: 技術準備は100%完了。実行のみ。

### P2: 本番環境での動作確認とE2Eテスト実行

**完了条件**: 本番環境でE2Eテストがパスし、主要ユーザー操作が検証されている

**検証項目**:
- ✅ ダッシュボード表示（統計データ、グラフ）
- ✅ テストデータ生成 (`/api/seed`)
- ✅ 統計API動作 (`/api/stats`)
- ✅ PostgreSQLデータ永続化

**依存関係**: P1完了後

### P3: 認証・認可機能の実装（将来検討）

本番デプロイと動作確認完了後に検討。現在のスコープでは必須ではない。

## 完了の定義

このプロジェクトのMVPが「完了」と見なされる条件:

1. **品質基盤**: ✅ 達成済み（96.99% coverage、951 tests passing）
2. **データ永続化**: ✅ 達成済み（Prisma + PostgreSQL実装完了）
3. **デプロイ準備**: ✅ 達成済み（技術的前提条件・手順書充足）
4. **本番デプロイ**: ⏳ P1未着手（実行のみ）
5. **本番動作確認**: ⏳ P2未着手（P1完了後に開始）

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

### Repository Factoryパターン（最新実装）

直近のリファクタリング（f856f85）で導入された共有ファクトリパターン：

```typescript
// src/infrastructure/factories/repositoryFactory.ts
export function createStatsService(): StatsService {
  const repository = createStatsRepository();
  return new StatsService(repository);
}

// 使用例: API Routes
const statsService = createStatsService();
const stats = await statsService.getStats();
```

**効果**:
- ✅ DRY原則の遵守（重複コード削減）
- ✅ 環境依存の中央管理（`DATABASE_PROVIDER`）
- ✅ ルートハンドラーの簡素化（48%のコード削減）

### データソース切り替え

- **開発環境** (`DATABASE_PROVIDER=mirage`): MockStatsRepository（インメモリ）
- **本番環境** (`DATABASE_PROVIDER=prisma`): PrismaRecordRepository（PostgreSQL）

## 更新ルール

この文書は以下の場合に更新します:

1. **P1/P2完了時**: 完了したタスクを完了済みに移動
2. **品質メトリクス変動時**: カバレッジやテスト数に大幅な変動があった場合
3. **アーキテクチャ変更時**: 新しいパターン導入時（Repository Factoryなど）

---

**最終更新**: 2026-03-17 (23系再構成ループ #4)

**現在の焦点**: P1「本番環境へのデプロイ実行」が最優先。技術準備は100%完了。実行のみ。

**最近の主要改善**:
- Repository Factoryパターン導入（f856f85）
- TypeScript strict mode対応（152e886）
- DRY違反对策完了（ルートハンドラー48%削減）
