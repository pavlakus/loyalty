#!/usr/bin/env python3
"""Validate Git changes against a V2-001 task scope manifest."""

from __future__ import annotations

import argparse
import fnmatch
import importlib.util
import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Any


MANIFEST_RELATIVE_PATH = Path("implementation") / "workflow-state" / "manifests"
MANIFEST_VALIDATOR = Path(__file__).resolve().parent / "validate-task-scope-manifest.py"
UNRELATED_DIRTY_POLICIES = {"allow", "block"}


@dataclass(frozen=True)
class PathRule:
    path: str
    match_type: str
    access: str


@dataclass
class GitChange:
    status: str
    paths: list[str]
    staged: bool
    unstaged: bool
    untracked: bool
    renamed: bool
    deleted: bool
    classifications: list[str] = field(default_factory=list)
    blocking: bool = False
    reason: str = ""


def repository_relative(path: str) -> bool:
    if not path or path.startswith("/") or "\\" in path:
        return False
    return ".." not in PurePosixPath(path).parts


def load_manifest_validator() -> Any:
    spec = importlib.util.spec_from_file_location("task_scope_manifest_validator", MANIFEST_VALIDATOR)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load manifest validator: {MANIFEST_VALIDATOR}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_git(repo_root: Path, args: list[str]) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        ["git", "-C", str(repo_root), *args],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def resolve_repo_root(repo_root_arg: str | None) -> tuple[Path | None, str | None]:
    if repo_root_arg:
        root = Path(repo_root_arg).resolve()
        if not root.exists():
            return None, f"repository root does not exist: {root}"
        return root, None

    result = run_git(Path.cwd(), ["rev-parse", "--show-toplevel"])
    if result.returncode != 0:
        return None, result.stderr.decode("utf-8", errors="replace").strip() or "not inside a Git repository"
    return Path(result.stdout.decode("utf-8").strip()).resolve(), None


def load_manifest(repo_root: Path, task_id: str) -> tuple[dict[str, Any] | None, Path, list[str], str, str | None]:
    manifest_path = repo_root / MANIFEST_RELATIVE_PATH / f"{task_id}.json"
    if not manifest_path.exists():
        return None, manifest_path, [f"missing scope manifest: {manifest_path.relative_to(repo_root)}"], "missing_manifest", "missing_manifest"

    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return None, manifest_path, [f"invalid manifest JSON: {exc}"], "invalid_manifest", "invalid_manifest"

    validator = load_manifest_validator()
    errors = list(validator.validate_manifest(data))
    if data.get("task_id") != task_id:
        errors.append(f"manifest task_id does not match active task: {data.get('task_id')} != {task_id}")
    errors.extend(validate_scope_manifest_semantics(data))
    if errors:
        return data, manifest_path, errors, "invalid_manifest", "invalid_manifest"
    return data, manifest_path, [], "valid", None


