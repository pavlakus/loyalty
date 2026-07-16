#!/usr/bin/env python3
"""Validate a task scope manifest against the V2-001 manifest standard."""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import PurePosixPath
from typing import Any


REQUIRED_FIELDS = (
    "task_id",
    "task_title",
    "owning_module",
    "assigned_role",
    "lifecycle_state",
    "target_branch",
    "allowed_files",
    "forbidden_files",
    "required_documents",
    "required_mip",
    "required_adrs",
    "dependencies",
    "expected_evidence_paths",
    "required_commands",
    "permitted_lifecycle_transitions",
    "cross_module_access",
    "generated_at",
    "manifest_version",
)

LIFECYCLE_STATES = {
    "DRAFT",
    "TASK_PREPARATION",
    "READY",
    "ASSIGNED",
    "IN_PROGRESS",
    "IMPLEMENTATION_COMPLETE",
    "READY_FOR_REVIEW",
    "REVIEW",
    "CHANGES_REQUIRED",
    "QA",
    "READY_FOR_MERGE",
    "MERGED",
    "DONE",
    "BLOCKED",
    "CANCELLED",
    "DEFERRED",
}

VALID_TRANSITIONS = {
    ("DRAFT", "TASK_PREPARATION"),
    ("TASK_PREPARATION", "READY"),
    ("READY", "ASSIGNED"),
    ("ASSIGNED", "IN_PROGRESS"),
    ("READY", "IN_PROGRESS"),
    ("IN_PROGRESS", "IMPLEMENTATION_COMPLETE"),
    ("IMPLEMENTATION_COMPLETE", "READY_FOR_REVIEW"),
    ("IN_PROGRESS", "READY_FOR_REVIEW"),
    ("READY_FOR_REVIEW", "REVIEW"),
    ("REVIEW", "CHANGES_REQUIRED"),
    ("CHANGES_REQUIRED", "IN_PROGRESS"),
    ("REVIEW", "QA"),
    ("QA", "CHANGES_REQUIRED"),
    ("QA", "READY_FOR_MERGE"),
    ("READY_FOR_MERGE", "MERGED"),
    ("MERGED", "DONE"),
}

MATCH_TYPES = {"exact_file", "directory_glob", "recursive_glob", "explicit_exclusion"}
ACCESS_TYPES = {"read", "write", "read_write", "generated_evidence"}
SUPPORTED_VERSION = "1.0"


def is_repository_relative(path: str) -> bool:
    if not path or path.startswith("/") or "\\" in path:
        return False
    parts = PurePosixPath(path).parts
    return ".." not in parts


def validate_path(path: Any, label: str, errors: list[str]) -> None:
    if not isinstance(path, str):
        errors.append(f"{label} must be a string")
        return
    if not is_repository_relative(path):
        errors.append(f"{label} must be repository-relative and must not contain parent traversal")


def validate_path_rule(rule: Any, label: str, errors: list[str]) -> None:
    if not isinstance(rule, dict):
        errors.append(f"{label} must be an object")
        return
    for field in ("path", "match_type", "access", "rationale"):
        if field not in rule:
            errors.append(f"{label} missing {field}")
    if "path" in rule:
        validate_path(rule["path"], f"{label}.path", errors)
    if rule.get("match_type") not in MATCH_TYPES:
        errors.append(f"{label}.match_type is invalid")
    if rule.get("access") not in ACCESS_TYPES:
        errors.append(f"{label}.access is invalid")
    if "rationale" in rule and not isinstance(rule["rationale"], str):
        errors.append(f"{label}.rationale must be a string")


def validate_string_array(value: Any, label: str, errors: list[str], *, paths: bool = False, min_items: int = 0) -> None:
    if not isinstance(value, list):
        errors.append(f"{label} must be an array")
        return
    if len(value) < min_items:
        errors.append(f"{label} must contain at least {min_items} item(s)")
    for index, item in enumerate(value):
        if not isinstance(item, str):
            errors.append(f"{label}[{index}] must be a string")
            continue
        if paths:
            validate_path(item, f"{label}[{index}]", errors)


