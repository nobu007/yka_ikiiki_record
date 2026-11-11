# Wiki log

Meaningful changes to verified knowledge in this repository.

## 2026-11-11 — Initial relations memo

- Created `docs/llm-wiki/relations.md` and `docs/llm-wiki/index.md`.
- Recorded the confirmed relationship with **ai-hub**: ai-hub's monitoring tool
  (`tools/monitoring/llm_analyzer.py`) writes `data/llm_analysis_<UTC>.md` into
  this repository's checkout because it resolves the report directory from
  `Path.home()`, and two of its unit tests do not patch `Path.home()`.
- Recorded the change rule that ties this to the `post_dispatch: target worktree
  is dirty after dispatch` failure: the effective ignore rules in this
  repository (`.gitignore` generated from `.gitignore.distribution` +
  `.gitignore.local`) decide whether ai-hub's host-local outputs are visible as
  untracked files.
- Left one open follow-up for ai-hub (`Path.home()` patching in
  `tests/monitoring/test_llm_analyzer.py`); it is not completed here because the
  change belongs to the upstream repository.
