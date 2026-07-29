#!/usr/bin/env python3
"""Fixture-based dispatcher routing tests."""

from __future__ import annotations

import importlib.util
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
DISPATCHER_PATH = REPO_ROOT / "scripts/dispatch-agent-workflow.py"


def load_dispatcher():
    spec = importlib.util.spec_from_file_location("dispatch_agent_workflow", DISPATCHER_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules["dispatch_agent_workflow"] = module
    spec.loader.exec_module(module)
    return module


DISPATCHER = load_dispatcher()


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def task(task_id: str, status: str, mip: str | None = "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md") -> str:
    mip_section = ""
    if mip is not None:
        mip_section = f"""
## Module Implementation Package
`{mip}`
"""
    return f"""# {task_id}. Fixture Task

## Status
`{status}`
{mip_section}
"""


def response(task_id: str, status: str, role: str = "Review Agent") -> str:
    return f"""Task ID: {task_id}
Task Title: Fixture Task
Agent Role: {role}
Branch: test
Timestamp: 2026-07-16T00:00:00Z
Current Lifecycle State: TEST
Commit: fixture

## Executive Summary

- Fixture response.

## Status

{status}

## Findings

None

## Scope Reviewed

Changed files inspected. Security and documentation reviewed.

## Acceptance Criteria Review

Acceptance criteria covered.

## Evidence

- Commands executed: fixture.
- Validation results: fixture.
- Evidence files generated: fixture.
- Git evidence: fixture.
- Lifecycle evidence: fixture.
- Review evidence: fixture.
- QA evidence: fixture.

## Merge Recommendation

Proceed.

## Required Corrections

None

## Next Action

Run QA

## Workflow Result

Task ID: {task_id}
Current State: TEST
Next State: TEST
Next Responsible Agent: Fixture
Can Continue: YES
"""


def qa_response(task_id: str) -> str:
    return f"""Task ID: {task_id}
Task Title: Fixture Task
Agent Role: QA Agent
Branch: test
Timestamp: 2026-07-16T00:00:00Z
Current Lifecycle State: QA
Commit: fixture

## Executive Summary

- Fixture QA response.

## Status

QA APPROVED

## Findings

None

## Acceptance Criteria Validation

Acceptance criteria and mandatory test coverage passed. Failure-path coverage passed.

## QA Validation

Review precondition approved. Security and scope checks passed.

## Evidence

- Commands executed: fixture.
- Validation results: fixture.
- Evidence files generated: fixture.
- Git evidence: fixture.
- Lifecycle evidence: fixture.
- Review evidence: fixture.
- QA evidence: fixture.

## Merge Recommendation

Prepare merge.

## Required Corrections

None

## Next Action

Prepare Merge

## Workflow Result

Task ID: {task_id}
Current State: QA
Next State: READY_FOR_MERGE
Next Responsible Agent: Release Manager
Can Continue: YES
"""


def make_repo() -> tempfile.TemporaryDirectory[str]:
    temp = tempfile.TemporaryDirectory()
    root = Path(temp.name)
    write(root / "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md", "# MIP\n")
    (root / "scripts").mkdir(parents=True, exist_ok=True)
    shutil.copy(REPO_ROOT / "scripts/validate-agent-response.py", root / "scripts/validate-agent-response.py")
    for skill in ("task-preparation", "review", "qa", "dispatcher"):
        write(root / f".codex/skills/{skill}/SKILL.md", f"# {skill}\n")
    subprocess.run(["git", "init"], cwd=root, check=True, stdout=subprocess.PIPE)
    subprocess.run(["git", "config", "user.email", "fixture@example.test"], cwd=root, check=True)
    subprocess.run(["git", "config", "user.name", "Fixture"], cwd=root, check=True)
    write(root / "README.md", "fixture\n")
    subprocess.run(["git", "add", "."], cwd=root, check=True)
    subprocess.run(["git", "commit", "-m", "fixture"], cwd=root, check=True, stdout=subprocess.PIPE)
    return temp


def add_prompt(root: Path, task_id: str, phase: str, skill: str | None = None) -> None:
    skill_line = f"\nUse `.codex/skills/{skill}/SKILL.md`.\n" if skill else ""
    write(root / f"implementation/codex-prompts/ai-engineering-framework/{task_id}-{phase}.md", f"# Prompt\n{skill_line}")


def add_task(root: Path, task_id: str, status: str, mip: str | None = "implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md") -> None:
    write(root / f"implementation/tasks/ai-engineering-framework/{task_id}-fixture.md", task(task_id, status, mip))


def add_platform_backlog(root: Path, rows: list[tuple[str, str, str, str]], branches: dict[str, str] | None = None) -> None:
    branches = branches or {}
    index_lines = [
        "# Platform Foundation Task Index",
        "",
        "| Task | Title | Role | Dependencies | Status |",
        "|---|---|---|---|---|",
    ]
    status_lines = [
        "# Implementation Task Status",
        "",
        "| Task | Title | Status | Branch | Review | Notes |",
        "|---|---|---|---|---|---|",
    ]
    for task_id, task_status, deps, priority in rows:
        title = f"{task_id} Fixture"
        dependency_text = deps or "None"
        write(
            root / f"implementation/tasks/platform-foundation/{task_id}-fixture.md",
            f"""# {title}\n\n## Status\n`{task_status}`\n\n## Priority\n`{priority}`\n\n## Module Implementation Package\n`implementation/mip/MIP-AI-001-ai-engineering-framework-stabilization.md`\n""",
        )
        branch = branches.get(task_id, "")
        index_lines.append(f"| {task_id} | {title} | DevOps Agent | {dependency_text} | {task_status} |")
        status_lines.append(f"| {task_id} | {title} | {task_status} | `{branch}` | Pending | fixture |")
    write(root / "implementation/tasks/platform-foundation/TASK-INDEX.md", "\n".join(index_lines) + "\n")
    write(root / "implementation/TASK-STATUS.md", "\n".join(status_lines) + "\n")


def add_evidence(root: Path, task_id: str, *files: str) -> None:
    for name in files:
        if name == "review.md":
            write(root / f"implementation/evidence/{task_id}/{name}", response(task_id, "APPROVED"))
        elif name == "qa.md":
            write(root / f"implementation/evidence/{task_id}/{name}", qa_response(task_id))
        else:
            write(root / f"implementation/evidence/{task_id}/{name}", response(task_id, "READY FOR REVIEW", "DevOps Agent"))


def assert_blocked(fn, expected: str) -> None:
    try:
        fn()
    except DISPATCHER.DispatchError as exc:
        assert expected in str(exc), str(exc)
        return
    raise AssertionError(f"expected DispatchError containing {expected!r}")


def main() -> int:
    with make_repo() as temp:
        root = Path(temp)

        add_task(root, "LP-READY", "READY")
        add_prompt(root, "LP-READY", "implementation", "dispatcher")
        route = DISPATCHER.route(root, "execute", "LP-READY")
        assert route.command == "execute"
        assert route.skill_path and route.skill_path.name == "SKILL.md"
        assert route.mip_path.is_file()

        add_task(root, "LP-DRAFT", "DRAFT")
        add_prompt(root, "LP-DRAFT", "prepare", "task-preparation")
        assert DISPATCHER.route(root, "prepare", "LP-DRAFT").command == "prepare"

        add_task(root, "LP-REVIEW", "READY_FOR_REVIEW")
        add_prompt(root, "LP-REVIEW", "review", "review")
        add_evidence(root, "LP-REVIEW", "implementation.md")
        assert DISPATCHER.route(root, "review", "LP-REVIEW").command == "review"

        add_task(root, "LP-QA", "QA")
        add_prompt(root, "LP-QA", "qa", "qa")
        add_evidence(root, "LP-QA", "implementation.md", "review.md")
        assert DISPATCHER.route(root, "qa", "LP-QA").command == "qa"

        add_task(root, "LP-MERGED", "MERGED")
        add_evidence(root, "LP-MERGED", "implementation.md", "review.md", "qa.md")
        head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
        assert DISPATCHER.route(root, "close", "LP-MERGED", merged_commit=head).command == "close"

        add_task(root, "LP-STATUS", "BLOCKED")
        assert DISPATCHER.route(root, "status", "LP-STATUS").command == "status"

        assert_blocked(lambda: DISPATCHER.route(root, "status", "LP-UNKNOWN"), "unknown task id")
        assert_blocked(lambda: DISPATCHER.route(root, "execute", "LP-DRAFT"), "execute requires READY")

        add_task(root, "LP-MISSING-MIP", "READY", mip=None)
        add_prompt(root, "LP-MISSING-MIP", "implementation", "dispatcher")
        assert_blocked(lambda: DISPATCHER.route(root, "execute", "LP-MISSING-MIP"), "missing MIP reference")

        add_task(root, "LP-BROKEN-MIP", "READY", mip="implementation/mip/missing.md")
        add_prompt(root, "LP-BROKEN-MIP", "implementation", "dispatcher")
        assert_blocked(lambda: DISPATCHER.route(root, "execute", "LP-BROKEN-MIP"), "missing MIP file")

        add_task(root, "LP-MISSING-PROMPT", "READY")
        assert_blocked(lambda: DISPATCHER.route(root, "execute", "LP-MISSING-PROMPT"), "missing prompt")

        add_task(root, "LP-MISSING-EVIDENCE", "READY_FOR_REVIEW")
        add_prompt(root, "LP-MISSING-EVIDENCE", "review", "review")
        assert_blocked(lambda: DISPATCHER.route(root, "review", "LP-MISSING-EVIDENCE"), "missing required evidence")

        invalid = root / "invalid-response.md"
        write(invalid, "APPROVED\n")
        assert_blocked(
            lambda: DISPATCHER.route(root, "execute", "LP-READY", response=invalid),
            "status-only response is invalid",
        )

        invalid_contract = root / "invalid-contract.md"
        write(invalid_contract, "# Missing metadata\n")
        assert_blocked(
            lambda: DISPATCHER.route(root, "execute", "LP-READY", response=invalid_contract),
            "response contract validation failed",
        )

        add_task(root, "LP-CHANGES", "CHANGES_REQUIRED")
        add_prompt(root, "LP-CHANGES", "implementation", "dispatcher")
        assert_blocked(lambda: DISPATCHER.route(root, "execute", "LP-CHANGES"), "authorized CHANGES_REQUIRED")
        assert DISPATCHER.route(root, "execute", "LP-CHANGES", allow_correction=True).command == "execute"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-ACTIVE", "IN_PROGRESS", "", "P2"),
                ("LP-BACKLOG-READY", "READY", "", "P2"),
                ("LP-BACKLOG-DRAFT", "DRAFT", "", "P0"),
            ],
            branches={"LP-BACKLOG-ACTIVE": "agent/other/LP-BACKLOG-ACTIVE"},
        )
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-READY"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-ACTIVE", "IN_PROGRESS", "", "P2"),
                ("LP-BACKLOG-READY", "READY", "", "P2"),
                ("LP-BACKLOG-DRAFT", "DRAFT", "", "P0"),
            ],
            branches={"LP-BACKLOG-ACTIVE": "agent/current"},
        )
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-ACTIVE"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-BLOCKED", "DRAFT", "", "P1"),
            ],
        )
        index_text = (root / "implementation/tasks/platform-foundation/TASK-INDEX.md").read_text()
        (root / "implementation/tasks/platform-foundation/TASK-INDEX.md").write_text(index_text.replace("| DRAFT |", "| BLOCKED |"))
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-BLOCKED"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-DEPENDENCY", "DRAFT", "LP-BACKLOG-READY", "P0"),
                ("LP-BACKLOG-READY", "READY", "", "P1"),
            ],
        )
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-READY"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-FIRST", "DRAFT", "", "P1"),
                ("LP-BACKLOG-SECOND", "DRAFT", "", "P1"),
            ],
        )
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-FIRST"

        add_platform_backlog(
            root,
            [
                ("LP-BACKLOG-DONE", "DONE", "", "P1"),
                ("LP-BACKLOG-NEXT", "READY", "", "P1"),
            ],
        )
        selected = DISPATCHER.select_next_task(root, current_branch="agent/current")
        assert selected and selected.task_id == "LP-BACKLOG-NEXT"

        add_platform_backlog(root, [("LP-BACKLOG-OTHER", "DONE", "", "P1")])
        assert DISPATCHER.select_next_task(root, current_branch="agent/current") is None

        add_platform_backlog(root, [("LP-BACKLOG-DUPLICATE", "IN_PROGRESS", "", "P1")], branches={"LP-BACKLOG-DUPLICATE": "agent/other/LP-BACKLOG-DUPLICATE"})
        assert DISPATCHER.select_next_task(root, current_branch="agent/current") is None

    print("dispatcher fixture tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
