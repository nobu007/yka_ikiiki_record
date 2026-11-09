# Repository relations
Repository: yka_ikiiki_record

## ai-hub
- Status: confirmed
- Relationship: provider — ai-hub's monitoring writer generates report artifacts inside this repository's working tree.
- Responsibility: ai-hub owns `tools/monitoring/llm_analyzer.py`, whose `main()` writes `llm_analysis_<UTC>.md` into `~/yka_ikiiki_record/data/`. This repository owns the ignore rule that keeps those externally generated files from dirtying the checkout, because the TAS self-push precondition is an empty `git status --porcelain` in the target checkout.
- Canonical sources: ai-hub:tools/monitoring/llm_analyzer.py; ai-hub:tests/monitoring/test_llm_analyzer.py; yka_ikiiki_record:.gitignore; yka_ikiiki_record:.gitignore.local; yka_ikiiki_record:scripts/monitoring-report-ignore.test.ts
- Change rule: when ai-hub's monitoring writer changes its output path or filename pattern, re-check the `data/llm_analysis_*.md` rule in this repo's `.gitignore` and re-verify that a monitoring run leaves `git status --porcelain` empty in `~/yka_ikiiki_record`. The same rule removal must keep `scripts/monitoring-report-ignore.test.ts` green.
- Evidence: ai-hub:tools/monitoring/llm_analyzer.py sha256:530d6968aabdde52d5534919886efdda3514eaa542b1d1fb10fad41869580779
- Evidence: ai-hub:tests/monitoring/test_llm_analyzer.py sha256:54883b405fe817bb7b4d9be85519a93eb24e8e4218183bd9a02f2ff6f5f525e6
- Evidence: yka_ikiiki_record:.gitignore sha256:160cd9184fefbc76c3a2870c0abb29955671baa20380e3fccd0adc2ad61e88bf
- Evidence: yka_ikiiki_record:.gitignore.local sha256:36720d47f7f3e7e3e771a8014b4cd6e20dde636160b823b0cb7d7f4fa90746a8
- Evidence: yka_ikiiki_record:scripts/monitoring-report-ignore.test.ts sha256:6a107163c00b83204b6ac4d69131a1a3f05494172c4a8d4fc58545b382d51e5b
- Observation: `tools/monitoring/llm_analyzer.py` `main()` resolves the report directory as `Path.home() / target_repo / "data"`, so the destination does not follow `AI_HUB_ROOT` or the checkout that is being dispatched.
- Observation: `tests/monitoring/test_llm_analyzer.py` `TestMain::test_main_full_flow_no_alert` and `TestMain::test_main_full_flow_with_alert` set `TARGET_REPO=yka_ikiiki_record` and patch only `AI_HUB_ROOT`; unlike `TestMain::test_main_report_write_pins_utf8` they do not patch `Path.home()`, so an ai-hub pytest run writes into the real `~/yka_ikiiki_record/data/`. The stray report content matches the test fixture exactly (health 20/100, `alert!`, `critical`, `fix it`, `broken`).
- Observation: `scripts/monitoring-report-ignore.test.ts` is the in-repo regression guard for this failure: it asserts the `data/llm_analysis_*.md` rule in both `.gitignore.local` and the merged `.gitignore`, and that `git check-ignore` matches a stray `data/llm_analysis_probe.md`. Removing the rule from `.gitignore` fails 2 of its 3 assertions, and a stray `data/llm_analysis_probe.md` leaves `git status --porcelain` empty in the target checkout while the rule is present.
- Follow-up: [ ] ai-hub — the monitoring unit tests call `LLMAnalyzer.main()` without redirecting `Path.home()`, so running the ai-hub test suite drops report files into the real `~/yka_ikiiki_record/data/` and re-dirties the checkout; completion condition: the tests patch `Path.home()` to a temporary directory (as `test_main_report_write_pins_utf8` already does) and a fresh ai-hub pytest run leaves no new file in `~/yka_ikiiki_record/data/`.
