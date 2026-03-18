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

### P1: 開発品質維持（継続的監視対象）

本番デプロイ可能な品質基準を維持し、Clean Architecture違反を継続的に監視・修正します。

**品質メトリクス**:
- **テスト**: 1031/1031 passing (136 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings

**最近の修正（2026-03-17）**:
- Clean Architecture違反を修正: Client ComponentsからのDomain直接importを、cross-cutting層（schemas/api.ts）経由に変更
- 違反検出コマンド:
  ```bash
  grep -r "from '@/domain/" src/app --include="*.tsx" | grep -v "'use client'" | grep -v "test"
  ```

**継続的監視**:
- Architecture違反は発見次第即座に修正
- 新機能追加時はClean Architectureルールを厳格適用
- テストカバレッジ95%以上を維持

### P2: 本番デプロイ実行（人間作業待ち）

コードベースはデプロイ準備完了。以下のインフラ設定には人間による作業が必要です。

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
- **Application層**: Domain + Infrastructureを使用
- **Presentation層**: Application層（API経由）と通信

**重要な制約**:
- ❌ Client Componentsから直接Domain/Infrastructureをimportしない
- ❌ Domain層からPrisma/Next.jsをimportしない
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

この文書は以下の場合に更新します：

1. **P2完了時**: 本番デプロイ完了後、P3（運用改善）へ移行
2. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
3. **プロジェクトの方向性転換時**: 目標や優先順位の大幅な変更がある場合

**23系実行頻度の抑制（厳格適用）**:

以下の**全て**の条件を満たす場合のみ23系を実行してください：

1. **直近にコード変更がある**: `docs:` コミットではなく、`fix:`, `refactor:`, `feat:`, `test:` 等の実質的コード変更がある
2. **プロジェクト方向性に変更がある**: P1→P2への移行、アーキテクチャ変更、新規方針の導入など
3. **少なくとも1ヶ月経過している**: 前回の23系実行から1ヶ月以上経過している（P2完了時は例外）

**禁止事項**:
- ❌ docs-only コミットが続いている状況での23系実行
- ❌ 品質メトリクスの微小変化（±1%以内）だけでの実行
- ❌ 見た目の改善や文言の整理だけでの実行
- ❌ 週1回以上の頻度での実行（P2完了時を除く）

**現在の状況**: 直近10件中9件がdocs-only再構成となっており、23系が過剰に実行されています。この状況是正のため、より厳格な基準を適用してください。

---

**最終更新**: 2026-03-18 (23系過剰実行防止のための実行ポリシー厳格化)

**現在の焦点**: P2（本番デプロイ）は人間によるインフラ設定待ち。コードベースはデプロイ準備完了。

**AIエージェントへ**:
- **P1品質維持タスクは随時実行可**: アーキテクチャ違反の是正、テスト追加、ESLint修正、TypeScriptエラー修正などは、必要に応じて実行して構いません
- **新機能開発は不要**: P2完了（本番デプロイ）まで、新機能の追加は控えてください
- **23系実行は厳禁**: 以下の場合はPURPOSE.mdの再構成を実行しないでください：
  - 直近10件のコミットの大半が `docs:` である場合
  - コード実態に変更がない場合
  - 前回の23系実行から1ヶ月経過していない場合（P2完了時を除く）
  - 品質メトリクスが±1%以内の変動の場合

**23系実行前の必須チェックリスト**:
- [ ] 直近10件中、5件以上がコード変更コミットか？（`docs:` 以外）
- [ ] 前回の23系実行から1ヶ月以上経過しているか？
- [ ] プロジェクトの方向性に実質的な変更があるか？
- [ ] この23系実行が過剰実行にならないか、自己確認したか？

上記のいずれかでもNOの場合、23系実行を見送ってください。
