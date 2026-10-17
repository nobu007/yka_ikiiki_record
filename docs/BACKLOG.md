# BACKLOG — 課題

> 2026-10-17 作成（OI-20261017-28）。長期は [../ORDER.md](../ORDER.md)、短期は [GOAL.md](GOAL.md)。
> 未完了項目は完了確認まで消さない。

| ID | 課題 | 担当 | 依存 | 出口条件 | 状態 |
|----|------|------|------|----------|------|
| B-001 | MS-012 の E2E が使用環境の `.env` 未設定で blocked（2026-03-30 から継続。charter.yml MS-012 progress_note） | Human Operator | なし | E2E 39件通過・成功メッセージ検出 | open |
| B-002 | 本番デプロイ未実施 — 実装完了と運用実証の乖離。証拠: `.vercel` 不在、docs 内に本番URLへの言及なし（2026-10-17 検証） | Human Operator | B-001 の解除を推奨 | `./scripts/verify-deployment.sh <本番URL>` 合格 | open |
| B-003 | PURPOSE.md の陳腐化: 状況セクション 2026-03-21、テスト数 1393（charter.yml は 2470/2472 @2026-03-30）、参照先 `data/meta_report.md`・`chain_checkpoints/` が実在しない | エージェント | PURPOSE.md 更新ルールの発火（デプロイ完了・実質的コード変更等） | 発火時に状況セクションと参照先を修正 | open |
| B-004 | charter.yml の non_goals「本番環境向けの認証・認可システム」と MS-011（認証・認可を実装して done）の整合 — オーナーの意図（スコープ限定か non_goals 側の陳腐化か）の確認が必要 | オーナー | なし | non_goals または MS-011 の位置づけ明確化 | open |
| B-005 | charter.yml MET-001「テストカバレッジ」が前回 run で再検証されず（jest 不可・依存復旧が EROFS で阻止と記録）。MET-003 は 39/404 ファイルが300行超 | エージェント | 環境復旧 | jest 再実行でカバレッジ・行数を再検証し current を更新 | open |
| B-006 | charter.yml の work_policy に `quality_gates` キーが重複しており、`max_files_changed: 25` がパーサによって無視される可能性 | エージェント（concept_sync 経由を推奨） | なし | キー重複の解消 | open |
