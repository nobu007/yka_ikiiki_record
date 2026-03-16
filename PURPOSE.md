# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築し、AIによる自律的ソフトウェア開発の実証実験として完全自律型開発システムを確立する。

## この文書の役割

この文書は、プロジェクトの**次に終わらせるべき目標**を明確にするための「到達目標と次の一手」を定義するものです。過去の達成履歴ではなく、**次のアクション判断に必要な情報のみ**を記載します。

## 品質基盤（現在のステータス）

### 品質メトリクス
- ✅ すべてのテスト: 923/923 passing
- ✅ Lintエラー: 0件
- ✅ TypeScript厳格モード: 100%準拠
- ✅ 全体カバレッジ: 97.41% statements, 90.03% branches, 98.57% functions, 97.22% lines
- ✅ E2Eテスト: 41シナリオ、CI統合完了
- ✅ Prismaインフラ層: 100% coverage

### 完了したマイルストーン
- ✅ **E2Eテスト基盤** - Playwrightによる包括的なE2Eテスト、CI統合完了
- ✅ **Prismaデータ永続化層** - Repository実装、スキーマ定義、マイグレーション、シード（750件）、100% test coverage
- ✅ **APIルートPrisma統合** - `/api/stats`、`/api/seed` で `DATABASE_PROVIDER=mirage|prisma` による切り替え実装完了

**アーキテクチャに関する注記**:
- Next.js App Routerでは、Server Components/API Routesがアプリケーション境界となる
- Client ComponentsはSWR/fetchでServer Componentsを呼び出すのが正しいパターン
- 現在の実装（Application hooks → API Routes → Domain Services）はClean Architectureの原則に従っている

## 直近の優先成果（次に終わらせるべきこと）

### P1: 認証・認可機能の実装

**完了条件**: ユーザー認証と基本的な認可が実装され、E2Eテストで検証されている

**実装範囲**:
1. **認証プロバイダー**: NextAuth.js (Auth.js) v5
2. **認証方法**: GitHub/Google OAuth（開発用）+ Email/Password（本番用）
3. **認可モデル**: Role-based Access Control (admin, teacher, student)
4. **保護対象**: `/api/stats`（認証必須）、`/api/seed`（admin必須）
5. **E2Eテスト**: 認証フローの網羅的検証

**技術的制約**:
- 既存の923テストは全てパスし続けること
- TypeScript strict mode維持
- 認証状態はE2Eテストでモックまたはテスト用認証を使用

### P2: 本番環境デプロイ準備

**完了条件**: Vercel等で本番環境にデプロイ可能な状態

**実装範囲**:
1. **データベース**: PostgreSQL（SupabaseまたはVercel Postgres）
2. **環境変数**: `DATABASE_URL`, `AUTH_SECRET`, OAuth credentials
3. **デプロイ設定**: Vercelプロジェクト設定、環境変数、ビルド設定
4. **モニタリング**: Vercel Analytics、エラートラッキング
5. **セキュリティ**: HTTPS、CORS、Rate limiting

**技術的制約**:
- デプロイ時に全テストがパスすること
- データベース接続エラーの適切なハンドリング
- 本番環境でのE2Eテスト実行

### P3: ユーザー体験の向上（オプション）

**完了条件**: 基本的なUX改善が実装されている

**実装範囲**:
1. **ローディング状態**: Suspense boundaries、Loading skeletons
2. **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージ、回復オプション
3. **アクセシビリティ**: ARIAラベル、キーボードナビゲーション、スクリーンリーダー対応
4. **パフォーマンス**: Next.js Image最適化、コード分割、Bundle size削減

## 技術方針

### Clean Architecture in Next.js App Router

**現在の実装（正しいパターン）**:
```
Client Components (Presentation Layer)
  ↓ SWR/fetch
Server Components / API Routes (Application Boundary)
  ↓
Domain Services (StatsService, EmotionGenerator)
  ↓
Repository Interface (IRecordRepository)
  ↑
Infrastructure Implementations (PrismaRecordRepository, MockStatsRepository)
```

**依存方向のルール**:
- **Domain層**: 他の層に依存しない（純粋なビジネスロジック）
- **Infrastructure層**: Domain層のインターフェースを実装
- **Application層（API Routes/Server Components）**: Domain + Infrastructureを使用
- **Presentation層（Client Components）**: Application層（API経由）と通信

**重要な制約**:
- ❌ Client Componentsから直接Domain/Infrastructureをimportしない
- ❌ Domain層からPrisma/Next.jsをimportしない
- ✅ Server Components/API RoutesはDomain Serviceを直接使用してよい
- ✅ Client ComponentsはSWR/fetchでServer Componentsと通信する

### データソース切り替え方針

**開発環境** (`DATABASE_PROVIDER=mirage`):
- MockStatsRepository（インメモリ、高速）
- API RoutesはMockデータを返す
- テスト実行: 速い、DB不要

**本番環境** (`DATABASE_PROVIDER=prisma`):
- PrismaRecordRepository（PostgreSQL）
- API RoutesはPrisma経由でDBアクセス
- 永続化、スケーラビリティ

### 認証アーキテクチャ（NextAuth.js v5）

```
Authentication Flow:
1. User → /login → NextAuth OAuth flow
2. NextAuth → Callback → Create/Update User in DB
3. Session → JWT or Database session
4. Client → API Request → Session validation
5. Protected Route → middleware → check session
```

**Role-based Access Control**:
- `admin`: 全データへのCRUDアクセス、シード生成可能
- `teacher`: 自身のクラスデータの参照・更新
- `student`: 自身のデータの参照のみ

## 完了の定義

このプロジェクトのMVPが「完了」と見なされる条件:

1. **品質基盤**: ✅ 達成済み（97.41% coverage、923 tests passing）
2. **E2Eテスト**: ✅ 達成済み（41シナリオ、3ブラウザ対応）
3. **データ永続化**: ✅ 達成済み（Prisma + 環境変数切り替え、100% coverage）
4. **認証**: ⏳ P1完了で達成（NextAuth.js、Role-based認可）
5. **デプロイ**: ⏳ P2完了で達成（Vercel、PostgreSQL）

## 更新ルール

この文書は以下の場合に更新します:

1. **P1/P2/P3完了時**: 完了したマイルストーンを「達成済み」として記載
2. **優先順位変更時**: ビジネス要件や技術的制約により優先順位が変更された場合
3. **四半期ごと**: 少なくとも四半期に1回は現状の再評価
4. **アーキテクチャ変更時**: Clean Architecture原則に変更があった場合

---

**最終更新**: 2026-03-17
**更新理由**: 直近10コミットの分析に基づき、以下の事実を確認:
- b3dfc7fでPrismaインフラ層のApplication layer統合完了
- Prismaインフラ層のカバレッジが100%に達したことを確認
- P0（Prismaカバレッジ向上）が完了したため、P1（認証）を最優先に再定義
- P1（認証）の実装範囲を簡素化（詳細すぎる実装タスクを削除）
**現在のフェーズ**: 機能実装フェーズ。認証・認可機能を実装し、その後に本番デプロイ準備へ。
