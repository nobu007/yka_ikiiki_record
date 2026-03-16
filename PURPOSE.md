# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義します。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 現在の品質ステータス

- ✅ テスト: 951/951 passing (122 suites)
- ✅ カバレッジ: 96.99% statements, 94.73% branches, 95.56% functions, 97.56% lines
- ✅ TypeScript: strict mode 100%準拠
- ✅ ESLint: zero warnings
- ✅ E2E: 41シナリオ、Playwright統合完了
- ✅ アーキテクチャ: INV-ARCH-001準拠（全テストファイル300行以下）
- ✅ Repository Factory: DRY違反对策完了 (f856f85)

## 目指す完成状態

1. **本番環境稼働**: Vercel + PostgreSQLで公開されている
2. **認証・認可**: NextAuth.jsによるRole-based Access Controlが実装されている
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番環境へのデプロイ実行（最優先・未実行）

**完了条件**: Vercelで本番環境が稼働し、PostgreSQLデータベースが接続されている

**次のアクション**:
1. Vercelプロジェクト作成（GitHub連携）
2. Vercel PostgresまたはSupabaseでデータベース作成
3. 環境変数設定: `DATABASE_URL`, `DATABASE_PROVIDER=prisma`
4. デプロイ実行
5. 本番URLで動作確認
6. Prismaマイグレーション実行: `prisma migrate deploy`

**技術的準備完了** (全項目達成済み、デプロイ実行のみ):
- ✅ Prismaスキーマ: PostgreSQLに切り替え済み
- ✅ Vercel設定: `vercel.json` 作成済み
- ✅ マイグレーション: PostgreSQL用に作成済み
- ✅ postinstallスクリプト: `prisma generate` 設定済み
- ✅ TypeScript strict mode: 全951テストファイルで完全準拠
- ✅ ESLint: zero warnings達成
- ✅ Repository Factory: DRY違反对策完了
- ✅ テスト: 951 tests全件パス、coverage 96.99%

**現在状態**: デプロイの技術的前提条件は100%充足済み。即時実行可能。

### P2: 認証・認可機能の実装

**完了条件**: ユーザー認証と基本的な認可が実装され、E2Eテストで検証されている

**実装範囲**:
- 認証プロバイダー: NextAuth.js (Auth.js) v5
- 認証方法: GitHub/Google OAuth（開発用）+ Email/Password（本番用）
- 認可モデル: Role-based Access Control (admin, teacher, student)
- 保護対象: `/api/seed`（admin必須）、`/api/stats`（読み取りは公開、書き込みは認証）

**依存関係**: P1完了後

### P3: ユーザー体験の向上（オプション）

**完了条件**: 基本的なUX改善が実装されている

**実装範囲**:
- ローディング状態: Suspense boundaries、Loading skeletons
- エラーハンドリング: ユーザーフレンドリーなエラーメッセージ
- アクセシビリティ: ARIAラベル、キーボードナビゲーション
- パフォーマンス: Next.js Image最適化、コード分割

**依存関係**: P2完了後

## 完了の定義

このプロジェクトのMVPが「完了」と見なされる条件:

1. **品質基盤**: ✅ 達成済み（96.99% coverage、951 tests passing）
2. **E2Eテスト**: ✅ 達成済み（41シナリオ）
3. **データ永続化**: ✅ 達成済み（Prisma + PostgreSQL）
4. **デプロイ準備**: ✅ 達成済み（全技術的前提条件充足）
5. **本番デプロイ**: ⏳ 未実行（P1：技術準備完了、デプロイ実行のみ）
6. **認証**: ⏳ 未着手（P2：P1完了後に開始）

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

### データソース切り替え

- **開発環境** (`DATABASE_PROVIDER=mirage`): MockStatsRepository（インメモリ）
- **本番環境** (`DATABASE_PROVIDER=prisma`): PrismaRecordRepository（PostgreSQL）

## 更新ルール

この文書は以下の場合に更新します:

1. **P1/P2/P3完了時**: 完了したタスクを完了済みに移動
2. **優先順位変更時**: ビジネス要件や技術的制約により優先順位が変更された場合
3. **品質メトリクス変動時**: カバレッジやテスト数に大幅な変動があった場合

---

**最終更新**: 2026-03-17 (23系再構成ループ #2)

**直近10コミットの実質的進捗**:
- f856f85: Repository Factory抽出によるDRY違反对策完了（/api/stats: 48%削減、/api/seed: 21%削減）
- 152e886, 7f9ecb7, ea2dd74: TypeScript strict mode完全準拠（全951テスト）、ESLint zero warnings達成
- 3360ae3: PostgreSQL用マイグレーション作成、Vercelデプロイ準備完了

**診断結果**:
- ✅ 技術的品質: 最高水準に到達（96.99% coverage、951 tests全パス、strict mode完全準拠）
- ⚠️ デプロイ実行: 技術準備は100%完了だが、実際のVercelデプロイは未実行
- ❌ 認証機能: P2は完全未着手

**次の重点**: P1「本番環境へのデプロイ実行」が唯一の最優先タスク。技術的前提条件はすべて充足済みのため、即時デプロイ実行が可能。
