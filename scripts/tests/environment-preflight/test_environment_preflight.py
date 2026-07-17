#!/usr/bin/env python3
"""Fixture tests for the environment preflight validator."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
VALIDATOR = ROOT / "scripts" / "validate-environment-preflight.py"
SCOPE_VALIDATOR = ROOT / "scripts" / "validate-task-scope.py"
MANIFEST_VALIDATOR = ROOT / "scripts" / "validate-task-scope-manifest.py"
FIXTURES = ROOT / "implementation" / "workflow-state" / "fixtures" / "environment-preflight"

TASK_ID = "TEST-001"


def run(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    return subprocess.run(
        command,
        cwd=cwd,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=merged_env,
    )


def must_run(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> None:
    result = run(command, cwd, env=env)
    if result.returncode != 0:
        raise AssertionError(f"command failed: {' '.join(command)}\n{result.stdout}\n{result.stderr}")


def write_file(root: Path, relative_path: str, content: str) -> None:
    path = root / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def copy_repo_file(root: Path, relative_path: str) -> None:
    src = ROOT / relative_path
    dst = root / relative_path
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def task_manifest(task_id: str, allowed_task_file: str = TASK_ID) -> dict[str, object]:
    return {
        "task_id": task_id,
        "task_title": "Fixture Environment Preflight",
        "owning_module": "AI Engineering Framework",
        "assigned_role": "DevOps Agent",
        "lifecycle_state": "READY",
        "target_branch": "development",
        "allowed_files": [
            {
                "path": f"implementation/tasks/ai-engineering-framework/{allowed_task_file}-environment-preflight.md",
                "match_type": "exact_file",
                "access": "read_write",
                "rationale": "fixture task file",
            },
            {
                "path": "implementation/codex-prompts/ai-engineering-framework/*.md",
                "match_type": "directory_glob",
                "access": "read_write",
                "rationale": "fixture prompts",
            },
            {
                "path": "implementation/evidence/TEST-001/**",
                "match_type": "recursive_glob",
                "access": "generated_evidence",
                "rationale": "fixture evidence",
            },
        ],
        "forbidden_files": [
            {
                "path": "docs/blueprint/**",
                "match_type": "recursive_glob",
                "access": "read",
                "rationale": "blueprint is out of scope",
            }
        ],
        "required_documents": [
            "AGENTS.md",
            "docs/ai-engineering-framework/90-agent-response-contract.md",
            f"implementation/workflow-state/manifests/{task_id}.json",
        ],
        "required_mip": "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md",
        "required_adrs": [],
        "dependencies": [
            {"task_id": "DEP-001", "required_state": "DONE"},
            {"task_id": "DEP-002", "required_state": "DONE"},
        ],
        "expected_evidence_paths": [
            "implementation/evidence/TEST-001/implementation.md",
        ],
        "required_commands": [
            "python3 scripts/validate-environment-preflight.py TEST-001",
        ],
        "permitted_lifecycle_transitions": [
            {
                "from": "READY",
                "to": "IN_PROGRESS",
                "authorized_role": "DevOps Agent",
            }
        ],
        "cross_module_access": {
            "allowed": False,
            "mode": "none",
            "modules": [],
            "rationale": "fixture has no cross-module access",
        },
        "generated_at": "2026-07-17T00:00:00Z",
        "manifest_version": "1.0",
    }


def scenario_settings(scenario: str) -> dict[str, object]:
    manifest_required = scenario in {
        "dirty_repository_state",
        "scope_isolation_failure",
        "missing_scope_manifest",
        "invalid_scope_manifest",
        "manifest_required_present",
        "manifest_required_missing",
        "manifest_required_invalid",
    }
    if scenario in {
        "dirty_repository_state",
        "scope_isolation_failure",
        "manifest_required_present",
    }:
        manifest_state = "present"
    elif scenario in {
        "missing_scope_manifest",
        "manifest_required_missing",
    }:
        manifest_state = "missing"
    elif scenario in {
        "invalid_scope_manifest",
        "manifest_required_invalid",
    }:
        manifest_state = "invalid"
    else:
        manifest_state = "absent"

    return {
        "task_status": "DRAFT" if scenario == "lifecycle_mismatch" else "READY",
        "dependency_states": (
            {"DEP-001": "DONE", "DEP-002": "BLOCKED"}
            if scenario == "dependency_failure"
            else {"DEP-001": "DONE", "DEP-002": "DONE"}
        ),
        "manifest_required": manifest_required,
        "manifest_state": manifest_state,
        "include_structure": scenario != "missing_repository_structure",
    }


def base_task_text(status: str = "READY", manifest_required: bool = False) -> str:
    required_documents = ""
    if manifest_required:
        required_documents = """
