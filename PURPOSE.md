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

### P1: 開発品質維持（維持フェーズ）

コードベースは本番デプロイ可能な品質を維持しています。

**最新の品質メトリクス**:
- **テスト**: 1031/1031 passing (136 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings（FlatConfig移転済み、circular reference解消済み）
- **アーキテクチャ**: Clean Architecture完全準拠
- **セキュリティ**: Next.js 16.1.7

**直近の重要な修正**:
- Clean Architecture layer separation違反の修正（2026-03-17）
  - Client ComponentsからDomain層への直接importを禁止
  - cross-cutting schemas層（@/schemas/api）経由に変更
  - SYSTEM_CONSTITUTION.mdの依存方向ルールを完全準拠

**品質維持タスク（監視パターン）**:
- Clean Architecture依存方向違反の是正
  - ❌ Client ComponentsからDomain/Infrastructure層への直接import
  - ❌ Domain層からPrisma/Next.jsのimport
  - ✅ cross-cutting schemas層（@/schemas/api）経由で型共有
- 新機能追加時のテスト・カバレッジ維持
- ESLint/TypeScriptエラーの即時修正
- 重要な脆弱性の速やかなアップデート

**次に監視すべき違反パターン**:
```bash
# Client ComponentsからのDomain直接importを検出
grep -r "from '@/domain/" src/app --include="*.tsx" | grep -v "'use client'" | grep -v "test"
```

### P2: 本番デプロイ実行（人間作業待ち）

**コードベースはデプロイ準備完了**。以下のインフラ設定は人間による作業が必要です。

**必要な作業**:
1. **Vercelプロジェクト作成**:
   - リポジトリ: `https://github.com/nobu007/yka_ikiiki_record`
   - `vercel.json` は準備済み

2. **PostgreSQLデータベース構築**（いずれかを選択）:
   - Vercel Postgres（推奨・Vercelと統合）
   - Supabase（外部PostgreSQL）
   - Neon（サーバーレスPostgreSQL）

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

**注意**: AIエージェントはこのタスクを実行できません。インフラ設定には人間の作業が必要です。

### P3: 運用開始後の改善

P2完了後、実際の使用に基づいて以下を検討：

- 認証・認可システム（教師/生徒/保護者ロール）
- 複数クラス対応
- データエクスポート機能（CSV/JSON）
- 詳細な分析レポート
- E2Eテストスイートの本番環境実行

## 完了の定義

### P1完了条件

- テスト成功率: 100%
- カバレッジ: statements ≥ 95%, branches ≥ 90%, functions ≥ 95%, lines ≥ 95%
- TypeScript strict mode: 完全準拠
- ESLint: zero warnings

**現在の状態**: すべての条件を満たしています。

### P2完了条件

- Vercelプロジェクトが公開URLでアクセス可能
- PostgreSQLデータベースが稼働
- 本番URLで基本機能が正常動作

**現在の状態**: デプロイ準備完了。人間によるインフラ設定が必要です。

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
3. **品質メトリクス変化時**: P1の状態が大きく変わった場合に更新（例: カバレッジが95%を下回る、テスト失敗が発生するなど）
4. **重要なコード変更時**: アーキテクチャ違反修正や重要なリファクタリング実施時

**23系実行ポリシー（自己防止メカニズム付き）**:

> **重要**: 23系は「PURPOSE.mdの再構成」であり、docs-onlyコミットを生成します。過剰実行は無意味であり、リポジトリの実態から乖離した自己満足的な文書操作になります。

### 実行前の必須チェックリスト（23系エージェント向け）

23系を実行する前に、以下の**全て**の条件を確認してください：

- [ ] **直近10件のコミットにコード変更が含まれるか？**
  - fix:/refactor:/feat: コミットが1件以上あるか？
  - あるいは、システム/テスト/設定ファイルの変更があるか？
  - ❌ **docs-onlyコミットのみの場合は23系実行を禁止**

- [ ] **コード変更がPURPOSE.mdの優先順位に影響を与えるか？**
  - P1（品質維持）の状態が変わったか？
  - P2（デプロイ）の完了条件が変わったか？
  - P3（運用改善）に移行する準備ができたか？
  - ❌ **優先順位に影響がない場合は23系実行を禁止**

- [ ] **品質メトリクスに重大な変化があるか？**
  - テストが失敗しているか？
  - カバレッジが95%を下回ったか？
  - ESLint/TypeScriptエラーが発生しているか？
  - ❌ **品質メトリクスが安定している場合は23系実行を禁止**

- [ ] **前回の23系実行から1ヶ月以上経過しているか？**
  - ❌ **1ヶ月未満の場合は23系実行を禁止（ただし上記3項目のいずれかがtrueの場合を除く）**

### 実行禁止パターン（絶対遵守）

以下のいずれかに該当する場合、**23系実行を禁止**します：

1. **docs-onlyループ**: 直近10件の大半がdocs:コミットの場合
2. **実態変化なし**: コードベースの実質的な変更がない場合
3. **自己満足**: 「23系を実行すること自体」が目的になっている場合
4. **頻繁すぎる**: 前回の23系から1週間未満の場合

### 実行頻度の目安

- **理想**: 月0回〜1回（コード実態が変わった場合のみ）
- **最大**: 月2回（重要なリファクタリングや品質変化があった場合）
- **現状**: 2026-03-17〜2026-03-18の間に7回実行済み（**過剰**）

### 23系エージェントへの指示

1. **上記チェックリストを厳格に適用**: 全ての項目がtrueの場合のみ23系を実行
2. **docs-onlyループの検出**: 直近10件のコミットがdocs-onlyの場合、直ちに中止
3. **自己批判的判断**: 「更新が必要か？」を自問し、NOの場合は中止

---

**最終更新**: 2026-03-18

**現在の焦点**: P2（本番デプロイ）は人間によるインフラ設定待ち。コードベースはデプロイ準備完了。

**23系実行の現状**: 直近で過剰実行が発生（7回/2日）。次回実行は2026-04-18以降を目安とする。

**AIエージェントへ**:
- **P1品質維持タスクは随時実行可**: アーキテクチャ違反の是正、テスト追加、ESLint修正、TypeScriptエラー修正などは、必要に応じて実行して構いません
- **新機能開発は不要**: P2完了（本番デプロイ）まで、新機能の追加は控えてください
- **23系実行の判断**: 上記「23系実行ポリシー」のチェックリストを厳格に適用してください。docs-onlyループに陥らないよう警戒してください
