# yka_ikiiki_record — マイルストーンと小作業

<!-- BEGIN: GENERATED -->

計画基準: 2026-10-21 / `0839402a`。
長期方針: [dot-long-term-direction.md](dot-long-term-direction.md)。実装・受入正本: `PURPOSE.md` / `.concept/charter.yml` / `.audit/purpose_driven_plan.yml`。
専任ワーカー: [dot-worker-instructions.md](dot-worker-instructions.md)。
状態はこの基準時点の観測であり、実行時にmain/PR/runから再確認する。

## 構造と実行する範囲

実行範囲は `.audit/purpose_driven_plan.yml` の remaining_tasks (T-003〜T-010) を最新実装へ再束縛したもの。
担当境界: ワーカーDotは本repoの作業checkoutで commit まで行う。push/merge/deploy/環境変数の本番設定・Human Operator手順は範囲外。`.env` はgitignore対象の実行環境ファイルであり、コミットしない（`.env.example` の非秘密値を複写するだけ）。

## マイルストーン

|ID|利用者が得る能力・成果|対象WP|完了ゲート|標準作業枠|
|---|---|---|---|---|
|DM-01|E2Eスイートの緑/赤が再現可能になりMS-012が判定できる|D01, D02|test:e2e:localの結果が証拠として記録され、全件passまたは失敗原因が確定|2枠|
|DM-02|統計データをPDFでも出力できる|D03|format=pdfがAPI/ExportButtonで動作しテスト通過|1枠|
|DM-03|認証・バックアップ・通知がE2Eレベルで保証される|D04, D05, D06|各specが実行され結果が記録される|3枠|
|DM-04|管理者が性能指標を画面で確認できる|D07|admin/performanceページが指標を描画しテスト通過|1枠|
|DM-05|教員がマニュアルだけで主要操作を完了できる|D08|docs/user-manual.mdが公開されREADMEから辿れる|1枠|
|DM-06|初期バンドルが削減される|D09|buildで初期バンドル削減が観測される|1枠|

依存: D01 → D02(条件付き), D04, D05, D06（E2E実行laneはD01の環境整備が前提）。
D03 / D07 / D08 / D09 は相互独立。

独立して進められる作業: D03, D07, D08, D09。D04-D06はD01完了後に独立化。同一ファイルへのwrite競合なし（各WPの変更範囲は作業カード参照）。
9枠×約30分は標準枠の単純和。外部待ち・追加修正・実走超過は別で、暦時間保証や大ゴールの残工数ではない。

## 作業カード

### D01 | ローカル`.env`整備とE2Eスイート実走・結果判定（約30分）

- **主旨**: MS-012の残ゲート「E2E全件検証」の唯一のブロッカー（DATABASE_PROVIDER未確定）を解消し、ISS-003修正が実効したか判定する
- **ゴール・成果物**: `npm run test:e2e:local` の実行結果サマリ（pass/fail内訳）を最終報告に記録
- **入力・対象**: `.env.example`（DATABASE_PROVIDER="mirage"）、`playwright.config.ts`、`scripts/test-e2e-local.sh`、`playwright/*.spec.ts`（3件）
- **作業**: ①`.env.example`を`.env`へ複写（非秘密値のみ・コミットしない）②`npm run test:e2e:local`実行③結果をpass/fail/原因別に分類
- **完了条件（事前AC）**: スイートが起動し全specの結果が得られ、pass全件またはfailが原因別に分類されている。`.env`がgit statusに現れないこと
- **必要検証・証拠**: 実行ログのpass/fail数、`git status`に`.env`無し
- **依存・着手条件**: なし（ローカル環境のみ。DB・外部API不要）
- **担当・変更範囲**: Dot / `.env`(未追跡)のみ。repoへのコミット変更なし
- **待ち・失敗・再開**: 39件想定の実走が30分を超える場合はchromiumプロジェクト(`npm run test:e2e:chromium`)に絞り、残りをwaitingとして回収条件を記す。失敗が出たらD02へ引き継ぎ
- **条件付き不要の判定**: `.env`が既に存在しスイートが起動するなら複写手順をスキップ（実走は実施）

### D02 | E2E失敗の最小修正（条件付き・約30分）

