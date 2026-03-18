# PURPOSE — 到達目標と次の一手

## 北極星

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する革新的な教育インフラを構築する。

## 目指す完成状態

本番環境でVercel + PostgreSQLが稼働し、教育現場で実際に使用できる状態：

1. **公開URL**: Vercelでデプロイされ、誰でもアクセス可能
2. **データ永続化**: PostgreSQLで生徒の記録が保存される
3. **自律的耐久性**: 故障から自動回復し、無限ループを防止する耐性を持つ
4. **自律的品質監視**: `meta_checker.py` による継続的な品質メトリクス追跡

## 直近の優先成果

### P1: 本番デプロイ実行（ブロッキング課題）

**現在の状態**: デプロイ準備完了。実行のみ。

**完了準備** (全て達成済み):
- ✅ Clean Architecture実装完了 (4層分離、依存方向ルール準拠)
- ✅ 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6)
  - src/lib/resilience/: 1569行、タイムアウト/サーキットブレーカー/ループ検出/メモリ監視/構造化ロギング
- ✅ 自律的品質監視システム実装完了
  - scripts/meta_checker.py: JudgmentScore監視、Clean Architecture遵守チェック、テストカバレッジ追跡
- ✅ Vercel設定ファイル準備完了 (vercel.json)
- ✅ デプロイスクリプト準備完了

**次のアクション** (実行者: Human Operator):

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

**完了後の次ステップ**: P2へ移行

---

### P2: 自律的品質監視ループの確立（P1完了後に開始）

**目的**: meta_checker.pyによる継続的品質監視と改善提案の自動化

**現在の品質メトリクス** (2026-03-18):
- **JudgmentScore**: 100/100 (SYSTEM HEALTHY)
- **テスト**: 1189/1189 passing (146 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches, 94.57% functions, 98.62% lines
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings
- **Clean Architecture**: 違反0件

**品質基準** (SYSTEM_CONSTITUTION.md準拠):
- テスト成功率: 100%
- カバレッジ: statements ≥ 95%, branches ≥ 90%, functions ≥ 95%, lines ≥ 95%
- TypeScript strict mode: 完全準拠 (any型0件)
- ESLint: zero warnings
- Clean Architecture: 違反0件

**監視方法**:

```bash
# 手動実行（品質確認時）
python scripts/meta_checker.py

# 出力ファイル:
# - data/meta_report.md: ヒューマンリーダブル監査レポート
# - data/judgment_metrics.csv: 時系列メトリクス（Guardian監視用）
```

**推奨実行タイミング**:
- 各機能実装完了後
- デプロイ前後
- 定期的な品質確認時に手動実行
- CI/CDパイプラインへの組み込み検討

**改善アクション**:
- JudgmentScore < 100: meta_report.mdの推奨事項を確認し、修正実施
- テスト失敗: テストログを確認し、失敗原因を特定・修正
- カバレッジ低下: カバレッジレポートを確認し、テスト追加
- Clean Architecture違反: 依存方向を修正

---

### P3: 運用開始後の機能改善（P2定着後に検討）

**前提**: P1完了かつP2が定着した後、実際の使用状況に基づいて優先順位を再決定

**検討事項** (順不同):
- 認証・認可システム（教師/生徒/保護者ロール分離）
- 複数クラス対応（データの分離と管理）
- データエクスポート機能（CSV/JSON/PDF）
- 詳細な分析レポート（時系列推移、相関分析）
- E2Eテストスイートの本番環境実行
- パフォーマンス最適化（バンドルサイズ、ロード時間）
- モバイル対応最適化

**注意**: P3はP1完了後に具体化します。現在は検討リストのみとします。

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

この文書は以下の場合に更新します：

1. **P1完了時**: 本番URL発行後、完了条件を全てチェック済みに変更
2. **P2開始時**: meta_checker.pyの運用フローが確立したら詳細を追記
3. **P3具体化時**: P1完了後、実際の使用状況に基づいて優先順位を具体化
4. **品質基準変更時**: カバレッジ基準やテスト基準が変更された場合
5. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時

**更新禁止事項**:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ P1完了前にP3の具体化
- ❌ 技術方針の根本的変更なしでの長文化
