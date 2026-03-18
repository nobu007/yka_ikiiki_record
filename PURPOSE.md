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

## 現在の状況 (2026-03-19)

### 技術的準備状態: **完了**

すべての技術的実装が完了しており、本番デプロイの準備が整っています：

**実装済みコンポーネント**:
- ✅ Clean Architecture実装完了 (4層分離、依存方向ルール準拠、違反0件)
- ✅ 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6)
  - src/lib/resilience/: 1569行、5コンポーネント完全実装
  - timeout enforcement, circuit-breaker, loop-detector, memory-monitor, structured-logger
- ✅ 自律的品質監視システム実装・改良完了 (2026-03-19)
  - scripts/meta_checker.py: JudgmentScore監視、全項目チェック自動化
  - coverage-final.json対応: Jestデフォルト出力形式のパースを実装
  - data/meta_report.md: 人間可読監査レポート
  - data/judgment_metrics.csv: 時系列メトリクス（Guardian監視用）
- ✅ Vercel設定ファイル準備完了 (vercel.json, package.json scripts)

**品質メトリクス** (2026-03-19時点):
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
2. **コードに実質的な変更があった場合**: 新機能実装、重大なバグ修正、監視システム改良など
3. **品質基準変更時**: SYSTEM_CONSTITUTION.md の品質基準が変更された場合
4. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時

**更新禁止事項**:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ ドキュメントのみの変更（docs-only コミット）への反応
- ❌ 技術的状態に変更がない場合の形式的な更新
- ❌ デプロイ完了前の新機能開発やリファクタリングの追加

**23系ループ実行時の判断基準**:
- ✅ **更新 OK**: 直近10コミットでコードに実質的な変更がある（meta_checker.py改良、新機能実装、バグ修正など）
- ❌ **更新 NG**: docs-only コミットが連続している、技術的状態に変更なし