def validate_scope_manifest_semantics(manifest: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    allowed_rules = manifest.get("allowed_files", [])
    forbidden_rules = manifest.get("forbidden_files", [])

    if isinstance(allowed_rules, list) and isinstance(forbidden_rules, list):
        for allowed_index, allowed in enumerate(allowed_rules):
            if not isinstance(allowed, dict):
                continue
            allowed_path = allowed.get("path")
            for forbidden_index, forbidden in enumerate(forbidden_rules):
                if not isinstance(forbidden, dict):
                    continue
                forbidden_path = forbidden.get("path")
                if allowed_path and forbidden_path and allowed_path == forbidden_path:
                    errors.append(
                        "allowed_files and forbidden_files overlap: "
                        f"allowed_files[{allowed_index}] and forbidden_files[{forbidden_index}]"
                    )

    task_id = manifest.get("task_id")
    if isinstance(task_id, str):
        for rule_list_name in ("allowed_files", "forbidden_files"):
            rule_list = manifest.get(rule_list_name, [])
            if not isinstance(rule_list, list):
                continue
            for index, rule in enumerate(rule_list):
                if not isinstance(rule, dict):
                    continue
                path = rule.get("path")
                if not isinstance(path, str):
                    continue
                if path.startswith("implementation/evidence/"):
                    active_prefix = f"implementation/evidence/{task_id}/"
                    if not path.startswith(active_prefix):
                        errors.append(
                            f"{rule_list_name}[{index}] generated evidence path is not for active task"
                        )

    return errors


def parse_git_status(raw: bytes) -> list[GitChange]:
    if not raw:
        return []

    fields = raw.decode("utf-8", errors="surrogateescape").split("\0")
    changes: list[GitChange] = []
    index = 0
    while index < len(fields):
        entry = fields[index]
        index += 1
        if not entry:
            continue
        if len(entry) < 4:
            changes.append(
                GitChange(
                    status="!!",
                    paths=[entry],
                    staged=False,
                    unstaged=False,
                    untracked=False,
                    renamed=False,
                    deleted=False,
                    blocking=True,
                    reason="unparseable git status entry",
                )
            )
            continue

        status = entry[:2]
        path = entry[3:]
        x_status = status[0]
        y_status = status[1]
        untracked = status == "??"
        renamed = "R" in status or "C" in status
        deleted = "D" in status
        paths = [path]
        if renamed and index < len(fields):
            old_path = fields[index]
            index += 1
            if old_path:
                paths.append(old_path)

        changes.append(
            GitChange(
                status=status,
                paths=dedupe(paths),
                staged=(x_status not in {" ", "?"}),
                unstaged=(y_status not in {" ", "?"}),
                untracked=untracked,
                renamed=renamed,
                deleted=deleted,
            )
        )

    return changes


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            result.append(value)
            seen.add(value)
    return result


def rule_from_manifest(rule: Any) -> PathRule | None:
    if not isinstance(rule, dict):
        return None
    path = rule.get("path")
    match_type = rule.get("match_type")
    access = rule.get("access")
    if not isinstance(path, str) or not isinstance(match_type, str) or not isinstance(access, str):
        return None
    return PathRule(path=path, match_type=match_type, access=access)


def matches_rule(path: str, rule: PathRule) -> bool:
    if rule.match_type == "exact_file":
        return path == rule.path

    if rule.match_type == "directory_glob":
        if not fnmatch.fnmatchcase(path, rule.path):
            return False
        return len(PurePosixPath(path).parts) == len(PurePosixPath(rule.path).parts)

    if rule.match_type == "recursive_glob":
        return fnmatch.fnmatchcase(path, rule.path)

    if rule.match_type == "explicit_exclusion":
        return fnmatch.fnmatchcase(path, rule.path)

    return False


def evaluate_path(path: str, task_id: str, allowed_rules: list[PathRule], forbidden_rules: list[PathRule]) -> tuple[str, bool, str]:
    if not repository_relative(path):
        return "invalid_path", True, "path is not repository-relative or contains parent traversal"

    if path.startswith("implementation/evidence/"):
        active_prefix = f"implementation/evidence/{task_id}/"
        if not path.startswith(active_prefix):
            return "forbidden_active_task_change", True, "generated evidence path is not for the active task"

    if any(matches_rule(path, rule) for rule in forbidden_rules):
        return "forbidden_active_task_change", True, "path matches forbidden scope"

    if any(matches_rule(path, rule) for rule in allowed_rules):
        return "allowed_active_task_change", False, "path matches allowed scope"

    return "unrelated_dirty_file", False, "path is outside allowed scope"


def evaluate_changes(
    task_id: str,
    manifest: dict[str, Any],
    changes: list[GitChange],
    unrelated_dirty_policy: str,
) -> list[GitChange]:
    allowed_rules = [
        rule
        for rule in (rule_from_manifest(item) for item in manifest.get("allowed_files", []))
        if rule is not None and rule.match_type != "explicit_exclusion"
    ]
    forbidden_rules = [
        rule
        for rule in (rule_from_manifest(item) for item in manifest.get("forbidden_files", []))
        if rule is not None
    ]
    allowed_exclusions = [
        rule
        for rule in (rule_from_manifest(item) for item in manifest.get("allowed_files", []))
        if rule is not None and rule.match_type == "explicit_exclusion"
    ]
    forbidden_rules.extend(allowed_exclusions)

    for change in changes:
        path_results = [evaluate_path(path, task_id, allowed_rules, forbidden_rules) for path in change.paths]
        change.classifications = dedupe([classification for classification, _, _ in path_results])
        blocking_results = [result for result in path_results if result[1]]
        unrelated_dirty_present = any(classification == "unrelated_dirty_file" for classification, _, _ in path_results)
        if unrelated_dirty_policy == "block" and unrelated_dirty_present:
            blocking_results.append(("unrelated_dirty_file", True, "caller policy blocks unrelated dirty files"))
        if blocking_results:
            change.blocking = True
            change.reason = "; ".join(dedupe([reason for _, _, reason in blocking_results]))
        else:
            change.blocking = False
            change.reason = "all paths are allowed"
        if change.renamed and any(classification != "allowed_active_task_change" for classification, _, _ in path_results):
            change.blocking = True
            change.reason = "renamed file source or destination is outside allowed scope"
        if change.deleted and any(classification != "allowed_active_task_change" for classification, _, _ in path_results):
            change.blocking = True
            change.reason = "deleted file is outside allowed scope"

    return changes


def change_to_dict(change: GitChange) -> dict[str, Any]:
    return {
        "status": change.status,
        "paths": change.paths,
        "staged": change.staged,
        "unstaged": change.unstaged,
        "untracked": change.untracked,
        "renamed": change.renamed,
        "deleted": change.deleted,
        "classifications": change.classifications,
        "blocking": change.blocking,
        "reason": change.reason,
    }


def build_output(
    task_id: str,
    repo_root: Path | None,
    manifest_path: Path | None,
    manifest_state: str,
    manifest_failure_code: str | None,
    unrelated_dirty_policy: str,
    manifest_errors: list[str],
    changes: list[GitChange],
    git_error: str | None = None,
) -> dict[str, Any]:
    blocking_changes = [change for change in changes if change.blocking]
    status = "PASS" if not manifest_errors and not git_error and not blocking_changes else "FAIL"
    return {
        "task_id": task_id,
        "status": status,
        "repo_root": str(repo_root) if repo_root else None,
        "manifest_path": str(manifest_path) if manifest_path else None,
        "manifest_state": manifest_state,
        "manifest_failure_code": manifest_failure_code,
        "unrelated_dirty_policy": unrelated_dirty_policy,
        "manifest_errors": manifest_errors,
        "git_error": git_error,
        "summary": {
            "total_changes": len(changes),
            "blocking_changes": len(blocking_changes),
            "allowed_changes": sum(
                1 for change in changes if change.classifications == ["allowed_active_task_change"] and not change.blocking
            ),
            "unrelated_dirty_files": sum(
                1 for change in changes if "unrelated_dirty_file" in change.classifications
            ),
            "forbidden_changes": sum(
                1 for change in changes if "forbidden_active_task_change" in change.classifications
            ),
            "invalid_paths": sum(1 for change in changes if "invalid_path" in change.classifications),
        },
        "changes": [change_to_dict(change) for change in changes],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Git changes against a task scope manifest.")
    parser.add_argument("task_id")
    parser.add_argument("--repo-root", help="Repository root to inspect. Defaults to the current Git root.")
    parser.add_argument(
        "--unrelated-dirty-policy",
        choices=sorted(UNRELATED_DIRTY_POLICIES),
        default="allow",
        help="Policy for unrelated dirty worktree files.",
    )
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()

    repo_root, repo_error = resolve_repo_root(args.repo_root)
    if repo_error or repo_root is None:
        output = build_output(
            args.task_id,
            None,
            None,
            "invalid_manifest",
            "invalid_manifest",
            args.unrelated_dirty_policy,
            [repo_error or "repository root resolution failed"],
            [],
        )
        print_output(output, args.format)
        return 1

    manifest, manifest_path, manifest_errors, manifest_state, manifest_failure_code = load_manifest(repo_root, args.task_id)
    changes: list[GitChange] = []
    git_error: str | None = None

    if not manifest_errors and manifest is not None:
        result = run_git(repo_root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])
        if result.returncode != 0:
            git_error = result.stderr.decode("utf-8", errors="replace").strip() or "git status failed"
        else:
            changes = evaluate_changes(
                args.task_id,
                manifest,
                parse_git_status(result.stdout),
                args.unrelated_dirty_policy,
            )

    output = build_output(
        args.task_id,
        repo_root,
        manifest_path,
        manifest_state,
        manifest_failure_code,
        args.unrelated_dirty_policy,
        manifest_errors,
        changes,
        git_error,
    )
    print_output(output, args.format)
    return 0 if output["status"] == "PASS" else 1


def print_output(output: dict[str, Any], output_format: str) -> None:
    if output_format == "json":
        print(json.dumps(output, indent=2, sort_keys=True))
        return

    print(f"Task: {output['task_id']}")
    print(f"Status: {output['status']}")
    print(f"Manifest State: {output['manifest_state']}")
    if output["manifest_failure_code"]:
        print(f"Manifest Failure Code: {output['manifest_failure_code']}")
    print(f"Unrelated Dirty Policy: {output['unrelated_dirty_policy']}")
    for error in output["manifest_errors"]:
        print(f"Manifest error: {error}")
    if output["git_error"]:
        print(f"Git error: {output['git_error']}")
    for change in output["changes"]:
        print(
            f"{change['status']} {' | '.join(change['paths'])} "
            f"=> {', '.join(change['classifications'])} ({change['reason']})"
        )


if __name__ == "__main__":
    raise SystemExit(main())
