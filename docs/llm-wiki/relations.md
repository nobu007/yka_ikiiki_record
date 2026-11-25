# Repository relations
Repository: yka_ikiiki_record

## tas_autopilot
- Status: confirmed
- Relationship: provider — the tas_autopilot control plane owns the publish lane
  (`post_dispatch`) that turns this repository's commits into the PR-first,
  CI-gated landing; this repository is a consumer of that lane and cannot push
  itself (see the rule in `LOOP.md`).
- Responsibility: tas_autopilot owns `post_dispatch` and its conservative Git-write
  guard `post_dispatch_git_guard` (stale-`index.lock` recovery, concurrency
  exclusion). This repository owns its content, its own working tree and its
  `.git` directory state; it does not own the guard, the host policy or the
  landing policy.
- Canonical sources: tas_autopilot:`tas_autopilot/control_plane/post_dispatch_git_guard.py`,
  tas_autopilot:`tas_autopilot/control_plane/post_dispatch.py`,
  yka_ikiiki_record:`LOOP.md` (push/landing ownership rule).
- Change rule: when the guard's stale-lock recovery or the host `/proc` visibility
  policy changes, re-run this repository's publish lane before treating a
  `push_failed` inbox item as a repository-local defect. The guard's own rule
  states that recovery "is Linux-only and refuses incomplete process visibility
  or an operation in progress", so a visibility denial is a host-readiness
  boundary, not a per-repository Git hazard.
- Evidence: tas_autopilot:tas_autopilot/control_plane/post_dispatch_git_guard.py sha256:d8d5ee1765c9a1d63245b3dd5605de7397bf38cd36930eb6b335abe604ca4990
- Evidence: tas_autopilot:tas_autopilot/control_plane/post_dispatch.py sha256:dc462e20dba9648eba64fff57b76a53b2007d27732c813b48f4e26da35f94950
- Evidence: yka_ikiiki_record:LOOP.md sha256:784c66f360c30c3c4c88ab84325f4e4a04a5368e7bef632c7455879e3bc6d2fa
- Observation: The guard's `_assert_no_lock_owner()` proves lock ownership by
  reading `/proc/<pid>/fd` for every same-owner process. On this host
  `/proc/sys/kernel/yama/ptrace_scope` is `1`, so that read is denied for
  same-uid processes that are not ancestors of the caller.
- Observation: Reproduction on this repository (2026-11-10) raised
  `ProcessVisibilityUnavailable: index.lock retained: incomplete process
  visibility: process 163330 inspection denied: [Errno 13] Permission denied:
  '/proc/163330/fd'` — the identical signature filed to the control-plane inbox
  as `push_failed`. Process 163330 was `sshd` owned by `jinno`.
- Observation: This repository carried an empty `.git/index.lock` (inode
  12589718, mtime 2026-11-07T23:14:33+09:00, owner `jinno`) left behind by an
  interrupted git write; Git had written the index at 2026-11-07T19:58:32, so no
  index write was in flight. It was quarantined to
  `/home/jinno/.local/state/tas_autopilot/dirty_care/yka_ikiiki_record/20261110/index.lock.stale-20261107T2314`
  (sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855,
  empty file), which unblocked the publish lane for this repository:
  `recover_stale_index_lock()` now returns `None` and `git_write_transaction()`
  enters successfully.
- Follow-up: [ ] tas_autopilot — the same stale-lock/visibility failure blocks the
  publish lane of at least 16 home checkouts (empty `.git/index.lock` in
  ai-hub_agent_proxy, hermes-agent, narrative_ops, serena, setup, skill-hub,
  yka_ikiiki_record, ...), and the caretaker log shows the identical
  `push_failed` signature for several of them. Completion condition: either the
  guard can establish lock ownership without unprivileged `/proc/<pid>/fd`
  visibility, or the host policy allows it, and the stale locks are quarantined
  so that the publish lane recovers for all affected repositories.

## host-linux-proc-visibility
- Status: hypothesis
- Relationship: operator — the Linux host policy (`kernel.yama.ptrace_scope`,
  `/proc` hidepid, process dumpability) determines whether the publish lane's
  stale-lock recovery can run at all.
- Responsibility: the host (its setup/automation owner) owns the kernel
  visibility policy; the fleet services own how they react to it.
- Canonical sources: host `/proc/sys/kernel/yama/ptrace_scope`; no
  `ptrace_scope` setting was found under `setup/` or `tas_autopilot/`, so the
  distribution default (`1`) appears unmanaged by the fleet.
- Change rule: when the host kernel visibility policy changes, re-check the
  fleet's `push_failed` backlog for the `host process visibility unavailable`
  signature before quaranting more `index.lock` files.
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
