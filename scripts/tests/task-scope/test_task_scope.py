#!/usr/bin/env python3
"""Fixture tests for the V2-002 task scope validator."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
VALIDATOR = ROOT / "scripts" / "validate-task-scope.py"
FIXTURES = ROOT / "implementation" / "workflow-state" / "fixtures" / "task-scope"

FIXTURE_NAMES = [
    "valid-clean-task-diff.json",
    "valid-allowed-untracked-file.json",
    "staged-only-allowed-change.json",
    "mixed-staged-unstaged-change.json",
    "forbidden-tracked-change.json",
    "forbidden-untracked-file.json",
    "allowed-forbidden-overlap.json",
    "unrelated-dirty-worktree-file.json",
    "renamed-file-outside-scope.json",
    "deleted-file-outside-scope.json",
    "missing-scope-manifest.json",
    "invalid-manifest.json",
]

BASE_FILES = {
    "README.md": "base readme\n",
    "implementation/tasks/TEST-001.md": "base task\n",
    "docs/blueprint/01-product-vision.md": "base blueprint\n",
    "docs/ai-engineering-framework/base.md": "base framework doc\n",
}


def run(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=cwd,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def must_run(command: list[str], cwd: Path) -> None:
    result = run(command, cwd)
    if result.returncode != 0:
        raise AssertionError(f"command failed: {' '.join(command)}\n{result.stdout}\n{result.stderr}")


def write_file(root: Path, relative_path: str, content: str) -> None:
    path = root / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def base_manifest(task_id: str) -> dict[str, Any]:
    return {
        "task_id": task_id,
        "task_title": "Fixture Task",
        "owning_module": "AI Engineering Framework",
        "assigned_role": "DevOps Agent",
        "lifecycle_state": "READY",
        "target_branch": "development",
        "allowed_files": [
            {
                "path": "implementation/tasks/TEST-001.md",
                "match_type": "exact_file",
                "access": "read_write",
                "rationale": "Fixture task file"
            },
            {
                "path": "docs/ai-engineering-framework/*.md",
                "match_type": "directory_glob",
                "access": "read_write",
                "rationale": "Fixture framework docs"
            },
            {
                "path": "implementation/evidence/TEST-001/**",
                "match_type": "recursive_glob",
                "access": "generated_evidence",
                "rationale": "Fixture evidence"
            }
        ],
        "forbidden_files": [
            {
                "path": "docs/blueprint/**",
                "match_type": "recursive_glob",
                "access": "read",
                "rationale": "Blueprint is out of scope"
            }
        ],
        "required_documents": [
            "AGENTS.md"
        ],
        "required_mip": "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md",
        "required_adrs": [],
        "dependencies": [],
        "expected_evidence_paths": [
            "implementation/evidence/TEST-001/implementation.md"
        ],
        "required_commands": [
            "python3 scripts/validate-task-scope.py TEST-001"
        ],
        "permitted_lifecycle_transitions": [
            {
                "from": "READY",
                "to": "IN_PROGRESS",
                "authorized_role": "DevOps Agent"
            }
        ],
        "cross_module_access": {
            "allowed": False,
            "mode": "none",
            "modules": [],
            "rationale": "Fixture has no cross-module access"
        },
        "generated_at": "2026-07-16T00:00:00Z",
        "manifest_version": "1.0"
    }


def fixture_manifest(task_id: str, variant: str) -> dict[str, Any] | None:
    if variant == "missing":
        return None
    manifest = base_manifest(task_id)
    if variant == "overlap":
        manifest["forbidden_files"].append(
            {
                "path": "implementation/tasks/TEST-001.md",
                "match_type": "exact_file",
                "access": "read",
                "rationale": "Overlap fixture"
            }
        )
    if variant == "invalid":
        manifest["manifest_version"] = "2.0"
    return manifest


def prepare_repo(root: Path, fixture: dict[str, Any]) -> None:
    must_run(["git", "init"], root)
    must_run(["git", "config", "user.email", "fixture@example.test"], root)
    must_run(["git", "config", "user.name", "Fixture Test"], root)

    for relative_path, content in BASE_FILES.items():
        write_file(root, relative_path, content)

    manifest = fixture_manifest(fixture["task_id"], fixture["manifest"])
    if manifest is not None:
        manifest_path = root / "implementation" / "workflow-state" / "manifests" / f"{fixture['task_id']}.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    must_run(["git", "add", "."], root)
    must_run(["git", "commit", "-m", "base"], root)

    for change in fixture["changes"]:
        action = change["action"]
        path = change["path"]
        if action == "modify":
            write_file(root, path, change.get("content", "modified\n"))
        elif action == "untracked":
            write_file(root, path, change.get("content", "untracked\n"))
        elif action == "stage":
            must_run(["git", "add", path], root)
        elif action == "delete":
            (root / path).unlink()
        elif action == "rename":
            new_path = change["new_path"]
            (root / new_path).parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(root / path), str(root / new_path))
        else:
            raise AssertionError(f"unknown fixture action: {action}")


def run_validator(
    repo_root: Path,
    task_id: str,
    extra_args: list[str] | None = None,
) -> tuple[int, dict[str, Any]]:
    command = [sys.executable, str(VALIDATOR), task_id]
    if extra_args:
        command.extend(extra_args)
    command.extend(["--repo-root", str(repo_root)])
    result = run(command, ROOT)
    try:
        output = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise AssertionError(f"validator did not return JSON: {exc}\n{result.stdout}\n{result.stderr}") from exc
    return result.returncode, output


def assert_fixture(fixture_path: Path) -> None:
    fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory(prefix="task-scope-") as tmp_dir:
        repo_root = Path(tmp_dir)
        prepare_repo(repo_root, fixture)
        returncode, output = run_validator(repo_root, fixture["task_id"])

    expected_status = fixture["expected_status"]
    if output["status"] != expected_status:
        raise AssertionError(f"{fixture_path.name}: expected {expected_status}, got {output['status']}: {output}")
    if expected_status == "PASS" and returncode != 0:
        raise AssertionError(f"{fixture_path.name}: expected zero exit, got {returncode}")
    if expected_status == "FAIL" and returncode == 0:
        raise AssertionError(f"{fixture_path.name}: expected non-zero exit")

    expected_manifest_state = fixture.get("expected_manifest_state", "valid")
    if output["manifest_state"] != expected_manifest_state:
        raise AssertionError(
            f"{fixture_path.name}: expected manifest_state {expected_manifest_state}, got {output['manifest_state']}"
        )

    expected_failure_code = fixture.get("expected_manifest_failure_code")
    if expected_failure_code != output["manifest_failure_code"]:
        raise AssertionError(
            f"{fixture_path.name}: expected manifest_failure_code {expected_failure_code}, got {output['manifest_failure_code']}"
        )

    expected_manifest_error = fixture.get("expected_manifest_error_contains")
    if expected_manifest_error:
        errors = "\n".join(output["manifest_errors"])
        if expected_manifest_error not in errors:
            raise AssertionError(f"{fixture_path.name}: missing manifest error {expected_manifest_error}: {errors}")

    expected_classifications = set(fixture.get("expected_classifications", []))
    if expected_classifications:
        actual_classifications = {
            classification
            for change in output["changes"]
            for classification in change["classifications"]
        }
        if not expected_classifications.issubset(actual_classifications):
            raise AssertionError(
                f"{fixture_path.name}: expected classifications {expected_classifications}, got {actual_classifications}"
            )

    expected_change = fixture.get("expected_change")
    if expected_change:
        if len(output["changes"]) != 1:
            raise AssertionError(f"{fixture_path.name}: expected exactly one change, got {len(output['changes'])}")
        change = output["changes"][0]
        for field, expected_value in expected_change.items():
            if change.get(field) != expected_value:
                raise AssertionError(
                    f"{fixture_path.name}: expected change[{field}]={expected_value}, got {change.get(field)}"
                )

    expected_policy = fixture.get("expected_unrelated_dirty_policy", "allow")
    if output["unrelated_dirty_policy"] != expected_policy:
        raise AssertionError(
            f"{fixture_path.name}: expected unrelated_dirty_policy {expected_policy}, got {output['unrelated_dirty_policy']}"
        )

    if output["summary"]["total_changes"] != len(output["changes"]):
        raise AssertionError(f"{fixture_path.name}: summary does not account for all changes")

    if fixture.get("policy_block_check"):
        with tempfile.TemporaryDirectory(prefix="task-scope-policy-") as tmp_dir:
            repo_root = Path(tmp_dir)
            prepare_repo(repo_root, fixture)
            block_returncode, block_output = run_validator(
                repo_root,
                fixture["task_id"],
                ["--unrelated-dirty-policy", "block"],
            )
        if block_output["status"] != "FAIL":
            raise AssertionError(
                f"{fixture_path.name}: expected block-policy run to fail, got {block_output['status']}: {block_output}"
            )
        if block_returncode == 0:
            raise AssertionError(f"{fixture_path.name}: expected block-policy run to return non-zero exit")
        if block_output["manifest_failure_code"] != output["manifest_failure_code"]:
            raise AssertionError(f"{fixture_path.name}: block-policy run changed manifest failure code")
        if "unrelated_dirty_file" not in "".join(block_output["changes"][0]["classifications"]):
            raise AssertionError(f"{fixture_path.name}: block-policy run did not classify unrelated dirty file")
        if not block_output["changes"][0]["blocking"]:
            raise AssertionError(f"{fixture_path.name}: block-policy run did not block unrelated dirty file")


def main() -> int:
    missing = [name for name in FIXTURE_NAMES if not (FIXTURES / name).exists()]
    if missing:
        print(f"missing task scope fixtures: {', '.join(missing)}", file=sys.stderr)
        return 1

    for fixture_name in FIXTURE_NAMES:
        assert_fixture(FIXTURES / fixture_name)

    print("task scope validator fixture tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
