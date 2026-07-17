#!/usr/bin/env python3
"""Validate repository and task readiness before implementation starts."""

from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TASK_STATUS_PATH = Path("implementation") / "TASK-STATUS.md"
TASK_INDEX_PATH = Path("implementation") / "tasks" / "ai-engineering-framework" / "TASK-INDEX.md"
TASK_PROMPT_DIR = Path("implementation") / "codex-prompts" / "ai-engineering-framework"
MANIFEST_DIR = Path("implementation") / "workflow-state" / "manifests"
SCHEMA_PATH = Path("implementation") / "workflow-state" / "schemas" / "task-scope-manifest.schema.json"
SCOPE_VALIDATOR_PATH = Path("scripts") / "validate-task-scope.py"
MANIFEST_VALIDATOR_PATH = Path("scripts") / "validate-task-scope-manifest.py"
REQUIRED_BRANCH = "development"

REQUIRED_STRUCTURE = (
    Path("AGENTS.md"),
    Path("docs") / "ai-engineering-framework" / "79-agent-registry.md",
    Path("docs") / "ai-engineering-framework" / "80-agent-workflow.md",
    Path("docs") / "ai-engineering-framework" / "82-dispatcher-command-standard.md",
    Path("docs") / "ai-engineering-framework" / "90-agent-response-contract.md",
    TASK_STATUS_PATH,
    TASK_INDEX_PATH,
    Path("implementation") / "mip" / "MIP-AI-001-ai-engineering-framework-stabilization.md",
    SCHEMA_PATH,
    Path("implementation") / "workflow-state" / "fixtures" / "environment-preflight",
    SCOPE_VALIDATOR_PATH,
    MANIFEST_VALIDATOR_PATH,
    Path("scripts") / "tests" / "environment-preflight",
)

REQUIRED_TOOLS = ("git",)


@dataclass(frozen=True)
class CheckResult:
    name: str
    status: str
    details: str


@dataclass(frozen=True)
class TaskContext:
    task_id: str
    task_path: Path
    task_title: str
    task_status: str
    assigned_role: str
    owning_module: str
    required_documents: list[str]
    status_row: list[str]
    index_row: list[str]
    dependencies: list[str]
    prompt_paths: list[Path]


def repository_relative(path: str) -> bool:
    if not path or path.startswith("/") or "\\" in path:
        return False
    return ".." not in Path(path).parts


