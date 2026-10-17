# ORDER — 長期計画（正本）

> 2026-10-17 に OI-20261017-28 により新設。作成時点で長期計画の正本が存在しなかったため
> （ORDER.md 不在、PURPOSE.md は優先順位SSOTを自称するが状況セクションが 2026-03-21 で陳腐化）、
> 本書を長期計画の正本とする。
> マイルストーンの機械可読SSOTは `.concept/charter.yml`（concept_sync ループが管理するため本書からは改変しない）。
> 短期計画は [docs/GOAL.md](docs/GOAL.md)、課題は [docs/BACKLOG.md](docs/BACKLOG.md)。

## 北極星（変更なし）

日本の教育現場における「生徒の心の成長」と「学級文化」を可視化する教育インフラを構築する。

## 段階と到達点

### 段階1: 実装基盤の構築 — **到達済み（実装完了。運用実証は未達）**

- 到達点: 本番稼働可能なコードベース。品質メトリクスは charter.yml の各 progress_note
  （MS-001〜MS-011、2026-03-29〜30 時点で全体 2470/2472 tests passing）に記録済み。
- 証拠（2026-10-17 実在確認）: `scripts/deploy-production.sh`、`scripts/verify-deployment.sh`、
  `scripts/meta_checker.py`、`src/lib/resilience/`（circuit-breaker / loop-detector 等）。
- 注意: これは**実装完了**であり**運用実証**ではない。両者は区別して扱う。

### 段階2: 本番稼働・運用実証 — **未着手（Human Operator の依存アクションで停止中）**

- 到達点: なし。本番デプロイの証拠（`.vercel/` ディレクトリ、本番URLへの言及）が
  リポジトリ内に存在しない（2026-10-17 検証）。
- 担当: Human Operator（PURPOSE.md「P1」の手順が正本手順）。
- 依存: Vercel プロジェクト連携、PostgreSQL の用意（Vercel Postgres / Supabase / Neon のいずれか）、
  `DATABASE_URL` / `DATABASE_PROVIDER` の環境変数設定。
- 出口条件: 本番URLで `GET /api/seed` が200応答、`GET /api/stats` がJSON応答、
  アプリ正常表示、データがPostgreSQLに保存（PURPOSE.md の手動検証チェックリスト）。
- 次の一手: PURPOSE.md「P1」の手順実行 → `./scripts/verify-deployment.sh <本番URL>`。

### 段階3: 教育現場での実使用と機能拡張 — **未着手**

- 開始条件: 段階2の出口条件達成後、実使用状況に基づき優先順位を再決定する（PURPOSE.md P2 の方針を引き継ぐ）。
- 実装済みだが運用未実証の機能: 認証・認可（MS-011）、データエクスポート（MS-003）、
  ページネーション（MS-004）、監査ログ（MS-005）、トレンド分析（MS-006）、
  バックアップ・復元（MS-008）、通知（MS-009）。

## 現在の活動（段階横断・継続中）

- `.concept` ガバナンス運用: 2026-09〜10 の実コミットで invariant 整備・ontology 同期を継続
  （cycle-227〜230、コミット f48d7b5f / 8107befa / bcff6ae7 等）。
- CI 修正と LOOP.md 自律ループ運用（コミット faf67444、65fd991e、ad4993b8）。

## 制約（非目標・変更なし）

charter.yml の non_goals を引き継ぐ: 実AI/MLモデル実装なし（デモ用モックのみ）、
複数学校向けマルチテナント機能なし。オーナーの目的・権限・予算は本更新では変更しない。
（non_goals と MS-011 実装の整合については docs/BACKLOG.md B-004 を参照。）

## 本更新の理由と根拠

- 発端: OI-20261017-28「既存の目的と実装・運用証拠を照合し、長期計画の不足・陳腐化を修正する」。
- 不足の証拠: 長期計画の正本文書が不在（ORDER.md / docs/GOAL.md / docs/BACKLOG.md とも 2026-10-17 時点で未存在）。
- 陳腐化の証拠: PURPOSE.md 状況セクションは 2026-03-21 記載で、テスト数 1393 は
  charter.yml の 2026-03-30 時点 2470 に比して古い。PURPOSE.md 参照先の
  `data/meta_report.md` と `chain_checkpoints/` は実在しない（2026-10-17 検証）。
- 未完了項目の扱い: MS-012（2026-03-30 から blocked のまま）と P1 本番デプロイ待ちは
  **削除せず保持**し、docs/BACKLOG.md に課題として記録した。
- 不明事項の記録: 本番環境が既にどこかで稼働しているかはリポジトリ内からは判定不能（不明として記録）。
