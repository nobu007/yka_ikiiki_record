#!/usr/bin/env python3
"""Fail when the tracked tree cannot be copied for verification.

The ai-hub harness prepares a verification copy by enumerating tracked and
untracked files. A tracked entry that is a directory in the worktree (an
orphan submodule gitlink without a ``.gitmodules`` mapping) aborts that copy
with ``verification_copy_special_input``, so the candidate is never judged and
the run lands with zero commits.

Usage: ``python3 scripts/check_tracked_tree.py``
"""

from __future__ import annotations

import configparser
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GITLINK_MODE = "160000"


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", "-C", str(REPO_ROOT), *args],
        capture_output=True,
        text=True,
        check=True,
        timeout=30,
    ).stdout


def _tracked_entries() -> list[tuple[str, str]]:
    raw = _git("ls-files", "--stage", "-z")
    entries: list[tuple[str, str]] = []
    for record in raw.split("\0"):
        if not record:
            continue
        meta, _, path = record.partition("\t")
        entries.append((meta.split(" ", 1)[0], path))
    return entries


def _submodule_paths() -> set[str]:
    modules = REPO_ROOT / ".gitmodules"
    if not modules.is_file():
        return set()
    parser = configparser.ConfigParser()
    try:
        parser.read_string(modules.read_text(encoding="utf-8"))
    except (configparser.Error, OSError, UnicodeDecodeError):
        return set()
    paths: set[str] = set()
    for section in parser.sections():
        if not section.startswith("submodule"):
            continue
        value = parser.get(section, "path", fallback="").strip().strip('"')
        if value:
            paths.add(value)
    return paths


def main() -> int:
    submodules = _submodule_paths()
    problems: list[str] = []
    for mode, path in _tracked_entries():
        if mode == GITLINK_MODE:
            if path not in submodules:
                problems.append(
                    f"orphan submodule entry (no .gitmodules mapping): {path}"
                )
            continue
        target = REPO_ROOT / path
        if target.is_symlink() or not target.exists():
            continue
        if not target.is_file():
            problems.append(
                f"tracked path is not a regular file in the worktree: {path}"
            )
    for problem in problems:
        print(f"FAIL: {problem}")
    if problems:
        print(f"{len(problems)} tracked-tree problem(s) found")
        return 1
    print("OK: tracked tree is copyable (no orphan gitlinks, no tracked directories)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
