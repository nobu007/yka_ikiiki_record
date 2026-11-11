# Repository relations
Repository: yka_ikiiki_record

## ai-hub
- Status: confirmed
- Relationship: operator/consumer — ai-hub runs chain and monitoring jobs against this repository's checkout and writes host-local artifacts into it.
- Responsibility: this repo owns the ignore rules that classify those artifacts as host-local (see `.gitignore.local` / `.gitignore`); ai-hub owns the writers that must not write into a real checkout during unit tests, and owns the audit/planning artifacts it generates under `.audit/`.
- Canonical sources: ai-hub `tools/monitoring/llm_analyzer.py` (report writer), ai-hub `tools/harness/runners/run_chain_repo.py` (`refresh_direction_if_stale`), ai-hub `tests/monitoring/test_llm_analyzer.py` (unit tests), this repo `.gitignore.distribution` / `.gitignore.local` / `.gitignore`.
- Change rule: when ai-hub changes where it writes chain artifacts (`.audit/development_direction.yml`, `data/llm_analysis_<UTC>.md`), inspect this repo's `.gitignore.local` and regenerate `.gitignore`; when this repo's ignore rules change, verify that `git status --porcelain` in a managed checkout stays empty after a chain run, because `tas_autopilot` `post_dispatch` fails with `post_dispatch: target worktree is dirty after dispatch` when untracked files remain while the local branch is ahead of origin.
- Evidence: yka_ikiiki_record:.gitignore sha256:330d4212c7afc4bec66e8fbe2828a6994fdd0f860f3638f9ff5b66b04765dda2
- Evidence: yka_ikiiki_record:.gitignore.local sha256:eeeee1f9d56c87f82addf15f458b12791f9cab6a6bafc8da77044de655c20f99
- Evidence: ai-hub:tools/monitoring/llm_analyzer.py sha256:530d6968aabdde52d5534919886efdda3514eaa542b1d1fb10fad41869580779
- Evidence: ai-hub:tests/monitoring/test_llm_analyzer.py sha256:54883b405fe817bb7b4d9be85519a93eb24e8e4218183bd9a02f2ff6f5f525e6
- Observation: `tools/monitoring/llm_analyzer.py` builds its report directory as `Path.home() / target_repo / "data"` (line 523) and writes `llm_analysis_<UTC>.md` there (line 526), so the write target is the real home checkout of the target repository, not a temporary directory.
- Observation: `tests/monitoring/test_llm_analyzer.py::TestMain::test_main_full_flow_no_alert` and `::test_main_full_flow_with_alert` create `tmp_path / "yka_ikiiki_record" / "data"` but do not patch `Path.home()`, unlike `test_main_report_write_pins_utf8` and the other tests in the same file, which do patch it. Those two tests therefore write the report into the real `~/yka_ikiiki_record/data/` directory, which produced the untracked `data/llm_analysis_*.md` files that blocked `post_dispatch`.
- Follow-up: [ ] ai-hub — patch `Path.home()` to `tmp_path` in `tests/monitoring/test_llm_analyzer.py::TestMain::test_main_full_flow_no_alert` and `::test_main_full_flow_with_alert` so test runs stop writing into real repository checkouts; completion condition: after running those two tests, `git status --porcelain` in `~/yka_ikiiki_record` reports no new `data/llm_analysis_*.md` entry.