- **主旨**: D01で検出した実失敗だけを最小差分で直す
- **ゴール・成果物**: 失敗したspecの修正commitと再実行結果
- **入力・対象**: D01のfail分類、該当spec・対象コンポーネント
- **作業**: 先頭の失敗1件を選び最小修正→当該specのみ再実行
- **完了条件（事前AC）**: 選んだ失敗が再現しないこと、または原因が環境境界と確定しwaiting条件が記録される
- **必要検証・証拠**: 修正specの再実行結果、`npm test`の非退行
- **依存・着手条件**: D01のfail分類。D01が全件passなら**not_needed**
- **担当・変更範囲**: Dot / 失敗に関係する1ファイル群のみ
- **待ち・失敗・再開**: 30分で収まらない複数失敗は1件分だけ残し残課題化
- **条件付き不要の判定**: D01全件pass時は本WPをnot_neededで閉じる。not_needed時の後段依存はない

### D03 | PDFエクスポート形式の追加（約30分）

- **主旨**: plan T-004の残スコープ。CSV/Excelは実装済みのためPDF形式のみ追加
- **ゴール・成果物**: `format=pdf`でエクスポートできるAPI・UI・テスト
- **入力・対象**: `src/lib/export/`（pdf.ts新規）、`src/app/api/export/route.ts`、`src/components/common/ExportButton.tsx`、`src/components/dashboard/DataVisualization.tsx`
- **作業**: pdf生成ユーティリティ→route分岐→ExportButton(format="pdf")配置→対象テスト追加
- **完了条件（事前AC）**: `/api/export?format=pdf`がPDFを返すテストがpass、DataVisualizationにpdfボタンが描画されるテストがpass
- **必要検証・証拠**: `npm test -- --testPathPattern='export|ExportButton|DataVisualization'`
- **依存・着手条件**: なし
- **担当・変更範囲**: Dot / 上記4ファイル+新規テスト（25ファイル上限内）
- **待ち・失敗・再開**: PDF依存ライブラリ追加が必要なら本WPでは最小の自前実装か要件分割とし、依存追加の判断は残課題へ
- **条件付き不要の判定**: pdf.tsが既に実在するなら実走確認のみで閉じる

### D04 | 認証フローE2Eテスト（約30分）

- **主旨**: plan T-005。MS-011の認証をE2Eレベルで保証
- **ゴール・成果物**: `playwright/auth-flow.spec.ts`（ログイン/ログアウト/保護ルート）の実装と実行結果
- **入力・対象**: `src/app/api/auth/login/route.ts`、`src/components/auth/LoginForm.tsx`、既存specの構成
- **作業**: spec作成→対象specのみ実行→結果記録
- **完了条件（事前AC）**: 新規specが実行されpass/failが記録される（failは実装側の別WPへ分離）
- **必要検証・証拠**: `npx playwright test playwright/auth-flow.spec.ts`の結果
- **依存・着手条件**: D01の環境整備（`.env`+スイート起動確認）
- **担当・変更範囲**: Dot / playwright配下の新規ファイルのみ
- **待ち・失敗・再開**: 実走超過時はspec作成と実行を分割し実行をwaitingへ
- **条件付き不要の判定**: 同名specが既に存在するなら差分確認のみ

### D05 | バックアップ/復元E2Eテスト（約30分）

- **主旨**: plan T-006。MS-008のバックアップ/復元をE2Eレベルで保証
- **ゴール・成果物**: `playwright/backup-restore.spec.ts`の実装と実行結果
- **入力・対象**: `src/app/api/backup`, `src/app/api/restore`, `InMemoryBackupRepository`
- **作業**: spec作成→対象specのみ実行→結果記録
- **完了条件（事前AC）**: D04と同型（新規specの実行結果記録）
- **必要検証・証拠**: `npx playwright test playwright/backup-restore.spec.ts`の結果
- **依存・着手条件**: D01の環境整備
- **担当・変更範囲**: Dot / playwright配下の新規ファイルのみ
- **待ち・失敗・再開**: D04と同じ
- **条件付き不要の判定**: D04と同じ

### D06 | 通知システムE2Eテスト（約30分）

- **主旨**: plan T-007。MS-009の通知をE2Eレベルで保証
- **ゴール・成果物**: `playwright/notification-system.spec.ts`の実装と実行結果
- **入力・対象**: `src/components/common/Notification.tsx`（data-testid="notification-banner"）、`api/notifications`
- **作業**: spec作成→対象specのみ実行→結果記録
- **完了条件（事前AC）**: D04と同型
- **必要検証・証拠**: `npx playwright test playwright/notification-system.spec.ts`の結果
- **依存・着手条件**: D01の環境整備
- **担当・変更範囲**: Dot / playwright配下の新規ファイルのみ
- **待ち・失敗・再開**: D04と同じ
- **条件付き不要の判定**: D04と同じ

