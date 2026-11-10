# Repository relations
Repository: yka_ikiiki_record

## tas_autopilot
- Status: confirmed
- Relationship: provider — the tas_autopilot control plane owns the publish lane
  (`post_dispatch`) that turns this repository's commits into the PR-first,
  CI-gated landing; this repository is a consumer of that lane and never pushes
  itself (see `LOOP.md`: push / force-push / deploy are forbidden to the agent).
- Responsibility: tas_autopilot owns `post_dispatch` and its conservative Git-write
  guard `post_dispatch_git_guard` (stale-`index.lock` recovery, concurrency
  exclusion, and the "target worktree is dirty after dispatch" gate). This
  repository owns its content, its working tree and the state of its own `.git`
  directory; it does not own the guard, the host policy or the landing policy.
- Canonical sources: tas_autopilot:`tas_autopilot/control_plane/post_dispatch_git_guard.py`,
  tas_autopilot:`tas_autopilot/control_plane/post_dispatch.py`,
  yka_ikiiki_record:`LOOP.md` (push/landing ownership rule).
- Change rule: when the guard's stale-lock recovery or the host `/proc` visibility
  policy changes, re-run this repository's publish lane before treating a
  `push_failed` inbox item as a repository-local defect. The guard's own module
  docstring states that the recovery "is Linux-only and refuses incomplete
  process visibility or an operation in progress", so a visibility denial is a
  host-readiness boundary, not a per-repository Git hazard.
- Evidence: tas_autopilot:tas_autopilot/control_plane/post_dispatch_git_guard.py sha256:d8d5ee1765c9a1d63245b3dd5605de7397bf38cd36930eb6b335abe604ca4990
- Evidence: tas_autopilot:tas_autopilot/control_plane/post_dispatch.py sha256:dc462e20dba9648eba64fff57b76a53b2007d27732c813b48f4e26da35f94950
- Evidence: yka_ikiiki_record:LOOP.md sha256:784c66f360c30c3c4c88ab84325f4e4a04a5368e7bef632c7455879e3bc6d2fa
- Observation: The guard's `_assert_no_lock_owner()` proves lock ownership by
  iterating every same-owner process under `/proc` and reading its `fd` directory
  (`post_dispatch_git_guard.py`, the `ProcessVisibilityUnavailable` branch).
  On this host `/proc/sys/kernel/yama/ptrace_scope` is `1`, so that read is
  denied for same-uid processes that are not ancestors of the caller, and the
  guard fails closed instead of recovering the lock.
- Observation: The reproduction of the filed signature on this repository
  (2026-11-10) raised `ProcessVisibilityUnavailable: index.lock retained:
  incomplete process visibility: process 163330 inspection denied: [Errno 13]
  Permission denied: '/proc/163330/fd'` — the identical detail filed to the
  control-plane inbox as `push_failed`. Process 163330 was `sshd` owned by
  `jinno`.
- Observation: This repository carried an empty `.git/index.lock` (inode
  12589718, mtime 2026-11-07T23:14:33+09:00, owner `jinno`) left behind by an
  interrupted git write; Git had written the index at 2026-11-07T19:58:32, so no
  index write was in flight. It was quarantined — moved, not deleted — to
  `/home/jinno/.local/state/tas_autopilot/dirty_care/yka_ikiiki_record/20261110/index.lock.stale-20261107T2314`,
  which unblocked the publish lane for this repository.
- Observation: Verbatim output of the guard verification command, run with
  `cwd=/home/jinno/tas_autopilot` on 2026-11-10 (exit status 0):
  `python3 -c "from pathlib import Path; from tas_autopilot.control_plane.post_dispatch_git_guard import git_write_transaction, recover_stale_index_lock; print('recover ->', recover_stale_index_lock(Path('/home/jinno/yka_ikiiki_record/.git'))); ctx = git_write_transaction(Path('/home/jinno/yka_ikiiki_record')); ctx.__enter__(); ctx.__exit__(None, None, None); print('transaction_ok')"`
  produced
  `recover -> None`
  `transaction_ok`
  (no `ProcessVisibilityUnavailable`, no `GitWriteBlocked`).
