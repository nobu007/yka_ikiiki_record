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

### 技術的実装状態: **本番稼働可能 (Production-Ready)**

すべての技術的実装が完了しており、いつでも本番デプロイ可能な状態です。

**品質メトリクス** (2026-03-19時点):
- JudgmentScore: 100/100 (SYSTEM HEALTHY)
- テスト成功率: 100% (1206/1206 passing)
- カバレッジ: 98.85% statements, 95.02% branches, 100% functions, 98.85% lines
- TypeScript: strict mode 完全準拠、any型0件
- ESLint: zero warnings
- Clean Architecture: 違反0件

**実装済みコンポーネント**:
- Clean Architecture実装完了 (4層分離、依存方向ルール準拠)
- 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6)
  - timeout enforcement, circuit-breaker, loop-detector, memory-monitor, structured-logger
  - LoopDetector: 適切なtimer cleanup実装済み（Jest hang問題解決済み）
- 自律的品質監視システム実装完了 (meta_checker.py + judgment_metrics.csv)
- Vercel設定ファイル準備完了

## 直近の優先成果

### P1: 本番デプロイの実行（Human Operatorの作業待ち）

**技術的にはデプロイ可能**ですが、実際のデプロイ実行にはHuman Operatorによる以下の手順が必要です：

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

**デプロイ完了後の検証**:
- [ ] 本番URLで `GET /api/seed` が200応答
- [ ] 本番URLで `GET /api/stats` がJSON応答
- [ ] 本番URLでアプリケーションが正常に表示される

### P2: デプロイ後の機能改善ロードマップ

デプロイ完了後、実際の使用状況に基づいて優先順位を再決定します：

**優先度1: 基盤機能**
- 認証・認可システム（教員アカウント管理）
- 複数クラス対応（複数学級のデータ管理）
- データエクスポート機能（CSV/Excel出力）

**優先度2: 分析・可視化の強化**
- 詳細な分析レポート（個人・クラス単位の長期トレンド）
- パフォーマンス最適化（大量データ時の表示速度改善）
- モバイル対応最適化（タブレットでの利用支援）

**優先度3: 運用改善**
- バックアップ・復元システム
- 監査ログ機能
- 通知システム（異常値検知時のアラート）

### P3: 日常運用タスク

**品質メトリクスの維持**（自動実行されています）:
```bash
# 品質チェック実行
python scripts/meta_checker.py

# カバレッジ詳細確認
npm run test:coverage -- --runInBand

# 監査レポート確認
cat data/meta_report.md
```

**目標**: JudgmentScore 100/100を維持し続ける

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
- **loop-detector**: 無限ループ検出、時間ベースカウンタリセット、適切なtimer cleanup（Jest hang問題解決済み）
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

1. **23系ループ実行時**: 23_purpose_reconstitution_loop.md SOPに従い、直近10件のコミットと現行コード実態に基づいてPURPOSE.mdを完全刷新する
2. **デプロイ完了時**: 本番URL発行後、P1/P2/P3の優先順位を実際の運用状況に基づいて再調整
3. **コードに実質的な変更があった場合**: 新機能実装、重大なバグ修正、監視システム改良など
4. **品質基準変更時**: SYSTEM_CONSTITUTION.md の品質基準が変更された場合
5. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
6. **品質メトリクスの変化時**: JudgmentScoreが100を下回った場合、または重要な品質目標を達成した場合

**23系ループの目的**:
- 23系ループは「**次に何を終わらせるべきかが一目で分かる未来志向の文書**」を維持するための定期実行プロセス
- 直近の実態から未来の優先順位を言語化し直すことを目的とする
- 技術的状態が安定しているかどうかにかかわらず、23系ループは定期的に実行されるべき運用プロセスである

**更新時の品質ガードレール**:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ ドキュメントのみの変更（docs-only コミット）への形式的な反応
- ❌ 品質メトリクスの安定時における数値の再列挙のみ
- ✅ コード変更の実態を調査し、優先順位に反映すること
- ✅ 未来のアクションプランを明確にすること