def load_module(repo_root: Path, relative_path: Path, module_name: str) -> Any:
    module_path = repo_root / relative_path
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load module: {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_git(repo_root: Path, args: list[str]) -> subprocess.CompletedProcess[bytes]:
    try:
        return subprocess.run(
            ["git", "-C", str(repo_root), *args],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except FileNotFoundError:
        return subprocess.CompletedProcess(
            args=["git", "-C", str(repo_root), *args],
            returncode=127,
            stdout=b"",
            stderr=b"git command not found",
        )


def resolve_repo_root(repo_root_arg: str | None) -> tuple[Path | None, str | None]:
    if repo_root_arg:
        root = Path(repo_root_arg).resolve()
        if not root.exists():
            return None, f"repository root does not exist: {root}"
        return root, None

    result = run_git(Path.cwd(), ["rev-parse", "--show-toplevel"])
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        return None, message or "not inside a Git repository"
    return Path(result.stdout.decode("utf-8", errors="replace").strip()).resolve(), None


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_lines(path: Path) -> list[str]:
    return read_text(path).splitlines()


def split_table_row(line: str) -> list[str]:
    return [cell.strip().strip("`") for cell in line.strip().strip("|").split("|")]


def extract_section(text: str, heading: str) -> str | None:
    import re

    match = re.search(
        rf"^##\s+{re.escape(heading)}\s*$([\s\S]*?)(?=^##\s+|\Z)",
        text,
        re.MULTILINE,
    )
    if not match:
        return None
    return match.group(1).strip()


def extract_section_value(text: str, heading: str) -> str | None:
    section = extract_section(text, heading)
    if section is None:
        return None
    for line in section.splitlines():
        value = line.strip().strip("`")
        if value:
            return value
    return None


def extract_task_title(task_text: str) -> str | None:
    first_line = task_text.splitlines()[0].strip() if task_text.splitlines() else ""
    if first_line.startswith("# "):
        title = first_line[2:].strip()
        if ". " in title:
            return title.split(". ", 1)[1].strip()
        return title
    return None


def find_task_file(repo_root: Path, task_id: str) -> Path | None:
    matches = sorted((repo_root / "implementation" / "tasks").glob(f"**/{task_id}-*.md"))
    if len(matches) == 1:
        return matches[0]
    return None


def find_markdown_row(path: Path, task_id: str) -> list[str] | None:
    if not path.exists():
        return None
    for line in read_lines(path):
        stripped = line.strip()
        if stripped.startswith(f"| {task_id} |"):
            return split_table_row(stripped)
    return None


def parse_dependencies(task_text: str) -> list[str]:
    import re

    section = extract_section(task_text, "Dependencies")
    if section is None:
        return []
    dependencies: list[str] = []
    for line in section.splitlines():
        match = re.search(r"\b([A-Z][A-Z0-9-]*-\d+[A-Z0-9]*)\b", line)
        if match:
            dependencies.append(match.group(1))
    return dependencies


def parse_required_documents(task_text: str) -> list[str]:
    section = extract_section(task_text, "Required Documents")
    if section is None:
        return []
    documents: list[str] = []
    for line in section.splitlines():
        value = line.strip().lstrip("-").strip().strip("`")
        if value:
            documents.append(value)
    return documents


def build_task_context(repo_root: Path, task_id: str) -> tuple[TaskContext | None, str]:
    task_path = find_task_file(repo_root, task_id)
    if task_path is None:
        return None, f"task file not found for {task_id}"

    task_text = read_text(task_path)
    task_title = extract_task_title(task_text) or ""
    task_status = extract_section_value(task_text, "Status") or ""
    assigned_role = extract_section_value(task_text, "Assigned Role") or ""
    owning_module = extract_section_value(task_text, "Owning Module") or ""
    required_documents = parse_required_documents(task_text)
    status_row = find_markdown_row(repo_root / TASK_STATUS_PATH, task_id) or []
    index_row = find_markdown_row(repo_root / TASK_INDEX_PATH, task_id) or []
    dependencies = parse_dependencies(task_text)
    prompt_paths = [
        repo_root / TASK_PROMPT_DIR / f"{task_id}-implementation.md",
        repo_root / TASK_PROMPT_DIR / f"{task_id}-review.md",
        repo_root / TASK_PROMPT_DIR / f"{task_id}-qa.md",
    ]
    return (
        TaskContext(
            task_id=task_id,
            task_path=task_path,
            task_title=task_title,
            task_status=task_status,
            assigned_role=assigned_role,
            owning_module=owning_module,
            required_documents=required_documents,
            status_row=status_row,
            index_row=index_row,
            dependencies=dependencies,
            prompt_paths=prompt_paths,
        ),
        "",
    )


def check_repository_state(repo_root: Path, context: TaskContext | None, repo_error: str | None) -> CheckResult:
    if repo_error:
        return CheckResult("repository_state", "FAIL", repo_error)

    if context is None:
        return CheckResult("repository_state", "FAIL", "task context could not be resolved")

    branch_result = run_git(repo_root, ["branch", "--show-current"])
    if branch_result.returncode != 0:
        message = branch_result.stderr.decode("utf-8", errors="replace").strip() or "git branch failed"
        return CheckResult("repository_state", "FAIL", message)

    branch = branch_result.stdout.decode("utf-8", errors="replace").strip()
    if branch != REQUIRED_BRANCH:
        return CheckResult(
            "repository_state",
            "FAIL",
            f"repository branch is {branch or '<detached>'}; expected {REQUIRED_BRANCH}",
        )

    if not repo_root.exists() or not repo_root.is_dir():
        return CheckResult("repository_state", "FAIL", f"repository root is invalid: {repo_root}")

    return CheckResult(
        "repository_state",
        "PASS",
        f"repository root resolved to {repo_root} on branch {branch}",
    )


def manifest_required(context: TaskContext) -> tuple[bool, str]:
    canonical_manifest = f"implementation/workflow-state/manifests/{context.task_id}.json"
    for document in context.required_documents:
        if document == canonical_manifest or document.endswith("/task-scope-manifest.schema.json"):
            return True, f"scope manifest required by task documents: {canonical_manifest}"
        if "task scope manifest" in document.lower():
            return True, f"scope manifest required by task documents: {canonical_manifest}"
    return False, "scope manifest is not required for this task"


def check_git_state(repo_root: Path) -> CheckResult:
    result = run_git(repo_root, ["status", "--short", "--branch", "--untracked-files=all"])
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip() or "git status failed"
        return CheckResult("git_state", "FAIL", message)

    lines = [line for line in result.stdout.decode("utf-8", errors="replace").splitlines() if line.strip()]
    status_lines = [line for line in lines if not line.startswith("## ")]
    if status_lines:
        return CheckResult(
            "git_state",
            "FAIL",
            f"working tree is not clean: {len(status_lines)} change(s) detected",
        )

    return CheckResult("git_state", "PASS", "working tree is clean")


def check_lifecycle_state(context: TaskContext | None) -> CheckResult:
    if context is None:
        return CheckResult("lifecycle_state", "FAIL", "task context could not be resolved")
    if context.task_status != "READY":
        return CheckResult(
            "lifecycle_state",
            "FAIL",
            f"task lifecycle state is {context.task_status or '<missing>'}; expected READY",
        )
    return CheckResult("lifecycle_state", "PASS", "task lifecycle state is READY")


def check_task_state(context: TaskContext | None) -> CheckResult:
    if context is None:
        return CheckResult("task_state", "FAIL", "task context could not be resolved")

    issues: list[str] = []
    if not context.task_title:
        issues.append("task title missing from task file")
    if not context.assigned_role:
        issues.append("assigned role missing from task file")
    if not context.owning_module:
        issues.append("owning module missing from task file")
    if not context.status_row:
        issues.append(f"missing TASK-STATUS row for {context.task_id}")
    if not context.index_row:
        issues.append(f"missing TASK-INDEX row for {context.task_id}")
    for prompt_path in context.prompt_paths:
        if not prompt_path.exists():
            issues.append(f"missing prompt: {prompt_path.relative_to(prompt_path.parents[3])}")

    if issues:
        return CheckResult("task_state", "FAIL", "; ".join(issues))

    status_row = context.status_row
    index_row = context.index_row
    if len(status_row) < 5 or len(index_row) < 5:
        return CheckResult("task_state", "FAIL", "task status or index row is malformed")

    if status_row[1] != context.task_title:
        issues.append("TASK-STATUS title does not match task file title")
    if status_row[2] != context.task_status:
        issues.append("TASK-STATUS status does not match task file status")
    if status_row[3] != REQUIRED_BRANCH:
        issues.append("TASK-STATUS branch does not match required branch")
    if index_row[1] != context.task_title:
        issues.append("TASK-INDEX title does not match task file title")
    if index_row[2] != context.assigned_role:
        issues.append("TASK-INDEX role does not match task file assigned role")
    if index_row[4] != context.task_status:
        issues.append("TASK-INDEX status does not match task file status")

    if issues:
        return CheckResult("task_state", "FAIL", "; ".join(issues))

    return CheckResult("task_state", "PASS", "task metadata, prompts and status records are consistent")


def check_dependencies(repo_root: Path, context: TaskContext | None) -> CheckResult:
    if context is None:
        return CheckResult("dependency_completion", "FAIL", "task context could not be resolved")

    task_status_rows = {
        row[0]: row
        for row in (
            split_table_row(line)
            for line in read_lines(repo_root / TASK_STATUS_PATH)
            if line.strip().startswith("| ")
        )
        if row and row[0] != "Task"
    }
    task_index_rows = {
        row[0]: row
        for row in (
            split_table_row(line)
            for line in read_lines(repo_root / TASK_INDEX_PATH)
            if line.strip().startswith("| ")
        )
        if row and row[0] != "Task"
    }

    issues: list[str] = []
    for dependency in context.dependencies:
        status_row = task_status_rows.get(dependency)
        index_row = task_index_rows.get(dependency)
        if status_row is None:
            issues.append(f"missing TASK-STATUS row for dependency {dependency}")
            continue
        if index_row is None:
            issues.append(f"missing TASK-INDEX row for dependency {dependency}")
            continue
        if len(status_row) < 3 or len(index_row) < 5:
            issues.append(f"dependency row malformed for {dependency}")
            continue
        if status_row[2] != "DONE":
            issues.append(f"dependency {dependency} is {status_row[2]} in TASK-STATUS")
        if index_row[4] != "DONE":
            issues.append(f"dependency {dependency} is {index_row[4]} in TASK-INDEX")

    if issues:
        return CheckResult("dependency_completion", "FAIL", "; ".join(issues))
    return CheckResult("dependency_completion", "PASS", "all dependencies are marked DONE")


def check_required_tools() -> CheckResult:
    issues: list[str] = []
    if shutil.which("git") is None:
        issues.append("git command not found")
    if not Path(sys.executable).exists():
        issues.append(f"python runtime not found: {sys.executable}")
    if issues:
        return CheckResult("required_tools", "FAIL", "; ".join(issues))
    return CheckResult("required_tools", "PASS", "required tools are available")


def check_repository_structure(repo_root: Path) -> CheckResult:
    missing = [str(path) for path in REQUIRED_STRUCTURE if not (repo_root / path).exists()]
    if missing:
        return CheckResult("repository_structure", "FAIL", "missing required paths: " + ", ".join(missing))
    return CheckResult("repository_structure", "PASS", "required repository structure is present")


def validate_manifest(repo_root: Path, context: TaskContext) -> CheckResult:
    required, detail = manifest_required(context)
    manifest_path = repo_root / MANIFEST_DIR / f"{context.task_id}.json"
    if not required:
        return CheckResult("scope_manifest", "PASS", detail)

    if not manifest_path.exists():
        return CheckResult(
            "scope_manifest",
            "FAIL",
            f"missing scope manifest: {manifest_path.relative_to(repo_root)}",
        )

    try:
        manifest_data = json.loads(read_text(manifest_path))
    except json.JSONDecodeError as exc:
        return CheckResult("scope_manifest", "FAIL", f"invalid manifest JSON: {exc}")

    try:
        validator = load_module(repo_root, MANIFEST_VALIDATOR_PATH, "task_scope_manifest_validator")
    except Exception as exc:  # pragma: no cover - defensive
        return CheckResult("scope_manifest", "FAIL", f"cannot load manifest validator: {exc}")

    errors = list(validator.validate_manifest(manifest_data))
    if manifest_data.get("task_id") != context.task_id:
        errors.append(
            f"manifest task_id does not match active task: {manifest_data.get('task_id')} != {context.task_id}"
        )
    if errors:
        return CheckResult("scope_manifest", "FAIL", "; ".join(errors))
    return CheckResult(
        "scope_manifest",
        "PASS",
        f"scope manifest validated at {manifest_path.relative_to(repo_root)}",
    )


def validate_scope_isolation(repo_root: Path, context: TaskContext, git_available: bool) -> CheckResult:
    if not git_available:
        return CheckResult("scope_isolation", "FAIL", "git command not found; scope isolation validator not executed")

    required, detail = manifest_required(context)
    if not required:
        return CheckResult("scope_isolation", "PASS", detail)

    scope_validator = repo_root / SCOPE_VALIDATOR_PATH
    if not scope_validator.exists():
        return CheckResult("scope_isolation", "FAIL", f"missing scope validator: {scope_validator.relative_to(repo_root)}")

    result = subprocess.run(
        [
            sys.executable,
            str(scope_validator),
            context.task_id,
            "--repo-root",
            str(repo_root),
            "--unrelated-dirty-policy",
            "block",
            "--format",
            "json",
        ],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.stdout.strip():
        try:
            output = json.loads(result.stdout)
        except json.JSONDecodeError:
            output = None
    else:
        output = None

    if result.returncode != 0:
        if isinstance(output, dict):
            failures = ", ".join(output.get("manifest_errors", []) or [])
            git_error = output.get("git_error")
            if not failures and not git_error:
                failures = output.get("status", "FAIL")
            detail = f"scope validator failed: {failures or git_error or 'unknown reason'}"
        else:
            stderr = result.stderr.strip()
            detail = f"scope validator failed: {stderr or result.stdout.strip() or 'unknown reason'}"
        return CheckResult("scope_isolation", "FAIL", detail)

    if not isinstance(output, dict):
        return CheckResult("scope_isolation", "FAIL", "scope validator did not return machine-readable output")

    if output.get("status") != "PASS":
        failures = output.get("manifest_errors") or []
        change_failures = [
            f"{change.get('status')} {', '.join(change.get('paths', []))}: {change.get('reason', '')}"
            for change in output.get("changes", [])
            if change.get("blocking")
        ]
        detail_parts = [
            part
            for part in (
                "; ".join(failures) if failures else "",
                "; ".join(change_failures) if change_failures else "",
                output.get("git_error") or "",
            )
            if part
        ]
        return CheckResult("scope_isolation", "FAIL", "; ".join(detail_parts) or "scope validator reported FAIL")

    return CheckResult("scope_isolation", "PASS", "scope isolation validator returned PASS")


def build_checks(repo_root: Path | None, task_id: str, repo_error: str | None) -> tuple[list[CheckResult], Path | None]:
    checks: list[CheckResult] = []
    context: TaskContext | None = None
    tool_check = check_required_tools()
    git_available = tool_check.status == "PASS"
    if repo_root is not None and repo_error is None:
        context, context_error = build_task_context(repo_root, task_id)
        if context is None:
            checks.append(CheckResult("repository_state", "FAIL", context_error))
    checks.append(check_repository_state(repo_root or Path("."), context, repo_error))

    if repo_root is None or repo_error is not None:
        checks.extend(
            [
                CheckResult("git_state", "FAIL", repo_error or "repository root could not be resolved"),
                CheckResult("lifecycle_state", "FAIL", "repository root could not be resolved"),
                CheckResult("task_state", "FAIL", "repository root could not be resolved"),
                CheckResult("dependency_completion", "FAIL", "repository root could not be resolved"),
                CheckResult("scope_manifest", "FAIL", "repository root could not be resolved"),
                CheckResult("scope_isolation", "FAIL", "repository root could not be resolved"),
                tool_check,
                CheckResult("repository_structure", "FAIL", "repository root could not be resolved"),
            ]
        )
        return checks, None

    if context is None:
        checks.extend(
            [
                CheckResult("git_state", "FAIL", "task context could not be resolved"),
                CheckResult("lifecycle_state", "FAIL", "task context could not be resolved"),
                CheckResult("task_state", "FAIL", "task context could not be resolved"),
                CheckResult("dependency_completion", "FAIL", "task context could not be resolved"),
                CheckResult("scope_manifest", "FAIL", "task context could not be resolved"),
                CheckResult("scope_isolation", "FAIL", "task context could not be resolved"),
                tool_check,
                check_repository_structure(repo_root),
            ]
        )
        return checks, repo_root

    checks.extend(
            [
                check_git_state(repo_root),
                check_lifecycle_state(context),
                check_task_state(context),
                check_dependencies(repo_root, context),
                validate_manifest(repo_root, context),
                validate_scope_isolation(repo_root, context, git_available),
                tool_check,
                check_repository_structure(repo_root),
            ]
        )
    return checks, repo_root


def build_output(task_id: str, repo_root: Path | None, checks: list[CheckResult]) -> dict[str, Any]:
    failures = [{"name": check.name, "details": check.details} for check in checks if check.status != "PASS"]
    overall_status = "PASS" if not failures else "FAIL"
    return {
        "task_id": task_id,
        "repository_root": str(repo_root) if repo_root else None,
        "overall_status": overall_status,
        "can_continue": "YES" if not failures else "NO",
        "checks": [
            {"name": check.name, "status": check.status, "details": check.details}
            for check in checks
        ],
        "failures": failures,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def print_text(output: dict[str, Any]) -> None:
    print(f"Task ID: {output['task_id']}")
    print(f"Repository Root: {output['repository_root']}")
    print(f"Overall Status: {output['overall_status']}")
    print(f"Can Continue: {output['can_continue']}")
    print("Checks:")
    for check in output["checks"]:
        print(f"- {check['name']}: {check['status']} - {check['details']}")
    print("Failures:")
    if output["failures"]:
        for failure in output["failures"]:
            print(f"- {failure['name']}: {failure['details']}")
    else:
        print("- None")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate repository and task readiness before implementation starts.")
    parser.add_argument("task_id")
    parser.add_argument("--repo-root", help="Repository root to inspect. Defaults to the current Git root.")
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()

    repo_root, repo_error = resolve_repo_root(args.repo_root)
    checks, resolved_root = build_checks(repo_root, args.task_id, repo_error)
    output = build_output(args.task_id, resolved_root, checks)

    if args.format == "json":
        print(json.dumps(output, indent=2, sort_keys=True))
    else:
        print_text(output)

    return 0 if output["overall_status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
