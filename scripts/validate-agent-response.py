#!/usr/bin/env python3
"""Validate Markdown agent responses against the LP agent response contract."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ALLOWED_STATUSES = {
    "TASK PREPARATION BLOCKED",
    "READY FOR IMPLEMENTATION",
    "IMPLEMENTATION BLOCKED",
    "READY FOR REVIEW",
    "APPROVED",
    "APPROVED WITH FOLLOW-UP",
    "CHANGES REQUIRED",
    "BLOCKED",
    "QA APPROVED",
    "QA APPROVED WITH FOLLOW-UP",
    "QA CHANGES REQUIRED",
    "QA BLOCKED",
    "READY FOR MERGE",
    "MERGED",
    "DONE",
}

ALLOWED_NEXT_ACTIONS = {
    "Run Review",
    "Run QA",
    "Prepare Merge",
    "Merge",
    "Close Task",
    "Create Follow-up Task",
    "Reopen Task",
    "Stop",
}

METADATA_FIELDS = (
    "Task ID",
    "Task Title",
    "Agent Role",
    "Branch",
    "Timestamp",
    "Current Lifecycle State",
    "Commit",
)

MANDATORY_SECTIONS = (
    "Executive Summary",
    "Status",
    "Findings",
    "Evidence",
    "Required Corrections",
    "Next Action",
    "Workflow Result",
)

BLOCKED_FIELDS = (
    "Blocking Reason",
    "Blocking Category",
    "Blocking Owner",
    "Required Action",
    "Resume Condition",
)

FOLLOW_UP_FIELDS = (
    "Type",
    "Owner",
    "Suggested Task ID",
    "Reason",
    "Merge Allowed",
)

REVIEW_STATUSES = {
    "APPROVED",
    "APPROVED WITH FOLLOW-UP",
    "CHANGES REQUIRED",
    "BLOCKED",
}

REVIEW_REQUIRED_SECTIONS = (
    "Scope Reviewed",
    "Acceptance Criteria Review",
    "Merge Recommendation",
)

REVIEW_EVIDENCE_TERMS = (
    "Commands executed",
    "Validation results",
    "Git evidence",
    "Review evidence",
    "QA evidence",
)

REVIEW_REQUIRED_TERMS = (
    "changed files",
    "security",
    "documentation",
)

QA_STATUSES = {
    "QA APPROVED",
    "QA APPROVED WITH FOLLOW-UP",
    "QA CHANGES REQUIRED",
    "QA BLOCKED",
}

QA_REQUIRED_SECTIONS = (
    "Acceptance Criteria Validation",
    "QA Validation",
    "Merge Recommendation",
)

QA_EVIDENCE_TERMS = (
    "Commands executed",
    "Validation results",
    "Git evidence",
    "Review evidence",
    "QA evidence",
)

QA_REQUIRED_TERMS = (
    "acceptance criteria",
    "mandatory test",
    "failure-path",
    "security",
    "scope",
    "review precondition",
)


def heading_exists(text: str, heading: str) -> bool:
    return re.search(rf"^#+\s+{re.escape(heading)}\s*$", text, re.MULTILINE) is not None


def field_exists(text: str, field: str) -> bool:
    return re.search(rf"^\s*-?\s*{re.escape(field)}\s*:", text, re.MULTILINE) is not None


def field_value(text: str, field: str) -> str | None:
    match = re.search(rf"^\s*-?\s*{re.escape(field)}\s*:\s*(.+?)\s*$", text, re.MULTILINE)
    return match.group(1).strip(" `") if match else None


def section_text(text: str, heading: str) -> str:
    match = re.search(
        rf"^#+\s+{re.escape(heading)}\s*$([\s\S]*?)(?=^#+\s+|\Z)",
        text,
        re.MULTILINE,
    )
    return match.group(1).strip() if match else ""


def add_missing(errors: list[str], text: str, fields: tuple[str, ...], context: str) -> None:
    for field in fields:
        if not field_exists(text, field):
            errors.append(f"missing {context}: {field}")


def is_review_response(path: Path, text: str, status: str | None) -> bool:
    agent_role = field_value(text, "Agent Role") or ""
    return (
        agent_role == "Review Agent"
        or path.name == "review.md"
        or status in (REVIEW_STATUSES - {"BLOCKED"})
    )


def validate_review_response(text: str, status: str | None, errors: list[str]) -> None:
    if status not in REVIEW_STATUSES:
        errors.append("review response has invalid review status")

    for section in REVIEW_REQUIRED_SECTIONS:
        if not heading_exists(text, section):
            errors.append(f"review evidence missing section: {section}")

    evidence = section_text(text, "Evidence")
    for term in REVIEW_EVIDENCE_TERMS:
        if term.lower() not in evidence.lower():
            errors.append(f"review evidence missing evidence item: {term}")

    lowered = text.lower()
    for term in REVIEW_REQUIRED_TERMS:
        if term not in lowered:
            errors.append(f"review evidence missing required review coverage: {term}")

    if status == "APPROVED":
        findings = section_text(text, "Findings")
        if not re.fullmatch(r"`?None`?", findings, re.IGNORECASE):
            errors.append("APPROVED review evidence must state Findings as None")


def is_qa_response(path: Path, text: str, status: str | None) -> bool:
    agent_role = field_value(text, "Agent Role") or ""
    return (
        (agent_role == "QA Agent" and status in QA_STATUSES)
        or path.name == "qa.md"
        or status in (QA_STATUSES - {"QA BLOCKED"})
    )


def validate_qa_response(text: str, status: str | None, errors: list[str]) -> None:
    if status not in QA_STATUSES:
        errors.append("QA response has invalid QA status")

    for section in QA_REQUIRED_SECTIONS:
        if not heading_exists(text, section):
            errors.append(f"QA evidence missing section: {section}")

    evidence = section_text(text, "Evidence")
    for term in QA_EVIDENCE_TERMS:
        if term.lower() not in evidence.lower():
            errors.append(f"QA evidence missing evidence item: {term}")

    lowered = text.lower()
    for term in QA_REQUIRED_TERMS:
        if term not in lowered:
            errors.append(f"QA evidence missing required QA coverage: {term}")

    if status in {"QA APPROVED", "QA APPROVED WITH FOLLOW-UP"}:
        findings = section_text(text, "Findings")
        if not re.fullmatch(r"`?None`?", findings, re.IGNORECASE):
            errors.append(f"{status} evidence must state Findings as None")
        qa_validation = section_text(text, "QA Validation").lower()
        if "review precondition" not in qa_validation or "approved" not in qa_validation:
            errors.append(f"{status} requires approved review precondition evidence")


def validate(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    errors: list[str] = []

    stripped = text.strip()
    if stripped in ALLOWED_STATUSES:
        return ["status-only response is invalid"]

    add_missing(errors, text, METADATA_FIELDS, "metadata")
    for section in MANDATORY_SECTIONS:
        if not heading_exists(text, section):
            errors.append(f"missing section: {section}")

    status = field_value(text, "Status") or section_text(text, "Status").splitlines()[0].strip(" `") if heading_exists(text, "Status") and section_text(text, "Status") else field_value(text, "Status")
    if not status:
        errors.append("missing status value")
    elif status not in ALLOWED_STATUSES:
        errors.append(f"invalid status: {status}")

    next_action = field_value(text, "Next Action") or section_text(text, "Next Action").splitlines()[0].strip(" `") if heading_exists(text, "Next Action") and section_text(text, "Next Action") else field_value(text, "Next Action")
    if not next_action:
        errors.append("missing next action value")
    elif next_action not in ALLOWED_NEXT_ACTIONS:
        errors.append(f"invalid next action: {next_action}")

    add_missing(
        errors,
        section_text(text, "Workflow Result"),
        ("Task ID", "Current State", "Next State", "Next Responsible Agent", "Can Continue"),
        "workflow footer field",
    )

    findings = section_text(text, "Findings")
    if status in {"CHANGES REQUIRED", "QA CHANGES REQUIRED"}:
        if not findings or re.fullmatch(r"`?None`?", findings, re.IGNORECASE):
            errors.append(f"{status} requires at least one finding")
        for field in ("Severity", "File", "Impact"):
            if not field_exists(findings, field):
                errors.append(f"{status} finding missing {field}")
        if not (field_exists(findings, "Required Correction") or field_exists(findings, "Exact Required Correction")):
            errors.append(f"{status} finding missing Exact Required Correction")

    if status in {"APPROVED WITH FOLLOW-UP", "QA APPROVED WITH FOLLOW-UP"}:
        if not heading_exists(text, "Follow-up"):
            errors.append(f"{status} requires Follow-up section")
        follow_up = section_text(text, "Follow-up")
        add_missing(errors, follow_up, FOLLOW_UP_FIELDS, "follow-up field")
        if "Blocking" not in follow_up and "Non-blocking" not in follow_up:
            errors.append("follow-up requires Blocking or Non-blocking classification")
        merge_allowed = field_value(follow_up, "Merge Allowed")
        if merge_allowed and merge_allowed not in {"YES", "NO"}:
            errors.append("Merge Allowed must be YES or NO")

    if status in {"BLOCKED", "IMPLEMENTATION BLOCKED", "QA BLOCKED", "TASK PREPARATION BLOCKED"}:
        add_missing(errors, text, BLOCKED_FIELDS, "blocked field")

    if is_review_response(path, text, status):
        validate_review_response(text, status, errors)

    if is_qa_response(path, text, status):
        validate_qa_response(text, status, errors)

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate-agent-response.py <markdown-response>", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"not found: {path}", file=sys.stderr)
        return 2

    errors = validate(path)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    print(f"valid: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
