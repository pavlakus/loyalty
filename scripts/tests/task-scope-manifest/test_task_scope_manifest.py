#!/usr/bin/env python3
"""Fixture tests for the V2-001 task scope manifest validator."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
VALIDATOR = ROOT / "scripts" / "validate-task-scope-manifest.py"
VALID_EXAMPLE = ROOT / "implementation" / "workflow-state" / "examples" / "LP-AI-000004.scope.json"
FIXTURES = ROOT / "implementation" / "workflow-state" / "fixtures" / "task-scope-manifest"

INVALID_FIXTURES = {
    "missing-task-id.scope.json": "missing required field: task_id",
    "missing-mip.scope.json": "missing required field: required_mip",
    "empty-allowed-files.scope.json": "allowed_files must not be empty",
    "overlapping-allowed-forbidden.scope.json": "allowed_files and forbidden_files overlap",
    "invalid-lifecycle-transition.scope.json": "invalid lifecycle transition",
    "missing-evidence-paths.scope.json": "expected_evidence_paths must contain at least 1 item",
    "unknown-manifest-version.scope.json": "unknown manifest version: 2.0",
}


def run_validator(path: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), str(path)],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def main() -> int:
    valid_result = run_validator(VALID_EXAMPLE)
    if valid_result.returncode != 0:
        print(valid_result.stderr, file=sys.stderr)
        return 1

    for fixture, expected_error in INVALID_FIXTURES.items():
        result = run_validator(FIXTURES / fixture)
        if result.returncode == 0:
            print(f"expected invalid fixture to fail: {fixture}", file=sys.stderr)
            return 1
        if expected_error not in result.stderr:
            print(f"unexpected error for {fixture}: {result.stderr}", file=sys.stderr)
            return 1

    print("task scope manifest fixture tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
