# yka_ikiiki_record — 長期方針の見直し

<!-- BEGIN: GENERATED -->

計画確認日: 2026-10-21。基準: yka_ikiiki_record @ `0839402a` (docs: add LOOP.md)。
文書の役割: `PURPOSE.md` は北極星・優先順位の SSOT、`.concept/charter.yml` はマイルストーン正本、`.audit/purpose_driven_plan.yml` はタスク台帳、`LOOP.md` は実行規律、`AUTOMATION.md` は driver 宣言、`SYSTEM_CONSTITUTION.md`/`AGENTS.md` は品質・運用規約。本書はそれらへ接続する方向レビューであり、同じ現状・AC・作業一覧の第2の正本を作らない。

## 目的と変更してはいけない条件

- 目的: 日本の学校向けに、学生の成長と教室文化を1分間の記録で可視化する教育インフラを提供する（charter `north_star` / PURPOSE 北極星）
- 最終的な成果と判定範囲: Vercel + PostgreSQL で公開URLが稼働し、教員が実運用できる状態（PURPOSE「目指す完成状態」4条件）
- 保護制約・資源・権限: LOOP.md 禁止事項（push・deploy・秘密情報の取扱い禁止、1 run = 1 改善、30分超は分割）、work_policy（lint・test必須、max 25ファイル/run）、charter non_goals（実AI/ML非搭載、本番認証、マルチテナントは対象外）
- 他担当/外部システムとの責務境界: 本番デプロイ（`vercel link`・環境変数・DB構築）は Human Operator 専決（PURPOSE P1）。`.env` 作成等のローカル環境整備はコミット対象外の実行環境作業。git 着地（merge/push）は harness/TAS の責務で、ワーカーは commit まで。

## 全体構造と現在地

|実際の経路/責務|コード・契約|実装/受入/運転の状態|証拠と観測日|残る原因|
|---|---|---|---|---|
| 記録入力→統計→可視化UI | `src/app/(dashboard)/`, `src/components/dashboard/` | 実装済み・ユニット受入済み | charter MS系 done / src実在 2026-10-21 | なし |
| Clean Architecture 層 | `src/domain|application|infrastructure|presentation` | 実装済み・違反0 | charter MET/不変条件 2026-10-21 | なし |
| 自律的耐久性 | `src/lib/resilience/` (timeout, circuit-breaker, loop-detector, memory-monitor, structured-logger) | 実装済み | src実在 2026-10-21 | なし |
| エクスポートAPI | `src/app/api/export/` (csv/xlsx), `ExportButton`(csv/xlsx 統合済) | 実装済み・UI接続済み | src実在 2026-10-21 | PDF形式未実装（pdf.ts無し） |
| 認証・認可 | `src/domain/services/AuthenticationService`, `src/app/api/auth/login` | 実装済み・ユニット受入済み | MS-011 done / src実在 | E2Eレベル未検証（spec無し） |
| バックアップ/復元 | `src/domain/entities/Backup.ts`, `api/backup`, `api/restore` | 実装済み・ユニット受入済み | MS-008 done / src実在 | E2Eレベル未検証 |
| 通知システム | `src/application/services/NotificationService`, `api/notifications` | 実装済み・ユニット受入済み | MS-009 done / src実在 | E2Eレベル未検証 |
| E2Eスイート | `playwright/` 3 spec, `scripts/test-e2e-local.sh` | 実装済み・**実証待ち** | MS-012 active, T-003 BLOCKED | `.env` 未作成→`DATABASE_PROVIDER` 未確定で seed API 失敗の既知問題（ISS-003/PR-003） |
| 本番デプロイ | `scripts/deploy-production.sh`, `verify-deployment.sh` | スクリプト実装済み・**実行待ち** | PURPOSE P1 | Human Operator の手順（link/env/DB）待ち |
| 品質監視 | `scripts/meta_checker.py`, `data/judgment_metrics.csv` | 実装済み・運転継続 | data実在 | なし |
| 管理画面 | `src/app/admin/` | **未着手** | src不在 2026-10-21 | adminルート自体が不存在（plan T-010 の参照先も不存在） |

## 以前の計画から変える判断

|以前の前提・順序|最新の事実|維持/変更/後回し/終了|理由・影響先|
|---|---|---|---|
| T-003「E2E全件実行」は即時可 | `.env` が repo に無く、`DATABASE_PROVIDER` が未設定（2026-10-21観測）。`.env.example` は mirage を明示 | 維持（環境整備を作業に組込み） | `.env`(gitignore対象・非秘密のexample値)を作業checkoutで作ってから実走。環境要因で赤なら waiting に分離 |
| T-004「DataVisualizationへエクスポートUI追加」 | ExportButton(csv/xlsx)は既にDataVisualizationへ統合済み（106-107行） | 変更 | 残スコープはPDF形式のみ（`src/lib/export/pdf.ts`, route `format=pdf`, ExportButton(format="pdf")） |
| T-010「`src/app/admin/layout.tsx` をコード分割」 | `src/app/admin/` が不存在（2026-10-21観測） | 変更 | 対象を実在の重い経路（LoginForm等クライアントコンポーネントの dynamic import）へ再束縛。`npm run build` で差分確認 |
| P1 本番デプロイ | Human Operator 手順待ちのまま（`vercel link`/env/DB未実施の証拠なし） | 維持（人間専決） | ワーカー任務の範囲外。解除条件のみ明示 |
| test-only plan spin（2026-04-04検出） | T-004〜T-010で多様化済み、未消化が残存 | 維持 | feat/test/docs/refactor の多様性をWPに維持 |

古い成功・失敗はその候補/条件の記録として保持する。現在の仕様・実績へ付け替えない。

## 到達状態から逆算した段階

|段階|利用者が得る成果|必要な証拠|未達原因・依存|次の実行波に進む条件|
|---|---|---|---|---|
| S0: E2E信頼性回復 | E2Eスイートが再現可能に緑/赤判定できる | `npm run test:e2e:local` の実行結果証拠 | `.env` 未整備（解消可能）、ISS-003残存リスク | 現在の実行波 |
| S1: 機能差分の消化 | PDFエクスポート・認証/バックアップ/通知のE2E保証・性能可視化・教員マニュアル・バンドル削減 | 各WPのAC+検証 | S0のE2E実行lane（D04-D06のみ依存） | 現在の実行波 |
| S2: 本番公開 | 誰でもアクセス可能なURLで実データ永続化 | デプロイURL+`verify-deployment.sh`結果 | Human OperatorのVercel/DB設定 | S0-S1 とは独立（人間待ち） |
| S3: 実運用フィードバック | 使用実績に基づく改善優先度 | 利用ログ・要望 | S2 完了後のみ入力確定 | S2 完了時に再分割 |

現在の実行波は [dot-milestones.md](dot-milestones.md) に約30分単位で定義する。
遠い段階の実装詳細は、入力・必要性が確定した時に分割する。
目的・保護条件以外の計画を変えるときは理由、影響する依存、再検証範囲を残す。

<!-- END: GENERATED -->
<!-- BEGIN: HUMAN -->
<!-- END: HUMAN -->
