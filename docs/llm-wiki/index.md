# Repository knowledge

目標は [PURPOSE.md](../../PURPOSE.md)、マイルストーンは [.concept/charter.yml](../../.concept/charter.yml)、作業候補は [LOOP.md](../../LOOP.md) を参照する。

## 概念モデルの検査

正本は [.concept/ontology.yml](../../.concept/ontology.yml) と [invariants.yml](../../.concept/invariants.yml)。`python3 scripts/validate_concepts.py` は PyYAML を使い、YAML重複キー、概念参照、対応先ファイル・シンボル・API、引用、件数予算、AUTOの参照を検査する。`--write-metrics` は計測結果のみを再生成する。構造のPASSは、本番稼働・全不変条件の実行時準拠・認証安全性を証明しない。

統合した不変条件は `merged_constraints` に元ID・制約・検証方法を保持する。これらも引き続き有効であり、トップレベルの件数減少は要件削除を意味しない。

`python3 -m unittest discover -s scripts -p 'test_validate_concepts.py' -v` は、重複キー・無効レイヤー・参照切れ・予算超過を拒否することを検査する。

## 現在の制限

- [CFLT-AUTH-001](../../.concept/conflicts.yml): login APIは `session_...`、ドメインの `verifyToken` は `session-...` を扱う。相互利用時に互換性がない。暫定扱いと反転条件は [AMB-AUTH-001](../../.concept/ambiguities.yml) にある。実装の修復や本番認証の検証は未実施。
- `EventManager.rendering.test.tsx` は日本語の日付表示を期待する。ローカルでの再現コマンドは `LC_ALL=ja_JP.UTF-8 LANG=ja_JP.UTF-8 TZ=Asia/Tokyo npm test -- --runInBand`。ロケール非依存化は未対応。
- `node_modules/.bin/eslint .` は未使用変数など既存43エラーで失敗する。概念構造のPASSと全体lintの結果を混同しない。
- 旧概念には最終更新run情報がなく、TTLだけを根拠とした削除は実施していない。今回のGCは重複制約と過去のdecisionキャッシュの整理に限定した。

検証記録は [log.md](log.md)、リポ間関係は [relations.md](relations.md)。
