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
- テスト成功率: 100% (1202/1202 passing)
- カバレッジ: 98.84% statements, 95.02% branches, 95.58% functions, 98.84% lines
- TypeScript: strict mode 完全準拠、any型0件
- ESLint: zero warnings
- Clean Architecture: 違反0件

**実装済みコンポーネント**:
- Clean Architecture実装完了 (4層分離、依存方向ルール準拠)
- 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6)
- 自律的品質監視システム実装完了 (meta_checker.py + judgment_metrics.csv)
- Vercel設定ファイル準備完了

## 直近の優先成果

### P1: 本番デプロイの実行

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

### P2: 品質メトリクスの維持

**現在の品質監視方法**:
```bash
# 品質チェック実行
python scripts/meta_checker.py

# カバレッジ詳細確認
npm run test:coverage -- --runInBand

# 監査レポート確認
cat data/meta_report.md
```

**目標**: JudgmentScore 100/100を維持し続ける

### P3: 次フェーズの機能改善（デプロイ後）

デプロイ完了後、実際の使用状況に基づいて優先順位を再決定します：

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

1. **デプロイ完了時**: 本番URL発行後、P1/P2/P3の優先順位を実際の運用状況に基づいて再調整
2. **コードに実質的な変更があった場合**: 新機能実装、重大なバグ修正、監視システム改良など
3. **品質基準変更時**: SYSTEM_CONSTITUTION.md の品質基準が変更された場合
4. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
5. **品質メトリクスの変化時**: JudgmentScoreが100を下回った場合、または重要な品質目標を達成した場合

**更新禁止事項**:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ ドキュメントのみの変更（docs-only コミット）への反応
- ❌ 技術的状態に変更がない場合の形式的な更新
- ❌ 定期的なループによる形式的な更新（23系ループの乱用防止）
- ❌ 品質メトリクスの安定時における数値の再列挙

**23系ループ実行時の判断基準**:
- ✅ **更新 OK**: 直近10コミットでコードに実質的な変更がある（meta_checker.py改良、新機能実装、バグ修正、カバレッジ改善など）
- ❌ **更新 NG**: docs-only コミットが連続している、技術的状態に変更なし、品質メトリクスが安定している場合の形式的更新

**現在の状態**: 2026-03-19時点で、直近10コミットのうち6件がdocs系コミットであり、技術的状態は安定している。次回の23系ループ実行時は、コードに実質的な変更があるかを厳密に判断すること。
