# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## この文書の役割

この文書は「過去の達成履歴」ではなく、「次に何を終わらせるべきか」を明示するためのものです。AIエージェントが自律的に判断し実行するための、現在の優先順位の単一情報源（SSOT）として機能します。

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **自律的耐久性**: 故障から自動回復し、無限ループを防止する耐性を持つ
4. **自律的品質監視**: `meta_checker.py` による継続的な品質メトリクス追跡

## 現在の状況 (2026-03-18)

### 技術的準備状態: **完了**

すべての技術的実装が完了しており、本番デプロイの準備が整っています：

**実装済みコンポーネント**:
- ✅ Clean Architecture実装完了 (4層分離、依存方向ルール準拠、違反0件)
- ✅ 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6)
  - src/lib/resilience/: 1569行、5コンポーネント完全実装
  - timeout enforcement, circuit-breaker, loop-detector, memory-monitor, structured-logger
- ✅ 自律的品質監視システム実装完了 (2026-03-18)
  - scripts/meta_checker.py: JudgmentScore監視、全項目チェック自動化
  - data/meta_report.md: 人間可読監査レポート
  - data/judgment_metrics.csv: 時系列メトリクス（Guardian監視用）
- ✅ Vercel設定ファイル準備完了 (vercel.json, package.json scripts)

**品質メトリクス** (2026-03-18時点):
- JudgmentScore: 100/100 (SYSTEM HEALTHY)
- テスト成功率: 100% (1189/1189 passing)
- カバレッジ: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- TypeScript: strict mode 完全準拠、any型0件
- ESLint: zero warnings
- Clean Architecture: 違反0件

### 現在のブロッカー: **Human Operatorのデプロイ意思決定**

技術的には本番デプロイ可能ですが、実際のデプロイ実行にはHuman Operatorによる以下の判断が必要です：

**Human Operator専任タスク**:

```bash
# 1. Vercelプロジェクト作成
vercel link

# 2. PostgreSQLデータベース構築（いずれかを選択）
#    - Vercel Postgres (推奨): Vercel Dashboard → Storage → Create Database → Postgres
#    - Supabase: https://supabase.com → New Project
#    - Neon: https://neon.tech → Create Project

# 3. 環境変数設定
vercel env add DATABASE_URL production
vercel env add DATABASE_PROVIDER production
# (値: "prisma")

# 4. デプロイ実行
./scripts/deploy-production.sh
```

**完了条件**:
- [ ] Vercelプロジェクト作成完了、本番URL発行
- [ ] PostgreSQLデータベース構築完了
- [ ] 環境変数設定完了 (DATABASE_URL, DATABASE_PROVIDER=prisma)
- [ ] `./scripts/deploy-production.sh` 実行完了
- [ ] 本番URLで `GET /api/seed` が200応答
- [ ] 本番URLで `GET /api/stats` がJSON応答

## 直近の優先成果

### 現在のフェーズ: デプロイ待機中

**AIエージェントの許可されるアクション**（デプロイ完了まで）:

1. **品質監視**: `python scripts/meta_checker.py` を定期的に実行し、JudgmentScoreが100を維持していることを確認
2. **バグ修正**: テストが失敗した場合、またはカバレッジが基準を下回った場合のみ修正を実行
3. **ドキュメント更新**: 技術方針の根本変更が必要な場合のみ更新

**AIエージェントの禁止事項**（デプロイ完了まで）:

- ❌ 新機能の開発
- ❌ リファクタリング（現在はすべての品質メトリクスが満たされているため）
- ❌ 23系ループによるドキュメントのみの反復更新（docs偏重アンチパターン）

**理由**: すべての技術的準備が完了しており、品質メトリクスも全て満たされています。これ以上の自動改善は「完了詐称」または「docs偏重」に陥るリスクがあります。

### デプロイ完了後の次フェーズ

デプロイが完了し、本番URLでアプリケーションが稼働し始めたら、以下のアクションに移行します：

**P1: 本番運用開始後の品質維持**

- `meta_checker.py` を定期的に実行し、品質メトリクスを監視
- JudgmentScore < 100の場合、meta_report.mdの推奨事項に従って修正実施
- 本番環境での障害対応

**P2: 機能改善**（P1定着後、実際の使用状況に基づいて優先順位を再決定）
- 認証・認可システム
- 複数クラス対応
- データエクスポート機能
- 詳細な分析レポート
- パフォーマンス最適化
- モバイル対応最適化

## 技術方針

### Clean Architecture in Next.js App Router

**依存方向のルール** (厳格適用):
```
Domain → Application → Infrastructure → Presentation
```

