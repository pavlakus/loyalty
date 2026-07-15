from pathlib import Path

path = Path("AGENTS.md")
text = path.read_text(encoding="utf-8")

marker = "## 6. Required Reading Before Any Task"
section = """## Agent Workflow

Every implementation task follows:

Documentation
→ Task Preparation
→ READY
→ Implementation
→ Independent Review
→ QA
→ READY_FOR_MERGE
→ Human Merge
→ Release

Developer Agents may execute only tasks with status READY.

Task Preparation Agents may repair safe documentation and metadata issues, but may not invent Product Decisions, change accepted ADR decisions, expand MIP scope or mark unfinished dependencies complete.

If a task is not READY, the Developer Agent must stop and return `TASK NOT READY`.

The Task Preparation Agent must then prepare the task using:

- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `.codex/skills/task-preparation/SKILL.md`
- `implementation/TASK-LIFECYCLE.md`

---

"""

if "## Agent Workflow" not in text:
    text = text.replace(marker, section + marker)

refs_marker = "- `docs/ai-engineering-framework/77-project-document-generator.md`"
refs_add = """- `docs/ai-engineering-framework/77-project-document-generator.md`
- `docs/ai-engineering-framework/78-task-preparation-agent.md`
- `docs/ai-engineering-framework/79-agent-registry.md`
- `docs/ai-engineering-framework/80-agent-workflow.md`
- `implementation/TASK-LIFECYCLE.md`"""
text = text.replace(refs_marker, refs_add)

path.write_text(text, encoding="utf-8")
print("AGENTS.md patched.")