def validate_manifest(data: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(data, dict):
        return ["manifest must be a JSON object"]

    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"missing required field: {field}")

    if data.get("manifest_version") != SUPPORTED_VERSION:
        errors.append(f"unknown manifest version: {data.get('manifest_version')}")

    for field in ("task_id", "task_title", "owning_module", "assigned_role", "target_branch"):
        if field in data and not isinstance(data[field], str):
            errors.append(f"{field} must be a string")
        elif field in data and not data[field]:
            errors.append(f"{field} must not be empty")

    if "lifecycle_state" in data and data["lifecycle_state"] not in LIFECYCLE_STATES:
        errors.append(f"invalid lifecycle_state: {data['lifecycle_state']}")

    allowed_files = data.get("allowed_files")
    if not isinstance(allowed_files, list):
        errors.append("allowed_files must be an array")
    elif not allowed_files:
        errors.append("allowed_files must not be empty")
    else:
        for index, rule in enumerate(allowed_files):
            validate_path_rule(rule, f"allowed_files[{index}]", errors)

    forbidden_files = data.get("forbidden_files")
    if not isinstance(forbidden_files, list):
        errors.append("forbidden_files must be an array")
    else:
        for index, rule in enumerate(forbidden_files):
            validate_path_rule(rule, f"forbidden_files[{index}]", errors)

    if isinstance(allowed_files, list) and isinstance(forbidden_files, list):
        allowed_paths = {rule.get("path") for rule in allowed_files if isinstance(rule, dict)}
        forbidden_paths = {rule.get("path") for rule in forbidden_files if isinstance(rule, dict)}
        overlap = sorted(path for path in allowed_paths & forbidden_paths if path)
        if overlap:
            errors.append(f"allowed_files and forbidden_files overlap: {', '.join(overlap)}")

    validate_string_array(data.get("required_documents"), "required_documents", errors, paths=True, min_items=1)
    if "required_mip" in data:
        validate_path(data["required_mip"], "required_mip", errors)
        if not data["required_mip"]:
            errors.append("required_mip must not be empty")
    validate_string_array(data.get("required_adrs"), "required_adrs", errors, paths=True)
    validate_string_array(data.get("expected_evidence_paths"), "expected_evidence_paths", errors, paths=True, min_items=1)
    validate_string_array(data.get("required_commands"), "required_commands", errors)

    dependencies = data.get("dependencies")
    if not isinstance(dependencies, list):
        errors.append("dependencies must be an array")
    else:
        for index, dependency in enumerate(dependencies):
            if not isinstance(dependency, dict):
                errors.append(f"dependencies[{index}] must be an object")
                continue
            if not dependency.get("task_id"):
                errors.append(f"dependencies[{index}] missing task_id")
            if dependency.get("required_state") not in LIFECYCLE_STATES:
                errors.append(f"dependencies[{index}] has invalid required_state")

    transitions = data.get("permitted_lifecycle_transitions")
    if not isinstance(transitions, list):
        errors.append("permitted_lifecycle_transitions must be an array")
    elif not transitions:
        errors.append("permitted_lifecycle_transitions must not be empty")
    else:
        for index, transition in enumerate(transitions):
            if not isinstance(transition, dict):
                errors.append(f"permitted_lifecycle_transitions[{index}] must be an object")
                continue
            from_state = transition.get("from")
            to_state = transition.get("to")
            if from_state not in LIFECYCLE_STATES:
                errors.append(f"permitted_lifecycle_transitions[{index}].from is invalid")
            if to_state not in LIFECYCLE_STATES:
                errors.append(f"permitted_lifecycle_transitions[{index}].to is invalid")
            if (from_state, to_state) not in VALID_TRANSITIONS:
                errors.append(f"invalid lifecycle transition: {from_state} -> {to_state}")
            if not transition.get("authorized_role"):
                errors.append(f"permitted_lifecycle_transitions[{index}] missing authorized_role")

    cross_module_access = data.get("cross_module_access")
    if not isinstance(cross_module_access, dict):
        errors.append("cross_module_access must be an object")
    else:
        if not isinstance(cross_module_access.get("allowed"), bool):
            errors.append("cross_module_access.allowed must be a boolean")
        if cross_module_access.get("mode") not in {"none", "read_only", "public_contracts"}:
            errors.append("cross_module_access.mode is invalid")
        if not isinstance(cross_module_access.get("modules"), list):
            errors.append("cross_module_access.modules must be an array")
        if not isinstance(cross_module_access.get("rationale"), str):
            errors.append("cross_module_access.rationale must be a string")

    generated_at = data.get("generated_at")
    if isinstance(generated_at, str):
        try:
            datetime.fromisoformat(generated_at.replace("Z", "+00:00"))
        except ValueError:
            errors.append("generated_at must be an ISO 8601 timestamp")
    elif "generated_at" in data:
        errors.append("generated_at must be a string")

    task_id = data.get("task_id")
    evidence_paths = data.get("expected_evidence_paths")
    if isinstance(task_id, str) and isinstance(evidence_paths, list):
        for path in evidence_paths:
            if isinstance(path, str) and path.startswith("implementation/evidence/"):
                expected_prefix = f"implementation/evidence/{task_id}/"
                if not path.startswith(expected_prefix):
                    errors.append("generated evidence paths are allowed only for the active task")

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate-task-scope-manifest.py <manifest-json>", file=sys.stderr)
        return 2

    path = sys.argv[1]
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except OSError as exc:
        print(f"not found: {path}: {exc}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"invalid JSON: {exc}", file=sys.stderr)
        return 1

    errors = validate_manifest(data)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    print(f"valid: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
