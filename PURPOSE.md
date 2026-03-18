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

### P1: 本番デプロイ実行（次のアクション）

**完了した準備作業**:
- ✅ Clean Architecture実装完了
- ✅ 自律的耐久性インフラ実装完了 (1549行)
  - timeout.ts, circuit-breaker.ts, loop-detector.ts, memory-monitor.ts, structured-logger.ts
- ✅ 自律的品質監視システム実装完了 (384行)
  - scripts/meta_checker.py: Clean Architecture遵守、テストカバレッジ、TypeScript strict mode を自動監視
- ✅ Vercel設定ファイル準備完了 (vercel.json)
- ✅ デプロイスクリプト準備完了 (scripts/deploy-production.sh)

**必要な作業**:
1. **Vercelプロジェクト作成**: `vercel link`
2. **PostgreSQLデータベース構築**: Vercel Postgres / Supabase / Neon
3. **環境変数設定**: DATABASE_URL, DATABASE_PROVIDER
4. **デプロイ実行**: `./scripts/deploy-production.sh`

**完了条件**:
- [ ] Vercelプロジェクト作成
- [ ] PostgreSQLデータベース構築
- [ ] 環境変数設定
- [ ] 本番デプロイ実行
- [ ] 本番URLで基本動作確認（/api/seed, /api/stats）

### P2: 自律的品質監視ループの確立（継続タスク）

**scripts/meta_checker.py** による自動品質監視を実行します。

**現在の品質メトリクス** (2026-03-18):
- **JudgmentScore**: 100/100 (SYSTEM HEALTHY)
- **テスト**: 1189/1189 passing (146 suites)
- **カバレッジ**: 98.68% statements, 94.73% branches
- **TypeScript**: strict mode 完全準拠、any型0件
- **ESLint**: zero warnings
- **Clean Architecture**: 違反0件

**品質基準**:
- テスト成功率: 100%
- カバレッジ: statements ≥ 95%, branches ≥ 90%
- TypeScript strict mode: 完全準拠
- ESLint: zero warnings

**監視方法**:
```bash
# 自律品質チェック実行
python scripts/meta_checker.py

# 出力:
# - data/meta_report.md: ヒューマンリーダブル監査レポート
# - data/judgment_metrics.csv: 時系列メトリクス（Guardian監視用）
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

### 自律的耐久性プロトコル (SYSTEM_CONSTITUTION.md §6)

**実装済みコンポーネント**:
- **timeout enforcement**: API/DB/コマンド/ファイル/E2E用タイムアウトラッパー
- **circuit-breaker pattern**: カスケーディング故障防止
- **loop-detector**: 無限ループ検出と防止
- **memory-monitor**: メモリリーク検出とGCトリガー
- **structured-logger**: 自動圧縮付き構造化ロギング

### Repository Factoryパターン

環境依存の中央管理により、開発環境と本番環境でデータソースを切り替えます：

- 開発環境 (`DATABASE_PROVIDER=mirage`): MockStatsRepository（インメモリ）
- 本番環境 (`DATABASE_PROVIDER=prisma`): PrismaRecordRepository（PostgreSQL）

## 完了の定義

**P1完了条件**:
- [x] コードベースがデプロイ準備完了状態
- [x] Clean Architecture実装完了（4層分離と依存方向ルール準拠）
- [x] 自律的耐久性インフラ実装完了 (SYSTEM_CONSTITUTION.md §6準拠)
- [x] 自律的品質監視システム実装完了 (meta_checker.py)
- [ ] Vercelプロジェクト作成、本番URL発行
- [ ] PostgreSQLデータベース構築
- [ ] 環境変数設定（DATABASE_URL, DATABASE_PROVIDER）
- [ ] 本番デプロイ実行
- [ ] 本番URLで/api/seedと/api/statsが動作

**P2継続条件**:
- JudgmentScoreが100/100を維持
- 全テストがパスし続けている
- カバレッジが基準値を満たし続けている
- Clean Architecture違反が検出されたら即座に修正されている

## 更新ルール

この文書は以下の場合に更新します：

1. **P1完了時**: 本番デプロイ完了後、P3（運用改善）へ移行
2. **meta_checker.py導入時**: 品質監視手法が変わった場合
3. **アーキテクチャ上の重大な変更時**: レイヤー構造や依存方向の根本的な変更実施時
4. **プロジェクトの方向性転換時**: 目標や優先順位の大幅な変更がある場合
