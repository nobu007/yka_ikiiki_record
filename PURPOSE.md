# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 開発品質維持（完了）

本番デプロイ可能な品質基準を維持し、Clean Architecture違反を継続的に監視・修正します。

**品質メトリクス**:
- **テスト**: 1031/1031 passing (136 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings
- **Clean Architecture**: 違反0件

**完了条件**:
- テスト成功率: 100% ✓
- カバレッジ: statements ≥ 95%, branches ≥ 90%, functions ≥ 95%, lines ≥ 95% ✓
- TypeScript strict mode: 完全準拠 ✓
- ESLint: zero warnings ✓

**継続的監視**:
- Architecture違反は発見次第即座に修正
- 新機能追加時はClean Architectureルールを厳格適用
- テストカバレッジ95%以上を維持

### P2: 本番デプロイ実行（次のステップ）

コードベースはデプロイ準備完了。以下のインフラ設定を実行します。

**必要な作業**:
1. **Vercelプロジェクト作成**:
   - リポジトリ: `https://github.com/nobu007/yka_ikiiki_record`
   - `vercel.json` は準備済み

2. **PostgreSQLデータベース構築**（いずれかを選択）:
   - Vercel Postgres（推奨）
   - Supabase
   - Neon

3. **環境変数設定**:
   ```bash
   DATABASE_URL=<PostgreSQL接続文字列>
   DATABASE_PROVIDER=prisma
   ```

4. **デプロイ実行**:
   ```bash
   vercel link
   vercel env add DATABASE_URL production
   vercel env add DATABASE_PROVIDER production
   vercel --prod
   ```

**完了条件**:
- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] 環境変数設定
- [ ] 本番デプロイ実行
- [ ] 本番URLで基本動作確認

### P3: 運用開始後の改善

P2完了後、実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

## 技術方針

### Clean Architecture in Next.js App Router

**依存方向のルール**:
- **Domain層**: 他の層に依存しない（純粋なビジネスロジック）
- **Infrastructure層**: Domain層のインターフェースを実装
- **Application層**: Domain + Infrastructureを使用
- **Presentation層**: Application層（API経由）と通信

**重要な制約**:
- ❌ Client Componentsから直接Domain/Infrastructureをimportしない
- ❌ Domain層からPrisma/Next.jsをimportしない
- ✅ 共有型はcross-cutting層（schemas）で定義し、全レイヤーからimport可能

**違反検出コマンド**:
```bash
grep -r "from '@/domain/" src/app --include="*.tsx" | grep -v "'use client'" | grep -v "test"
```

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

この文書は以下の場合に更新します：

1. **P2完了時**: 本番デプロイ完了後、P3（運用改善）へ移行
2. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
3. **プロジェクトの方向性転換時**: 目標や優先順位の大幅な変更がある場合
