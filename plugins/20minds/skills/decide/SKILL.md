---
name: decide
description: Pose, research, triage, and take decisions in 20minds Decide through its authenticated MCP server.
---

# decide

Use the authenticated `20minds` MCP server exclusively. It intentionally exposes a compact interface to reduce approval prompts and round trips:

- `decide_read` reads workspace, decision, or agent-run context.
- `decide_write` handles project, decision, canvas, and outcome mutations.
- `research_sync` persists a complete research batch.
- `agent_control` starts, checks, or stops Airedale and Saluki.

If MCP is unavailable, ask the user to start the Decide API and run `codex mcp login 20minds` (or `claude mcp login 20minds`). Do not run a local CLI or call the REST API directly.

## Read

Use `decide_read(scope="workspace")` to identify projects and the active decision. Use `decide_read(scope="decision", decision_id=...)` before changing anything. It returns the decision canvas and research graph. Use `decide_read(scope="runs", decision_id=...)` to inspect agent work.

## Write

Use `decide_write` with `operation="project_create"`, `"project_archive"`, `"decision_create"`, `"decision_update"`, `"canvas_batch"`, or `"record_outcome"`. Supply the current decision `version` for decision and canvas changes. On a version conflict, reread and retry with the new version.

Put related card adds, edits, removals, and reorders into one `canvas_batch` operation. Preserve card origin and agent metadata. Canvas lanes are `thesis`, `option`, `evidence`, `question`, and `assumption`.

## Research and agents

Use `research_sync` once per coherent research iteration, grouping thesis, issues, sources, claims, and facts into one request. For the research workflow itself — forming a falsifiable thesis, evidence discipline, dependency ordering — use the `airedale` skill; this section only covers wiring it into Decide.

Use `agent_control(action="start"|"status"|"stop", ...)` for Airedale or Saluki. Starting research may update the canvas asynchronously. Report progress without polling indefinitely.

Research facts carry a verdict (visible via `research_sync` results and Inspect Evidence); canvas evidence cards themselves do not. Do not claim a canvas card was triaged. A decision may be taken before every question is resolved.

Never expose access or refresh tokens.
