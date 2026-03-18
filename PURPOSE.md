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

**品質メトリクス** (最新):
- JudgmentScore: 100/100 (SYSTEM HEALTHY)
- テスト: 1206/1206 passing (100%)
- カバレッジ: 98.85% statements, 95.02% branches
- TypeScript: strict mode 完全準拠、any型0件
- ESLint: zero warnings
- Clean Architecture: 違反0件

**実装済みの自律的耐久性コンポーネント**:
- ✅ timeout enforcement (API, Database, Command, File, E2E)
- ✅ circuit-breaker pattern (カスケーディング故障防止)
- ✅ loop-detector (無限ループ検出、destroy()メソッドによる完全cleanup)
- ✅ memory-monitor (メモリリーク検出、GCトリガー)
- ✅ structured-logger (自動圧縮付き構造化ロギング)

**重要な最近の改善** (直近の実際のコード変更):
- 485206e: LoopDetectorのtimer cleanup完全実装 (destroy()メソッド、Jest hang問題解決)

### 23系ループの現状認識

直近10コミットのうち9件が`docs: reconstitute PURPOSE`であり、**実質的なコード変更が1件のみ**です。これは以下の状態を示しています：

1. **技術的実装は完成している**: コードベースは安定し、品質メトリクスは最高水準
2. **23系ループは定期的に実行されている**: しかし、反映すべき新しいコード変更が最小限
3. **次の進捗はデプロイ実行に依存**: Human OperatorによるVercelセットアップが必要

## 直近の優先成果

### P1: 本番デプロイ実行（Human Operatorのアクション待ち）

**技術的実装は完了**しています。実際のデプロイ実行にはHuman Operatorによる以下の手順が必要です：

```bash
# ステップ1: Vercelプロジェクトとの連携
cd /home/jinno/yka_ikiiki_record
vercel link

# ステップ2: PostgreSQLデータベース構築（いずれかを選択）
#    - Vercel Postgres (推奨): Vercel Dashboard → Storage → Create Database → Postgres
#    - Supabase: https://supabase.com → New Project
#    - Neon: https://neon.tech → Create Project

# ステップ3: 環境変数設定
vercel env add DATABASE_URL production
# (データベース接続文字列を入力)
vercel env add DATABASE_PROVIDER production
# (値: "prisma" を入力)

# ステップ4: デプロイ実行
./scripts/deploy-production.sh
```

**デプロイ完了後の自動検証**:
```bash
./scripts/verify-deployment.sh <本番URL>
```

**手動検証チェックリスト**:
- [ ] 本番URLで `GET /api/seed` が200応答
- [ ] 本番URLで `GET /api/stats` がJSON応答
- [ ] 本番URLでアプリケーションが正常に表示される
- [ ] データがPostgreSQLに保存されていることを確認

### P2: デプロイ後の機能改善（デプロイ完了後に開始）

デプロイ完了後、実際の使用状況に基づいて優先順位を再決定します：

**優先度1: 基盤機能**
- 認証・認可システム（教員アカウント管理、NextAuth.js導入）
- 複数クラス対応（複数学級のデータ管理、データの分離）
- データエクスポート機能（CSV/Excel出力、APIエンドポイント追加）

**優先度2: 分析・可視化の強化**
- 詳細な分析レポート（個人・クラス単位の長期トレンド）
- パフォーマンス最適化（大量データ時の表示速度改善、データページネーション）
- モバイル対応最適化（タブレットでの利用支援、レスポンシブデザイン改善）

**優先度3: 運用改善**
- バックアップ・復元システム（定期バックアップ、ワンクリック復元）
- 監査ログ機能（操作履歴記録、変更追跡）
- 通知システム（異常値検知時のアラート、メール通知）

### P3: 品質メトリクスの維持（継続実行中）

**自動実行されている監視**:
```bash
# 品質チェック実行（手動実行も可能）
python scripts/meta_checker.py

# カバレッジ詳細確認
npm run test:coverage -- --runInBand

# 監査レポート確認
cat data/meta_report.md
```

**現在の品質目標達成状況**:
- ✅ JudgmentScore: 100/100 (維持中)
- ✅ テスト成功率: 100% (1206/1206 passing)
- ✅ カバレッジ: 98.85% statements (目標95%以上を達成)
- ✅ TypeScript strict mode: 完全準拠
- ✅ ESLint: zero warnings

**23系ループの運用方針**:
- 技術的実装が完成しているため、**23系ループは一時停止**を推奨
- デプロイ完了後、または実質的なコード変更が発生した場合に再開
- docs-onlyのPURPOSE.md更新ループは、実質的な進捵がない状態を避けるため抑制

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
- **loop-detector**: 無限ループ検出、時間ベースカウンタリセット、destroy()メソッドによる完全なtimer cleanup（Jest hang問題解決済み）
- **memory-monitor**: メモリリーク検出、GCトリガー
- **structured-logger**: 自動圧縮付き構造化ロギング、可視性フィルタリング

**最近の重要な修正** (2026-03-19):
- LoopDetectorに`destroy()`メソッドと`pendingTimeouts`追跡を実装
- `safeLoop`/`safeAsyncLoop`でtry/finallyによる自動cleanupを保証
- Jestの`forceExit`設定を有効化し、テストスイートの完全終了を確保

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

**23系ループの一時停止方針**:
- 現在、技術的実装は完成しており、直近10コミットのうち9件がdocs-only変更
- 実質的なコード進捗がない状態での23系ループ継続は、ドキュメントの無意味な更新を招く
- **デプロイ完了後、または実質的なコード変更が発生した時点で23系ループを再開**

**更新時の品質ガードレール**:
- ❌ 直近10コミットの単なる列挙（履歴書化）
- ❌ ドキュメントのみの変更（docs-only コミット）への形式的な反応
- ❌ 品質メトリクスの安定時における数値の再列挙のみ
- ✅ コード変更の実態を調査し、優先順位に反映すること
- ✅ 未来のアクションプランを明確にすること
- ✅ 実質的な進捵がない場合、更新を見送る判断を行うこと