- Observation: Verbatim `stat` output for the quarantined lock and for the
  removed path (2026-11-10):
  `/home/jinno/.local/state/tas_autopilot/dirty_care/yka_ikiiki_record/20261110/index.lock.stale-20261107T2314 inode=12589718 size=0 mtime=2026-11-07 23:14:33.500514170 +0900 owner=jinno`
  `sha256sum -> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty file)
  `stat: cannot statx '/home/jinno/yka_ikiiki_record/.git/index.lock': No such file or directory`
  The inode of the quarantined file is the inode of the removed lock, so the
  removal stays reversible.
- Follow-up: [ ] tas_autopilot — the same stale-lock / visibility failure blocks
  the publish lane of at least 16 further home checkouts (an empty
  `.git/index.lock` exists in ai-hub, ai-hub_agent_proxy, hermes-agent,
  narrative_ops, serena, setup, skill-hub, agent-pm, fill_ai, proof_ai,
  research-artifacts-llm-wiki, instructions, antigravity-sdk, computer-use-kiro,
  AntigravityManager and tas_launchops-content), and the caretaker log shows the
  identical `push_failed` signature for several of them. Completion condition:
  either the guard can establish lock ownership without unprivileged
  `/proc/<pid>/fd` visibility, or the host policy allows it, and the stale locks
  are quarantined so that the publish lane recovers for all affected repositories.

## host-linux-proc-visibility
- Status: hypothesis
- Relationship: operator — the Linux host policy (`kernel.yama.ptrace_scope`,
  `/proc` hidepid, process dumpability) determines whether the publish lane's
  stale-lock recovery can run at all.
- Responsibility: the host (its setup/automation owner) owns the kernel
  visibility policy; the fleet services own how they react to it.
- Canonical sources: the host setting `/proc/sys/kernel/yama/ptrace_scope`; no
  `ptrace_scope` setting was found under `setup/` or `tas_autopilot/`, so the
  distribution default (`1`) appears unmanaged by the fleet.
- Change rule: when the host kernel visibility policy changes, re-check the
  fleet's `push_failed` backlog for the `host process visibility unavailable`
  signature before quarantining more `index.lock` files.
- Evidence: tas_autopilot:tas_autopilot/control_plane/post_dispatch_git_guard.py sha256:d8d5ee1765c9a1d63245b3dd5605de7397bf38cd36930eb6b335abe604ca4990
- Observation: `/proc/sys/kernel/yama/ptrace_scope` reads `1` and
  `/proc/sys/kernel/hidepid` does not exist on this host; reading
  `/proc/163330/fd` for the same-uid `sshd` process raises `EACCES` for a
  non-ancestor caller.
- Follow-up: [ ] host-policy owner — decide whether the TAS service account
  should be granted `/proc` fd visibility (e.g. `ptrace_scope=0` or
  `CAP_SYS_PTRACE`) or whether the guard should be changed instead. Completion
  condition: the fleet publish lane stops reporting `host process visibility
  unavailable` without per-repository lock quarantine.

## ai-hub-target-verifier
- Status: confirmed
- Relationship: provider — ai-hub supplies the integrity verifier that gates the
  receipt for this repository; this repository is a consumer of it and must keep
  its tracked tree parseable.
- Responsibility: ai-hub owns `tools/target_verifiers/minimal_check.py` and the
  rule that every tracked `.js`/`.mjs`/`.cjs` file must pass `node --check`.
  This repository owns the parseability of its own tracked files.
- Canonical sources: ai-hub:`tools/target_verifiers/minimal_check.py`.
- Change rule: when the verifier's file set or syntax rule changes, re-run it
  against this repository before treating a receipt failure as a repository
  defect.
- Evidence: ai-hub:tools/target_verifiers/minimal_check.py sha256:748f14bf30cbc2699a6774f3f7f9e10dc63d882f29ca16e0f295fd234590897d
- Observation: On the base commit `89c44d4a` the tracked `jest.setup.js` carried
  two TypeScript-only casts, `(global.fetch as jest.MockedFunction<typeof
  fetch>).mockClear()` and `.mockReset()`, inside a plain `.js` file. The
  verifier therefore reported `FAIL jest.setup.js: SyntaxError: Node.js
  v26.12.1` and exited 1, which is what made the previous care chain end as
  `chain_evaluation_failed`. The defect predates this branch: `git show
  89c44d4a:jest.setup.js | node --check` reproduces `SyntaxError: Unexpected
  identifier 'as'`.
- Observation: The casts were replaced by plain `global.fetch.mockClear()` /
  `global.fetch.mockReset()` calls (the mocked fetch lifecycle is unchanged,
  because `global.fetch` is assigned a `jest.fn()` mock above). After the
  change `node --check jest.setup.js` exits 0 and the verifier output is
  `minimal_check: 612 tracked files passed syntax/structure check` with exit
  status 0.

## contracts-local-artifacts-gitignored
- Status: confirmed
- Relationship: consumer — the contracts registry policy `local-artifacts-gitignored`
  governs which host-local Agent state this repository may track; this
  repository consumes it through its `.gitignore`.
- Responsibility: the contracts registry owns the policy and its
  repository-root exceptions; this repository owns the `.gitignore` rule that
  implements it; tas_autopilot's `post_dispatch` refuses to publish commits
  that newly track host-local `.audit` state.
- Canonical sources: contracts:`registry/policies/local-artifacts-gitignored.yaml`,
  tas_autopilot:`tas_autopilot/control_plane/post_dispatch.py` (the
  `_PERSISTENT_AUDIT_PATHS` repository-root exceptions).
- Change rule: when the policy or its exception list changes, re-check this
  repository's `.gitignore` against the fleet copies in ai-hub and tas_autopilot
  before changing which `.audit` paths are tracked.
- Evidence: contracts:registry/policies/local-artifacts-gitignored.yaml sha256:3c07e9b108f01ee9713928239489f0a471039a7e097c52b6196e2ce46b7dff7a
- Evidence: tas_autopilot:.gitignore sha256:ffb5afc4924d426c3a8251e1fb0d42a028822cd6b6b055d631bfb79d4095e648
- Evidence: ai-hub:.gitignore sha256:011502a084f1186c37de331106701598410c89d10918aed5a12a03c1ee140366
- Observation: The fleet copies of the rule are `/.audit/` plus the comment
  "Host-local audit output. Historical tracked .audit files stay in git until a
  separately authorized untracking migration; new audit files are ignored."
  This repository had no `.audit` rule, so the runtime artifact
  `.audit/development_direction.yml` stayed untracked but visible, and
  `git status --porcelain` in the target checkout
  `/home/jinno/yka_ikiiki_record` was non-empty — which is exactly the
  condition `post_dispatch` reports as `post_dispatch: target worktree is dirty
  after dispatch` and blocks publication for.
- Observation: The 133 already tracked `.audit` files of this repository are
  untouched by the rule; `.gitignore` does not affect tracked paths, and the
  migration that would untrack them is a separately authorized change.
- Observation: The untracked runtime artifact was also quarantined on 2026-11-10
  (moved, not deleted) to
  `/home/jinno/.local/state/tas_autopilot/dirty_care/yka_ikiiki_record/20261110/development_direction.yml.untracked-20261110T0925`
  (18706 bytes). After that move `git status --porcelain` in the target
  checkout `/home/jinno/yka_ikiiki_record` is empty, and the `/.audit/` rule
  keeps the artifact ignored once this branch lands on the base branch.
- Observation: The repair commit `9d9bdc88` (lock quarantine, `jest.setup.js`
  syntax, `/.audit/` rule, this memo) existed only locally on
  `tas/auto-care/20261110`; the remote branch was still at `21eefaa8`, so PR #50
  did not contain the repair. The repository-side blockers were therefore
  still red in the landing path even though the local checkout was clean.
- Follow-up: [ ] tas_autopilot — the repair only reaches the landing path when
  the care branch is published (PR #50, `tas/auto-care/20261110`). Completion
  condition: the repair commit is present in PR #50 and the PR's checks report
  the state recorded in the `github-actions-ci` section below.

## github-actions-ci
- Status: confirmed
- Relationship: consumer — GitHub Actions is the required check suite for the
  TAS landing path (the PR body states "TAS will merge it after checks pass");
  this repository owns the workflow definitions and the tracked files those
  workflows parse.
- Responsibility: GitHub Actions owns the runner images and the Node.js
  toolchain it provisions; this repository owns the pinned `node-version`, the
  YAML/JSON files the validate job parses, and the tracked sources the build
  and unit-test jobs consume.
- Canonical sources: yka_ikiiki_record:`.github/workflows/ci.yml`,
  yka_ikiiki_record:`.github/workflows/infrastructure.yml`.
- Change rule: when the CI workflows change, re-run the same two local checks
  (`python -c "import yaml; yaml.safe_load(...)"` over the tracked YAML files
  and `node --check` over the tracked `.js` files) before opening or updating a
  care PR, so a failing check is not discovered only after publication.
- Evidence: yka_ikiiki_record:.github/workflows/ci.yml sha256:8157e67ab944f3e349a926beb6484a1d171fc2430f0d556dba669499df76d5f6
- Evidence: yka_ikiiki_record:.github/workflows/infrastructure.yml sha256:d0d46f67f59427af10b9a6f2010dc0efc88aa91341ed81d3a422a4ca9375e312
- Evidence: yka_ikiiki_record:.audit/analysis/gap.yml sha256:923ad1f479d45d7d38bea69b7c0f295a4fffd562d3a413fce0d95f1d612904cd
- Evidence: yka_ikiiki_record:package.json sha256:da52a31c97129222080aa9451d8f04597c170e7ff92581bb4d806a50b145eeb1
- Observation: PR #50 (`tas/auto-care/20261110` → `main`) was OPEN with
  `mergeStateStatus: UNSTABLE`; the `build` job of workflow `CI` and the
  `validate` job of workflow `Infrastructure CI/CD` both reported FAILURE, so
  the landing path could not complete.
- Observation: Verbatim `build` job output (2026-11-10, run 42788298910):
  `You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.`
  ` ELIFECYCLE  Command failed with exit code 1.`
  The workflow pinned `node-version: 18`; the pin is raised to `20` in this
  branch.
- Observation: Verbatim `validate` job output (2026-11-10, run 42788298789):
  `##[error]Process completed with exit code 123.`
  `xargs -I {}` exits 123 when one of the parsed files fails. The failing file
  was `.audit/analysis/gap.yml`, whose `root_cause_hypotheses` list mixed a
  sequence entry (`- hypothesis_1: ...`) with sibling keys at the sequence
  indentation. The local reproduction on the base commit was
  `yaml.parser.ParserError: while parsing a block collection in ".audit/analysis/gap.yml", line 44, column 7`
  `expected <block end>, but found '?' in ".audit/analysis/gap.yml", line 45, column 7`.
  The two sibling keys are now indented into the same mapping, and the file
  parses: `yaml.safe_load` returns the mapping
  `{"hypothesis_1": ..., "hypothesis_2": ..., "hypothesis_3": ...}` with its
  content unchanged.
- Observation: The tracked-file sweep that the validate job performs
  (`git ls-files '*.yml' '*.yaml'` and `git ls-files '*.json'`) now reports no
  failing file: `.audit/analysis/gap.yml` was the only YAML file that failed
  and no tracked JSON file fails `json.load`.
- Follow-up: [ ] yka_ikiiki_record maintainers — keep the CI `node-version` at
  or above the minimum required by the pinned Next.js release and keep every
  tracked `.audit` YAML file parseable; the Infrastructure CI/CD validate job
  parses the whole tree, so a syntax error in a tracked audit file blocks the
  landing of unrelated changes. Completion condition: the `build` and
  `validate` jobs of PR #50 report SUCCESS.
