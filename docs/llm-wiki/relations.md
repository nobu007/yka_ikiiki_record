# Repository relations
Repository: yka_ikiiki_record

## ai-hub
- Status: confirmed
- Relationship: ai-hubのchainが、このリポジトリの作業を実行ハーネスへ渡す。
- Responsibility: 本リポジトリは変更・検証・対象worktreeでのコミットを担当し、着地・タスク管理・worktree削除はハーネスが担当する。
- Canonical sources: yka_ikiiki_record:LOOP.md、ai-hub:hub/instructions/fleet-execution-doctrine.md、実行時のTask Packet。
- Change rule: ハーネスの実行条件を変更する際はTask Packetと配布済み実行規約を確認する。LOOP.mdに従い、本runからpush・deploy・他リポジトリ編集をしない。
- Evidence: yka_ikiiki_record:LOOP.md sha256:3ef52814b3683ae3a1c2d704853a72b27fce9d782c42c40a92b1b70c1b2fda6f
- Evidence: ai-hub:hub/instructions/fleet-execution-doctrine.md sha256:c6cc1850a1147adfcad8f85b85b21f831327afec9db1b25609ec583444a82677
- Observation: TAS状態照会の権限エラーと未確認事項は.module/FEEDBACK.mdに記録。本runでは関連リポジトリを変更していない。