## Required Documents

- `implementation/workflow-state/manifests/TEST-001.json`
"""

    return f"""# TEST-001. Fixture Environment Preflight

## Task ID
`TEST-001`

## Status
`{status}`

## Category
`AI_ENGINEERING_WORKFLOW`

## Priority
`P0`

## Complexity
`M`

## Estimated Context Size
`Small`

## Assigned Role
`DevOps Agent`

## Owning Module
`AI Engineering Framework`

## Module Implementation Package
`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`

{required_documents}
## Dependencies

- `DEP-001` must be `DONE`.
- `DEP-002` must be `DONE`.
"""


def base_repo(
    root: Path,
    *,
    task_status: str = "READY",
    dependency_states: dict[str, str] | None = None,
    manifest: dict[str, object] | None = None,
    manifest_required: bool = False,
    manifest_state: str = "absent",
    include_structure: bool = True,
) -> None:
    must_run(["git", "init", "-b", "development"], root)
    must_run(["git", "config", "user.email", "fixture@example.test"], root)
    must_run(["git", "config", "user.name", "Fixture Test"], root)

    dependency_states = dependency_states or {"DEP-001": "DONE", "DEP-002": "DONE"}

    write_file(root, "AGENTS.md", "# Fixture AGENTS\n")
    write_file(root, "docs/ai-engineering-framework/79-agent-registry.md", "# Fixture registry\n")
    write_file(root, "docs/ai-engineering-framework/80-agent-workflow.md", "# Fixture workflow\n")
    write_file(root, "docs/ai-engineering-framework/82-dispatcher-command-standard.md", "# Fixture dispatcher\n")
    write_file(root, "docs/ai-engineering-framework/90-agent-response-contract.md", "# Fixture response contract\n")
    write_file(root, "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md", "# Fixture MIP\n")
    write_file(
        root,
        "implementation/tasks/ai-engineering-framework/TEST-001-environment-preflight.md",
        base_task_text(task_status, manifest_required=manifest_required),
    )
    write_file(
        root,
        "implementation/TASK-STATUS.md",
        """# Task Status

| Task | Title | Status | Branch | Review | Notes |
|---|---|---|---|---|---|
| DEP-001 | Dependency One | {dep1} | `development` | Pending | Fixture dependency |
| DEP-002 | Dependency Two | {dep2} | `development` | Pending | Fixture dependency |
| TEST-001 | Fixture Environment Preflight | {task} | `development` | Pending | Fixture task |
""".format(dep1=dependency_states["DEP-001"], dep2=dependency_states["DEP-002"], task=task_status),
    )
    write_file(
        root,
        "implementation/tasks/ai-engineering-framework/TASK-INDEX.md",
        """# Task Index

