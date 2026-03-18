# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **自律的耐久性**: 故障から自動回復し、無限ループを防止する耐性を持つ
4. **品質維持**: すべてのテストがパスし、カバレッジ95%以上を維持

## 直近の優先成果

### P1: 本番デプロイ実行（次のアクション）

コードベースはデプロイ準備完了。自律的耐久性インフラも実装済み。以下のデプロイ手順を実行します。

**必要な作業**:
1. **Vercelプロジェクト作成**:
   - リポジトリ: `https://github.com/nobu007/yka_ikiiki_record`
   - `vercel.json` は準備済み
   - コマンド: `vercel link`

2. **PostgreSQLデータベース構築**（いずれかを選択）:
   - Vercel Postgres（推奨）
   - Supabase
   - Neon

3. **環境変数設定**:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add DATABASE_PROVIDER production
   ```

4. **デプロイ実行**:
   ```bash
   ./scripts/deploy-production.sh
   # または手動で:
   vercel --prod
   ```

**完了条件**:
- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] 環境変数設定（DATABASE_URL, DATABASE_PROVIDER）
- [ ] 本番デプロイ実行
- [ ] 本番URLで基本動作確認（/api/seed, /api/stats）

### P2: 開発品質維持（継続タスク）

Clean Architecture違反を継続的に監視・修正し、本番デプロイ可能な品質基準を維持します。

**現在の品質メトリクス**:
- **テスト**: 1191/1191 passing (146 suites)
- **カバレッジ**: 98.65% statements, 95.15% branches, 95.80% functions, 98.72% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: 1件の未使用importを修正予定
- **Clean Architecture**: 違反0件
- **自律的耐久性**: timeout, circuit-breaker, loop-detector, memory-monitor, structured-logger 実装済み (1569行)

**品質基準**:
- テスト成功率: 100%
- カバレッジ: statements ≥ 95%, branches ≥ 90%, functions ≥ 95%, lines ≥ 95%
- TypeScript strict mode: 完全準拠
- ESLint: zero warnings

**監視方法**:
```bash
# Clean Architecture違反検出
grep -r "from '@/domain/" src/app --include="*.tsx" | grep -v "'use client'" | grep -v "test"

# テスト実行
npm test -- --runInBand

# カバレッジ確認
npm run test:coverage -- --runInBand

# Lint実行
npm run lint
```

### P3: 運用開始後の改善

P1完了後、実際の使用に基づいて以下を検討：

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

環境依存の中央管理により、開発環境と本番環境でデータソースを切り替えます：

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

## 完了の定義

**P1完了条件**:
- [x] コードベースがデプロイ準備完了状態
- [x] 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6準拠)
- [ ] Vercelプロジェクトが作成され、本番URLが発行されている
- [ ] PostgreSQLデータベースが構築されている
- [ ] 環境変数（DATABASE_URL, DATABASE_PROVIDER）が設定されている
- [ ] 本番デプロイが実行されている
- [ ] 本番URLで/api/seedと/api/statsが動作している

**P2継続条件**:
- 全テストがパスし続けている
- カバレッジが基準値を満たし続けている
- Clean Architecture違反が検出されたら即座に修正されている

## 更新ルール

この文書は以下の場合に更新します：

1. **P1完了時**: 本番デプロイ完了後、P3（運用改善）へ移行
2. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
3. **プロジェクトの方向性転換時**: 目標や優先順位の大幅な変更がある場合
