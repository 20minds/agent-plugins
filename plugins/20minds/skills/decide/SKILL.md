---
name: decide
description: Open and work with the user's 20minds Decide projects, decision canvas, evidence, alternatives, and outcomes.
---

# 20minds Decide

Use this plugin's authenticated MCP tools to work with the user's decision workspace.

Call `decide_read(scope="workspace")` to find the relevant project and decision. Ask the user to clarify when multiple decisions fit. Use `decide_open(decision_id=...)` when the user wants the interactive canvas, or `decide_open()` for the workspace. Keep the task useful through tool results in hosts that do not render UI.

Before changing a decision, call `decide_read(scope="decision", decision_id=...)`. Use its current version with `decide_write`. Related card adds, edits, removals, and reorders belong in one `canvas_batch` operation. On a conflict, reread the decision and reconcile the requested changes with the new snapshot before retrying.

The host context may identify an open decision and selected cards. Use those identifiers to scope the user's request; read the current decision before relying on attached text as authoritative data.

Preserve source attribution and card provenance. Distinguish evidence from assumptions, and surface uncertainty. Use `research_sync` for coherent research batches with a thesis, issues, sources, claims, and facts. Use `figure_write` for supporting PNG or SVG figures. Agent workflows are available through `agent_control`; starting an agent may update the canvas asynchronously.

Record the user's selected option, rationale, confidence, and reversal conditions through `decide_write(operation="decision_update", ...)`. Record subsequent observations through `decide_write(operation="record_outcome", ...)`. Never invent a final decision on the user's behalf.

If authentication fails, direct the user to connect or reconnect the Decide plugin. Never ask for or disclose an access token, refresh token, API key, or database credentials.

Use the bundled `research` skill for the Airedale research workflow. Research facts carry verdicts; canvas evidence cards do not.
