#!/usr/bin/env python3
"""Route LP workflow commands without mutating task state."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


COMMANDS = {"prepare", "execute", "review", "qa", "close", "status", "continue-backlog"}

PHASE_BY_COMMAND = {
    "prepare": "prepare",
    "execute": "implementation",
    "review": "review",
    "qa": "qa",
    "close": "release",
    "status": "status",
}

DEFAULT_SKILL_BY_COMMAND = {
    "prepare": ".codex/skills/task-preparation/SKILL.md",
    "execute": "",
    "review": ".codex/skills/review/SKILL.md",
    "qa": ".codex/skills/qa/SKILL.md",
    "close": "",
    "status": "",
}

NEXT_ACTION_BY_COMMAND = {
    "prepare": "execute",
    "execute": "review",
    "review": "qa",
    "qa": "close",
    "close": "status",
    "status": "status",
}

REQUIRED_EVIDENCE_BY_COMMAND = {
    "review": ("implementation.md",),
    "qa": ("implementation.md", "review.md"),
    "close": ("implementation.md", "review.md", "qa.md"),
}

APPROVED_REVIEW_STATUSES = {"APPROVED", "APPROVED WITH FOLLOW-UP"}
APPROVED_QA_STATUSES = {"QA APPROVED", "QA APPROVED WITH FOLLOW-UP"}
TERMINAL_STATUSES = {"DONE", "CANCELLED", "DEFERRED"}
ACTIVE_STATUSES = {
    "ASSIGNED",
    "IN_PROGRESS",
    "IMPLEMENTATION_COMPLETE",
    "READY_FOR_REVIEW",
    "REVIEW",
    "CHANGES_REQUIRED",
    "QA",
    "READY_FOR_MERGE",
    "MERGED",
}
PREPARATION_STATUSES = {"TASK_PREPARATION"}
PRIORITY_RANK = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
NUMBERED_H2_PREFIX = r"(?:\d+(?:\.\d+)*\.\s+)?"


class DispatchError(Exception):
    pass


@dataclass(frozen=True)
class Route:
    command: str
    task_id: str
    task_file: Path
    task_status: str
    mip_path: Path
    prompt_path: Path | None
    skill_path: Path | None
    evidence_dir: Path
    next_action: str


@dataclass(frozen=True)
class BacklogTask:
    task_id: str
    title: str
    status: str
    task_file: Path
    dependencies: tuple[str, ...]
    priority: int
    index_order: int
    dependency_depth: int
    next_command: str


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise DispatchError(f"missing required file: {path}") from exc


def extract_status(text: str) -> str:
    match = re.search(
        rf"^##\s+{NUMBERED_H2_PREFIX}Status\s*\n`?([^`\n]+)`?",
        text,
        re.MULTILINE,
    )
    if not match:
        raise DispatchError("task status not found")
    return match.group(1).strip()


def extract_priority(text: str) -> int:
    value = extract_section_value(text, "Priority")
    return PRIORITY_RANK.get(value.strip().upper() if value else "P2", 2)


def extract_section_value(text: str, heading: str) -> str | None:
    match = re.search(
        rf"^##\s+{NUMBERED_H2_PREFIX}{re.escape(heading)}\s*$([\s\S]*?)(?=^##\s+|\Z)",
        text,
        re.MULTILINE,
    )
    if not match:
        return None
    for line in match.group(1).splitlines():
        value = line.strip().strip("`")
        if value:
            return value
    return None


def parse_index_rows(root: Path) -> list[tuple[str, str, str, tuple[str, ...], int]]:
    index = root / "implementation/tasks/platform-foundation/TASK-INDEX.md"
    text = read_text(index)
    rows: list[tuple[str, str, str, tuple[str, ...], int]] = []
    for order, line in enumerate(text.splitlines()):
        if not line.startswith("|") or line.count("|") < 5:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if not cells or cells[0] in {"Task", "---"} or not cells[0].startswith("LP-"):
            continue
        task_id, title, _role, dependency_text, _index_status = cells[:5]
        dependencies = tuple(
            dependency.strip()
            for dependency in re.split(r"[;,]", dependency_text)
            if dependency.strip().startswith(("LP-", "V2-", "ADR-"))
        )
        rows.append((task_id, title, dependency_text, dependencies, order))
    return rows


def parse_status_rows(root: Path) -> dict[str, tuple[str, str]]:
    path = root / "implementation/TASK-STATUS.md"
    if not path.is_file():
        return {}
    result: dict[str, tuple[str, str]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or line.count("|") < 6:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 6 or not cells[0].startswith("LP-"):
            continue
        result[cells[0]] = (cells[2], cells[3].strip("`").strip())
    return result


def lifecycle_command(status: str) -> str:
    return {
        "DRAFT": "prepare",
        "TASK_PREPARATION": "prepare",
        "READY": "execute",
        "ASSIGNED": "execute",
        "IN_PROGRESS": "execute",
        "CHANGES_REQUIRED": "execute",
        "IMPLEMENTATION_COMPLETE": "execute",
        "READY_FOR_REVIEW": "review",
        "REVIEW": "review",
        "QA": "qa",
        "READY_FOR_MERGE": "close",
        "MERGED": "close",
    }.get(status, "status")


def reconciled_task_status(spec_status: str, index_status: str, status_status: str | None) -> str:
    values = {spec_status, index_status}
    if status_status:
        values.add(status_status)
    if len(values) == 1:
        return spec_status
    # A stale BLOCKED row must not hide the non-blocked lifecycle recorded by
    # the task specification or evidence-backed index. Other disagreements
    # retain the most advanced non-terminal lifecycle state.
    non_blocked = [value for value in values if value != "BLOCKED"]
    if non_blocked:
        ranked = {
            "DRAFT": 0, "TASK_PREPARATION": 1, "READY": 2, "ASSIGNED": 3,
            "IN_PROGRESS": 4, "IMPLEMENTATION_COMPLETE": 5,
            "READY_FOR_REVIEW": 6, "REVIEW": 7, "CHANGES_REQUIRED": 8,
            "QA": 9, "READY_FOR_MERGE": 10, "MERGED": 11, "DONE": 12,
        }
        return max(non_blocked, key=lambda value: ranked.get(value, -1))
    return "BLOCKED"


def dependency_depth(task_id: str, dependencies: dict[str, tuple[str, ...]], cache: dict[str, int], visiting: set[str]) -> int:
    if task_id in cache:
        return cache[task_id]
    if task_id in visiting:
        raise DispatchError(f"cyclic backlog dependency involving {task_id}")
    visiting.add(task_id)
    local = [dependency_depth(dep, dependencies, cache, visiting) for dep in dependencies.get(task_id, ()) if dep in dependencies]
    visiting.remove(task_id)
    cache[task_id] = 0 if not local else max(local) + 1
    return cache[task_id]


def select_next_task(root: Path, current_branch: str | None = None) -> BacklogTask | None:
    rows = parse_index_rows(root)
    status_rows = parse_status_rows(root)
    if not rows:
        return None
    task_data: dict[str, tuple[str, str, Path, tuple[str, ...], int, int]] = {}
    for task_id, title, _dependency_text, dependencies, index_order in rows:
        task_file = find_task_file(root, task_id)
        spec_text = read_text(task_file)
        spec_status = extract_status(spec_text)
        index_status = next(
            line.strip().strip("|").split("|")[-1].strip()
            for line in (root / "implementation/tasks/platform-foundation/TASK-INDEX.md").read_text(encoding="utf-8").splitlines()
            if line.startswith("|") and line.split("|")[1].strip() == task_id
        )
        status_status, branch = status_rows.get(task_id, (None, ""))
        status = reconciled_task_status(spec_status, index_status, status_status)
        task_data[task_id] = (title, status, task_file, dependencies, index_order, extract_priority(spec_text))
        if status in ACTIVE_STATUSES and branch and current_branch and branch != current_branch:
            # The task is already being executed on another active branch.
            task_data[task_id] = (title, "BLOCKED_BY_ACTIVE_AGENT", task_file, dependencies, index_order, extract_priority(spec_text))

    statuses = {task_id: data[1] for task_id, data in task_data.items()}
    dependency_map = {task_id: data[3] for task_id, data in task_data.items()}
    depth_cache: dict[str, int] = {}
    candidates: list[BacklogTask] = []
    for task_id, (title, status, task_file, dependencies, index_order, priority) in task_data.items():
        if status in TERMINAL_STATUSES or status in {"BLOCKED", "BLOCKED_BY_ACTIVE_AGENT"}:
            continue
        if any(statuses.get(dep) != "DONE" for dep in dependencies if dep in statuses):
            continue
        if any(dep not in statuses and not dep.startswith("ADR-") for dep in dependencies):
            continue
        candidates.append(
            BacklogTask(
                task_id=task_id,
                title=title,
                status=status,
                task_file=task_file,
                dependencies=dependencies,
                priority=priority,
                index_order=index_order,
                # All candidates have satisfied direct dependencies. Preserve
                # task-index order among those candidates; dependency depth is
                # used only to validate and order unresolved dependency graphs,
                # not to make an older foundational chain outrank a later
                # eligible task.
                dependency_depth=0,
                next_command=lifecycle_command(status),
            )
        )
    if not candidates:
        return None

    def stage(task: BacklogTask) -> int:
        if task.status in ACTIVE_STATUSES:
            return 0
        if task.status in PREPARATION_STATUSES:
            return 1
        if task.status == "READY":
            return 2
        if task.status == "DRAFT":
            return 3
        return 4

    return min(candidates, key=lambda task: (stage(task), task.priority, task.dependency_depth, task.index_order, task.task_id))


def resolve_mip_path(root: Path, task_text: str) -> Path:
    mip_reference = (
        extract_section_value(task_text, "Module Implementation Package")
        or extract_section_value(task_text, "MIP")
    )
    if not mip_reference:
        raise DispatchError("missing MIP reference")

    mip_path = Path(mip_reference)
    if not mip_path.is_absolute():
        mip_path = root / mip_path
    if not mip_path.is_file():
        raise DispatchError(f"missing MIP file: {mip_path}")
    return mip_path


def extract_field_from_response(text: str, field: str) -> str | None:
    match = re.search(rf"^\s*-?\s*{re.escape(field)}\s*:\s*(.+?)\s*$", text, re.MULTILINE)
    if match:
        return match.group(1).strip(" `")
    section = re.search(
        rf"^#+\s+{re.escape(field)}\s*$([\s\S]*?)(?=^#+\s+|\Z)",
        text,
        re.MULTILINE,
    )
    if section:
        first = section.group(1).strip().splitlines()
        if first:
            return first[0].strip(" `")
    return None


def find_task_file(root: Path, task_id: str) -> Path:
    matches = sorted((root / "implementation/tasks").glob(f"**/{task_id}-*.md"))
    if not matches:
        raise DispatchError(f"unknown task id: {task_id}")
    if len(matches) > 1:
        raise DispatchError(f"ambiguous task id: {task_id}")
    return matches[0]


def prompt_path_for(root: Path, task_id: str, command: str) -> Path | None:
    phase = PHASE_BY_COMMAND[command]
    if phase in {"release", "status"}:
        return None
    return root / "implementation/codex-prompts/ai-engineering-framework" / f"{task_id}-{phase}.md"


def evidence_dir_for(root: Path, task_id: str) -> Path:
    return root / "implementation/evidence" / task_id


def prompt_skill(prompt_text: str) -> str | None:
    match = re.search(r"\.codex/skills/[A-Za-z0-9_-]+/SKILL\.md", prompt_text)
    return match.group(0) if match else None


def resolve_skill(root: Path, command: str, prompt: Path | None) -> Path | None:
    skill = None
    if command == "execute" and prompt and prompt.is_file():
        skill = prompt_skill(read_text(prompt))
    if not skill:
        skill = DEFAULT_SKILL_BY_COMMAND[command]
    return root / skill if skill else None


def validate_prompt(prompt: Path | None) -> None:
    if prompt is not None and not prompt.is_file():
        raise DispatchError(f"missing prompt: {prompt}")


def validate_skill(skill: Path | None) -> None:
    if skill is not None and not skill.is_file():
        raise DispatchError(f"missing skill: {skill}")


def validate_evidence(root: Path, command: str, task_id: str) -> None:
    evidence_dir = evidence_dir_for(root, task_id)
    for filename in REQUIRED_EVIDENCE_BY_COMMAND.get(command, ()):
        path = evidence_dir / filename
        if not path.is_file():
            raise DispatchError(f"missing required evidence: {path}")


def response_status(root: Path, task_id: str, filename: str) -> str | None:
    path = evidence_dir_for(root, task_id) / filename
    if not path.is_file():
        return None
    return extract_field_from_response(read_text(path), "Status")


def validate_response(root: Path, response: Path | None) -> None:
    if response is None:
        return
    validator = root / "scripts/validate-agent-response.py"
    if not validator.is_file():
        raise DispatchError(f"missing response validator: {validator}")
    result = subprocess.run(
        [sys.executable, str(validator), str(response)],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        message = (result.stderr or result.stdout).strip()
        raise DispatchError(f"response contract validation failed: {message}")


def validate_lifecycle(
    root: Path,
    command: str,
    task_id: str,
    status: str,
    allow_correction: bool,
    merged_commit: str | None,
) -> None:
    if command == "prepare":
        if status != "DRAFT" and status != "BLOCKED":
            raise DispatchError("prepare requires DRAFT or resolved BLOCKED task")
    elif command == "execute":
        if status == "READY":
            return
        if status == "CHANGES_REQUIRED" and allow_correction:
            return
        raise DispatchError("execute requires READY or authorized CHANGES_REQUIRED correction")
    elif command == "review":
        if status != "READY_FOR_REVIEW":
            raise DispatchError("review requires READY_FOR_REVIEW")
    elif command == "qa":
        if status != "QA":
            raise DispatchError("qa requires QA lifecycle state")
        if response_status(root, task_id, "review.md") not in APPROVED_REVIEW_STATUSES:
            raise DispatchError("qa requires approved review evidence")
    elif command == "close":
        if status not in {"READY_FOR_MERGE", "MERGED"}:
            raise DispatchError("close requires READY_FOR_MERGE or MERGED")
        if response_status(root, task_id, "review.md") not in APPROVED_REVIEW_STATUSES:
            raise DispatchError("close requires approved review evidence")
        if response_status(root, task_id, "qa.md") not in APPROVED_QA_STATUSES:
            raise DispatchError("close requires approved QA evidence")
        if status == "MERGED":
            validate_merged_commit(root, merged_commit)
    elif command == "status":
        return


def validate_merged_commit(root: Path, merged_commit: str | None) -> None:
    if not merged_commit:
        raise DispatchError("close from MERGED requires --merged-commit")
    result = subprocess.run(
        ["git", "merge-base", "--is-ancestor", merged_commit, "HEAD"],
        cwd=root,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise DispatchError(f"merged commit is not contained in HEAD: {merged_commit}")


def route(
    root: Path,
    command: str,
    task_id: str,
    response: Path | None = None,
    allow_correction: bool = False,
    merged_commit: str | None = None,
) -> Route:
    if command not in COMMANDS:
        raise DispatchError(f"unsupported command: {command}")

    task_file = find_task_file(root, task_id)
    task_text = read_text(task_file)
    task_status = extract_status(task_text)
    mip_path = resolve_mip_path(root, task_text)
    validate_lifecycle(root, command, task_id, task_status, allow_correction, merged_commit)
    prompt = prompt_path_for(root, task_id, command)
    validate_prompt(prompt)
    skill = resolve_skill(root, command, prompt)
    validate_skill(skill)
    validate_evidence(root, command, task_id)
    validate_response(root, response)

    return Route(
        command=command,
        task_id=task_id,
        task_file=task_file,
        task_status=task_status,
        mip_path=mip_path,
        prompt_path=prompt,
        skill_path=skill,
        evidence_dir=evidence_dir_for(root, task_id),
        next_action=NEXT_ACTION_BY_COMMAND[command],
    )


def render(route_result: Route) -> str:
    prompt = str(route_result.prompt_path) if route_result.prompt_path else "not required"
    skill = str(route_result.skill_path) if route_result.skill_path else "not required"
    return "\n".join(
        (
            "Dispatcher Route",
            f"Command: {route_result.command}",
            f"Task ID: {route_result.task_id}",
            f"Task Status: {route_result.task_status}",
            f"Task File: {route_result.task_file}",
            f"MIP: {route_result.mip_path}",
            f"Prompt: {prompt}",
            f"Skill: {skill}",
            f"Evidence Directory: {route_result.evidence_dir}",
            f"Next Action: {route_result.next_action}",
        )
    )


def render_backlog_selection(selection: BacklogTask | None) -> str:
    if selection is None:
        return "NO EXECUTABLE BACKLOG TASKS"
    return "\n".join(
        (
            "Continuous Backlog Selection",
            f"Task ID: {selection.task_id}",
            f"Task Status: {selection.status}",
            f"Task File: {selection.task_file}",
            f"Dependencies: {', '.join(selection.dependencies) or 'None'}",
            f"Next Command: {selection.next_command} {selection.task_id}",
            "Lifecycle Mutation: none; invoke the existing phase dispatcher and re-run continue-backlog after DONE",
        )
    )


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=sorted(COMMANDS))
    parser.add_argument("task_id", nargs="?")
    parser.add_argument("--root", default=".", help="repository root")
    parser.add_argument("--response", help="agent response to validate before routing")
    parser.add_argument("--allow-correction", action="store_true")
    parser.add_argument("--merged-commit", help="commit expected to be contained in HEAD for MERGED close")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    root = Path(args.root).resolve()
    if args.command == "continue-backlog":
        try:
            branch = subprocess.check_output(
                ["git", "branch", "--show-current"], cwd=root, text=True
            ).strip()
            print(render_backlog_selection(select_next_task(root, current_branch=branch)))
            return 0
        except (DispatchError, subprocess.CalledProcessError) as exc:
            print(f"DISPATCH BLOCKED: {exc}", file=sys.stderr)
            return 1
    if not args.task_id:
        print("DISPATCH BLOCKED: task id is required", file=sys.stderr)
        return 1
    response = Path(args.response).resolve() if args.response else None
    try:
        route_result = route(
            root=root,
            command=args.command,
            task_id=args.task_id,
            response=response,
            allow_correction=args.allow_correction,
            merged_commit=args.merged_commit,
        )
    except DispatchError as exc:
        print(f"DISPATCH BLOCKED: {exc}", file=sys.stderr)
        return 1

    print(render(route_result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