### D07 | パフォーマンス監視ダッシュボード（約30分）

- **主旨**: plan T-008。MS-007のPerformanceMonitorの指標を管理画面で可視化
- **ゴール・成果物**: `src/app/admin/performance/page.tsx`+`PerformanceDashboard`コンポーネント+テスト
- **入力・対象**: `src/lib/resilience/performance-monitor.ts`、新規`src/app/admin/`配下
- **作業**: コンポーネント→ページ→描画テスト。adminルートは新設になるため最小構成に留める
- **完了条件（事前AC）**: `/admin/performance`が指標を描画するテストがpass
- **必要検証・証拠**: `npm test -- --testPathPattern='PerformanceDashboard'`、`npm run build`で新ルート確認
- **依存・着手条件**: なし
- **担当・変更範囲**: Dot / `src/app/admin/`, `src/components/admin/`のみ
- **待ち・失敗・再開**: 30分超過時はページ骨格+テストを先に着地し描画強化を残課題へ
- **条件付き不要の判定**: 実装済みなら実走確認のみ

### D08 | 教員向けユーザーマニュアル（約30分）

- **主旨**: plan T-009。教員が独力で記録入力〜統計閲覧〜エクスポートできる文書
- **ゴール・成果物**: `docs/user-manual.md`と`README.md`からの導線リンク
- **入力・対象**: `docs/`, `README.md`, 主要UI画面（記録入力・統計・エクスポート）
- **作業**: 操作手順・画面対応・FAQを作成しREADMEへリンク1行追加
- **完了条件（事前AC）**: マニュアルが存在し、記録入力/統計閲覧/エクスポートの3手順を網羅しREADMEから辿れる
- **必要検証・証拠**: 文書レビュー（docs-onlyのため製品テストは起動しない）
- **依存・着手条件**: なし
- **担当・変更範囲**: Dot / `docs/user-manual.md`, `README.md`（リンク1行）
- **待ち・失敗・再開**: 30分超過時は3手順を優先しFAQを残課題へ
- **条件付き不要の判定**: 既存なら網羅性の差分のみ

### D09 | バンドル初期容量の削減（約30分）

- **主旨**: plan T-010再束縛版。旧対象`src/app/admin/*`は不存在のため、実在の重い経路へ変更
- **ゴール・成果物**: 重いクライアントコンポーネントのdynamic import適用とbuild差分
- **入力・対象**: `src/components/auth/LoginForm.tsx`、その他大きいクライアントコンポーネント（`next build`出力で特定）
- **作業**: `npm run build`で現バンドル計測→対象1箇所を`next/dynamic`化→再buildで差分記録
- **完了条件（事前AC）**: 初期バンドル削減がbuild出力の数値差で観測される（目標: 対象chunkの分離）
- **必要検証・証拠**: 前後の`npm run build`出力、`npm test`非退行
- **依存・着手条件**: なし
- **担当・変更範囲**: Dot / 対象1コンポーネントとその参照元のみ
- **待ち・失敗・再開**: 削減が観測できなければ数値を記録して閉じ、追加対象は残課題へ
- **条件付き不要の判定**: 既にdynamic化済みなら計測のみ

## 完了と再計画

- 1WPは1振る舞い・1課題・1境界。設計が成果のWPを除き、設計だけで実装をdoneにしない。
- pending/ready/in_progress/waiting/done/not_neededを区別する。doneにはACと必要な配達ゲートが要る。
- 長い実走は起動と結果回収を分け、結果未取得はwaiting。完了taskと有効証拠を再利用する。
- 条件付き前段がnot_neededの場合の後段経路: D02がnot_neededでもD04-D06はD01の環境整備のみに依存するためreadyを維持する。
- 同条件比較が必要な場合の対照取得・判定WP: なし（D09のbuild前後計測は同一WP内の前後比較）。
- 実行時刻・commit/hash・PR・run・backend等は実行元から取得する。欠測を0で埋めない。
- runtime進捗とraw証拠は `.audit/purpose_driven_plan.yml` の task status / `.concept/run_state.json` / `.hermes_reports/` に置く。
- 追加修正片は親WPに束縛し、目的・成果・AC・依存を保つ。無関係なbacklogを増やさない。
- 目的・資源・保護制約を守り、計画変更の理由と影響する再検証を残す。
- 現在の実行波の終了条件: D01〜D09が全てdoneまたはnot_needed（waitingは解除条件付きで保留可）。

<!-- END: GENERATED -->
<!-- BEGIN: HUMAN -->
<!-- END: HUMAN -->