| レイヤー | 場所 | 依存許可 | 禁止事項 |
|---------|------|----------|----------|
| Domain | `src/domain/` | なし | 他レイヤーからのimport禁止 |
| Application | `src/application/` | Domainのみ | Infrastructure/Presentationからのimport禁止 |
| Infrastructure | `src/infrastructure/` | Domain + Application | Presentationからのimport禁止 |
| Presentation | `src/app/`, `src/components/` | 全レイヤー | - |
| Cross-cutting | `src/lib/`, `src/schemas/`, `src/utils/` | 全レイヤーからimport可 | - |

**重要な制約**:
- ❌ Client Componentsから直接Domain/Infrastructureをimportしない
- ❌ Domain層からPrisma/Next.jsをimportしない
- ✅ 共有型はschemas/cross-cutting層で定義し、全レイヤーからimport可能

### 自律的耐久性プロトコル (SYSTEM_CONSTITUTION.md §6)

**実装済みコンポーネント**:
- **timeout enforcement**: withApiTimeout, withDatabaseTimeout, withCommandTimeout, withFileTimeout, withE2ETimeout
- **circuit-breaker pattern**: カスケーディング故障防止、自動状態遷移 (CLOSED → OPEN → HALF_OPEN)
- **loop-detector**: 無限ループ検出、時間ベースカウンタリセット
- **memory-monitor**: メモリリーク検出、GCトリガー
- **structured-logger**: 自動圧縮付き構造化ロギング、可視性フィルタリング

**使用方法**:
```typescript
import { withApiTimeout, globalCircuitBreaker } from '@/lib/resilience';

// API呼び出しは必ずタイムアウト付きで
const result = await withApiTimeout(
  fetch('https://api.example.com'),
  10000
);

// サーキットブレーカーで保護
await globalCircuitBreaker.execute(
  async () => riskyOperation(),
  { failureThreshold: 3, resetTimeout: 5000, monitoringPeriod: 30000 }
);
```

### Repository Factoryパターン

環境依存の中央管理により、開発環境と本番環境でデータソースを切り替えます：

```typescript
// 開発環境 (DATABASE_PROVIDER=mirage)
const repository = new MockStatsRepository(); // インメモリ

// 本番環境 (DATABASE_PROVIDER=prisma)
const repository = new PrismaRecordRepository(prisma); // PostgreSQL
```

## 更新ルール

この文書は以下の場合にのみ更新します：

1. **デプロイ完了時**: 本番URL発行後、"現在のフェーズ" を「本番運用中」に変更
2. **品質基準変更時**: SYSTEM_CONSTITUTION.md の品質基準が変更された場合
3. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
4. **コードに実質的な変更があった場合のみ**: 23系ループ実行時、直近10コミットでコードに実質的な変更があり、かつ docs-only 更新の連続がない場合

**更新禁止事項**（23系ループのアンチパターン）:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ デプロイ完了前の新機能開発やリファクタリングの追加
- ❌ 技術方針の根本的変更なしでの長文化
- ❌ コード実態との乖離があるドキュメントのみの反復更新
- ❌ **docs-only コミットが5件以上連続している場合の更なる更新（docs偏重アンチパターン）**

**23系ループ実行時の注意**: 本文書の「23系ループのスキップ基準」セクションを必ず確認し、スキップ条件を満たしている場合は更新をSkipしてください。

## 23系ループのスキップ基準

**現在の状態 (2026-03-18)**: 23系ループによる更新は **SKIP してください**。

### スキップ判定の根拠:

直近10コミットの分析:
- **コード変更**: 3件 (meta_checker.py 実装、TypeScript strict mode 修正、エクスポート修正)
- **ドキュメント変更**: 7件 (連続する docs-only 更新)
- **最新5件**: 全て docs-only 更新（docs偏重アンチパターンの典型）
- **技術的状態**: 変更なし（JudgmentScore 100/100維持）
- **PURPOSE.md**: 既に現在のフェーズと優先順位を正しく記述

### 23系ループ実行時のスキップ条件:

以下の条件を**いずれか**満たす場合は、更新をSkipすること：

1. **直近10コミットのうち、コードに実質的な変更があったコミットが3件以下** で、かつ docs-only コミットが5件以上連続している
2. 現在のフェーズが「デプロイ待機中」または「本番運用中」
3. JudgmentScoreが100/100を維持している
4. PURPOSE.mdが既に現在のフェーズと優先順位を正しく記述している

### 一般的なスキップ判断基準:

- ✅ **Skip OK**: docs-only コミットが5件以上連続、技術的状態に変更なし、PURPOSE.mdが既に正確
- ❌ **Skip NG**: 新機能実装、重大なバグ修正、アーキテクチャ変更、フェーズ遷移があった

**重要**: 23系ループによるPURPOSE.md更新は、直近10コミットで**コードに実質的な変更があり、かつ docs-only 更新の連続がない場合のみ**実行すること。
