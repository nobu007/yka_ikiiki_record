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

## 直近の優先成果

### P1: 開発品質維持（完了・維持フェーズ）

コードベースは本番デプロイ可能な品質を維持しています。品質メトリクス：

- **テスト**: 1031/1031 passing (136 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings（FlatConfig移転済み、circular reference解消済み）
- **アーキテクチャ**: Clean Architecture完全準拠（Client Componentsの直接Domain import違反を修正 2026-03-17）、全テストファイル300行以下（INV-ARCH-001達成）
- **セキュリティ**: Next.js 16.1.7（高深刻な脆弱性修正済み）

**品質維持タスク**（新機能開発時のみ実行）:
- 新機能追加時のテスト・カバレッジ維持
- ESLint/TypeScriptエラーの即時修正
- 重要な脆弱性の速やかなアップデート

**完了状態**: P1のすべての完了条件を満たしています。継続的な維持のみが必要です。

### P2: 本番デプロイ実行（現在の焦点）

**コードベースはデプロイ準備完了**。以下のインフラ設定のみが必要です。

**決定事項**:
1. **デプロイ先**: Vercel（プロジェクト未作成、`vercel.json` は準備済み）
   - リポジトリ: `https://github.com/nobu007/yka_ikiiki_record`

2. **データベース選択**（いずれかを選択）:
   - Vercel Postgres（推奨・Vercelと統合）
   - Supabase（外部PostgreSQL）
   - Neon（サーバーレスPostgreSQL）

3. **環境変数設定**:
   - `DATABASE_URL`: PostgreSQL接続文字列
   - `DATABASE_PROVIDER`: "prisma"

**デプロイ手順**:
```bash
# 1. Vercelプロジェクト作成
vercel link

# 2. PostgreSQLデータベース構築
# （選択したプロバイダーのコンソールで実行）

# 3. 環境変数設定
vercel env add DATABASE_URL production
vercel env add DATABASE_PROVIDER production

# 4. 本番デプロイ
vercel --prod

# 5. 本番URLで動作確認
```

**完了条件**:
- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] DATABASE_URL環境変数設定
- [ ] 本番デプロイ実行
- [ ] 本番URLで基本動作確認（Landingページ、Dashboard表示、データ生成）

### P3: 運用開始後の改善

P2完了後、実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

## 完了の定義

### P1完了条件

- テスト成功率: 100%（1031/1031）
- カバレッジ: statements ≥ 95%, branches ≥ 90%, functions ≥ 95%, lines ≥ 95%
- TypeScript strict mode: 完全準拠（any型0件）
- ESLint: zero warnings
- INV-ARCH-001: 全テストファイル300行以下

**現在の状態**: すべての条件を満たしています。継続的な維持が必要です。

### P2完了条件

- Vercelプロジェクトが公開URLでアクセス可能
- PostgreSQLデータベースが稼働し、データ永続化が機能
- 本番URLでLandingページ、Dashboard、データ生成機能が正常動作
- デプロイ手順がドキュメント化され、再現可能

**現在の状態**: デプロイ準備完了。データベースプロバイダーの選択と設定が必要です。

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
2. **新機能開発時**: P3移行後、新しい開発タスクが発生した場合に更新

---

**最終更新**: 2026-03-17

**現在の焦点**: P2（本番デプロイ）の実施。コードベースはデプロイ準備完了。技術的負債なし。

**🛑 AGENT NOTICE**: P2 requires human infrastructure setup (Vercel project creation, database configuration). No automated code changes are needed. DO NOT update this document until P2 is complete.
