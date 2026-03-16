# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義します。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 現在の品質ステータス

- ✅ テスト: 941/941 passing (121 suites)
- ✅ カバレッジ: 96.99% statements, 89.04% branches, 94.36% functions, 96.73% lines
- ✅ TypeScript: strict mode 100%準拠
- ✅ ESLint: zero warnings
- ✅ E2E: 41シナリオ、Playwright統合完了
- ✅ アーキテクチャ: INV-ARCH-001準拠（全テストファイル300行以下）

## 目指す完成状態

1. **本番環境稼働**: Vercel + PostgreSQLで公開されている
2. **認証・認可**: NextAuth.jsによるRole-based Access Controlが実装されている
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番環境へのデプロイ実行（最優先）

**完了条件**: Vercelで本番環境が稼働し、PostgreSQLデータベースが接続されている

**次のアクション**:
1. Vercelプロジェクト作成（GitHub連携）
2. Vercel PostgresまたはSupabaseでデータベース作成
3. 環境変数設定: `DATABASE_URL`, `DATABASE_PROVIDER=prisma`
4. デプロイ実行
5. 本番URLで動作確認
6. Prismaマイグレーション実行: `prisma migrate deploy`

**準備完了項目**:
- ✅ Prismaスキーマ: PostgreSQLに切り替え済み (ff6b575)
- ✅ Vercel設定: `vercel.json` 作成済み
- ✅ マイグレーション: PostgreSQL用に作成済み (3360ae3)
- ✅ postinstallスクリプト: `prisma generate` 設定済み
- ✅ TypeScript strict mode: 全テストファイル準拠済み (152e886, 7f9ecb7)
- ✅ ESLint: test files設定完了 (edfc0a6)
- ✅ 941 tests: 全件パス確認済み

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

1. **品質基盤**: ✅ 達成済み（96.99% coverage、941 tests passing）
2. **E2Eテスト**: ✅ 達成済み（41シナリオ）
3. **データ永続化**: ✅ 達成済み（Prisma + PostgreSQL）
4. **デプロイ準備**: ✅ 達成済み（Vercel設定完了）
5. **本番デプロイ**: ⏳ P1完了で達成
6. **認証**: ⏳ P2完了で達成

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

**最終更新**: 2026-03-17 (23系再構成)
**更新理由**: 直近10コミットの分析に基づき、以下の準備完了を確認:
- TypeScript strict mode: 全テストファイルで準拠完了 (152e886, 7f9ecb7)
- ESLint: test files設定完了、zero warnings達成 (edfc0a6, ea2dd74)
- PostgreSQL: Vercelデプロイ用マイグレーション作成完了 (3360ae3)
- 941 tests: 全件パス確認済み

**次の重点**: P1「本番環境へのデプロイ実行」の着手。技術的準備は完了済み。