| Task | Title | Role | Dependencies | Status |
|---|---|---|---|---|
| DEP-001 | Dependency One | DevOps Agent | None | {dep1} |
| DEP-002 | Dependency Two | DevOps Agent | None | {dep2} |
| TEST-001 | Fixture Environment Preflight | DevOps Agent | DEP-001, DEP-002 | {task} |
""".format(dep1=dependency_states["DEP-001"], dep2=dependency_states["DEP-002"], task=task_status),
    )
    write_file(root, "implementation/codex-prompts/ai-engineering-framework/TEST-001-implementation.md", "# Implementation prompt\n")
    write_file(root, "implementation/codex-prompts/ai-engineering-framework/TEST-001-review.md", "# Review prompt\n")
    write_file(root, "implementation/codex-prompts/ai-engineering-framework/TEST-001-qa.md", "# QA prompt\n")
    write_file(root, "implementation/workflow-state/schemas/task-scope-manifest.schema.json", "{}\n")
    write_file(root, "implementation/workflow-state/fixtures/environment-preflight/.keep", "")
    write_file(root, "scripts/tests/environment-preflight/.keep", "")
    if manifest_state in {"present", "invalid"}:
        manifest_payload = dict(manifest or task_manifest(TASK_ID))
        if manifest_state == "invalid":
            manifest_payload["manifest_version"] = "2.0"
        write_file(root, "implementation/workflow-state/manifests/TEST-001.json", json.dumps(manifest_payload, indent=2))

    copy_repo_file(root, "scripts/validate-task-scope.py")
    copy_repo_file(root, "scripts/validate-task-scope-manifest.py")

    must_run(["git", "add", "."], root)
    must_run(["git", "commit", "-m", "fixture base"], root)


def run_validator(repo_root: Path, *, format: str = "json", env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    command = [sys.executable, str(VALIDATOR), TASK_ID, "--repo-root", str(repo_root), "--format", format]
    return run(command, ROOT, env=env)


def load_fixture(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def assert_check_status(output: dict[str, object], name: str, status: str) -> None:
    checks = {check["name"]: check["status"] for check in output["checks"]}  # type: ignore[index]
    if checks.get(name) != status:
        raise AssertionError(f"expected {name}={status}, got {checks.get(name)} in {output}")


def assert_fixture(path: Path) -> None:
    fixture = load_fixture(path)
    scenario = fixture["scenario"]
    output_format = fixture.get("output_format", "json")
    with tempfile.TemporaryDirectory(prefix=f"env-preflight-{scenario}-") as tmp_dir:
        repo_root = Path(tmp_dir)
        if scenario == "invalid_git_state":
            repo_root.mkdir(parents=True, exist_ok=True)
            result = run_validator(repo_root, format="json")
            output = json.loads(result.stdout)
            if output["overall_status"] != "FAIL" or output["can_continue"] != "NO":
                raise AssertionError(f"{scenario}: expected fail output, got {output}")
            assert_check_status(output, "repository_state", "FAIL")
            assert_check_status(output, "git_state", "FAIL")
            return

        settings = scenario_settings(scenario)
        manifest_payload = task_manifest(TASK_ID) if settings["manifest_state"] in {"present", "invalid"} else None
        base_repo(
            repo_root,
            task_status=str(settings["task_status"]),
            dependency_states=dict(settings["dependency_states"]),
            manifest=manifest_payload,
            manifest_required=bool(settings["manifest_required"]),
            manifest_state=str(settings["manifest_state"]),
            include_structure=bool(settings["include_structure"]),
        )

        if scenario in {"dirty_repository_state", "scope_isolation_failure"}:
            write_file(repo_root, "notes/dirty.txt", "dirty\n")
        if scenario == "scope_isolation_failure":
            write_file(repo_root, "docs/blueprint/out-of-scope.md", "forbidden\n")
        if scenario == "missing_repository_structure":
            shutil.rmtree(repo_root / "scripts" / "tests" / "environment-preflight")

        extra_env: dict[str, str] | None = None
        if scenario == "missing_tool":
            extra_env = {"PATH": str(repo_root / "no-git-bin")}

        result = run_validator(repo_root, format=str(output_format), env=extra_env)
        if output_format == "json":
            output = json.loads(result.stdout)
            if scenario in {
                "preflight_pass",
                "clean_repository_state",
                "machine_readable_output",
                "human_readable_output",
                "manifest_not_required",
                "manifest_not_required_no_manifests_dir",
            }:
                if output["overall_status"] != "PASS" or output["can_continue"] != "YES":
                    raise AssertionError(f"{scenario}: expected pass output, got {output}")
                for check_name in (
                    "repository_state",
                    "git_state",
                    "lifecycle_state",
                    "task_state",
                    "dependency_completion",
                    "scope_manifest",
                    "scope_isolation",
                    "required_tools",
                    "repository_structure",
                ):
                    assert_check_status(output, check_name, "PASS")
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "PASS")
                if "scope manifest is not required for this task" not in next(
                    check["details"] for check in output["checks"] if check["name"] == "scope_manifest"
                ):
                    raise AssertionError(f"{scenario}: expected scope_manifest not-required detail, got {output}")
            elif scenario == "dirty_repository_state":
                assert_check_status(output, "git_state", "FAIL")
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "FAIL")
                if output["can_continue"] != "NO":
                    raise AssertionError(f"{scenario}: expected CAN_CONTINUE NO, got {output}")
            elif scenario == "lifecycle_mismatch":
                assert_check_status(output, "lifecycle_state", "FAIL")
                assert_check_status(output, "scope_manifest", "PASS")
            elif scenario == "dependency_failure":
                assert_check_status(output, "dependency_completion", "FAIL")
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "PASS")
            elif scenario in {"missing_scope_manifest", "manifest_required_missing"}:
                assert_check_status(output, "scope_manifest", "FAIL")
                assert_check_status(output, "scope_isolation", "FAIL")
            elif scenario in {"invalid_scope_manifest", "manifest_required_invalid"}:
                assert_check_status(output, "scope_manifest", "FAIL")
                assert_check_status(output, "scope_isolation", "FAIL")
            elif scenario == "scope_isolation_failure":
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "FAIL")
            elif scenario == "manifest_required_present":
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "PASS")
                details = next(check["details"] for check in output["checks"] if check["name"] == "scope_manifest")
                if "validated at implementation/workflow-state/manifests/TEST-001.json" not in details:
                    raise AssertionError(f"{scenario}: expected manifest validation detail, got {output}")
            elif scenario == "missing_tool":
                assert_check_status(output, "required_tools", "FAIL")
            elif scenario == "missing_repository_structure":
                assert_check_status(output, "repository_structure", "FAIL")
                assert_check_status(output, "scope_manifest", "PASS")
                assert_check_status(output, "scope_isolation", "PASS")
            else:
                raise AssertionError(f"unhandled scenario: {scenario}")
        else:
            stdout = result.stdout
            if "Can Continue: YES" not in stdout and scenario in {"preflight_pass", "clean_repository_state", "human_readable_output"}:
                raise AssertionError(f"{scenario}: expected human-readable pass output, got {stdout}")
            if "repository_state" not in stdout or "git_state" not in stdout:
                raise AssertionError(f"{scenario}: expected check names in human-readable output, got {stdout}")

        if scenario in {
            "preflight_pass",
            "clean_repository_state",
            "machine_readable_output",
            "human_readable_output",
            "manifest_not_required",
            "manifest_not_required_no_manifests_dir",
            "manifest_required_present",
        } and result.returncode != 0:
            raise AssertionError(f"{scenario}: expected zero exit, got {result.returncode}\n{result.stdout}\n{result.stderr}")
        if scenario not in {
            "preflight_pass",
            "clean_repository_state",
            "machine_readable_output",
            "human_readable_output",
            "manifest_not_required",
            "manifest_not_required_no_manifests_dir",
            "manifest_required_present",
        } and result.returncode == 0:
            raise AssertionError(f"{scenario}: expected non-zero exit")


def main() -> int:
    for fixture_path in sorted(FIXTURES.glob("*.json")):
        assert_fixture(fixture_path)
    print("task environment preflight fixture tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
