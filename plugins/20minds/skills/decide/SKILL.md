---
name: decide
description: Open, frame, research, and review the user's 20minds Decide cases through its authenticated MCP server.
---

# 20minds Decide

Use the authenticated `decide` MCP tools for case data. Use public web and research tools when external sources are needed; save case records only through Decide MCP. If authentication is missing, have the user connect or reconnect the Decide plugin. Case creation and research writes require `decide:research:write`; reconnecting is needed if the existing grant lacks that scope. Never ask for or disclose access tokens, refresh tokens, API keys, or database credentials.

## Find and open a case

- Use `case_projects` and `case_list(project_id=...)` to find cases. Ask for clarification when several cases fit.
- Use `case_outline(case_id=...)` for a compact status summary and `case_read(case_id=...)` for the full record and its version.
- Use `case_create(project_id=..., title=..., question=...)` to start a case. Use `decide_open(case_id=...)` to open the interactive workspace, or `decide_open()` for the project list.
- Use host context to scope the request, but read the case before treating attached text as authoritative.

## Research workflow

For each coherent research iteration:

1. Read the case once with `case_read` and note `case.version`. Form a falsifiable working hypothesis. If the frame needs changing first, send a `frame` change and use its returned revision for the research batch.
2. Separate assumptions from questions. Record assumptions as unknowns with `kind="assumption"`; describe confidence and how much each assumption matters in `why_it_matters`. Record questions the research can resolve as unknowns with `kind="question"` and a `proposed_investigation`.
3. Find reliable sources, preferring primary sources. Record canonical URLs in `evidence` (`source_ref`, plus `source_title`, `source_version`, `locator`, and `excerpt` when available). Do not treat a search result as proof.
4. Send one `case_write` with `change.kind="research"` for the iteration. Batch related evidence, findings, unknowns, citations, and gaps together. A finding states what its cited evidence shows, includes limitations, and has at least one citation. Use citation relationships `supports`, `challenges`, or `cites`. Use gaps to link findings to questions they leave open.
5. A `research` change adds new records; one `case_write` accepts one discriminated `change`. Revise saved records in separate writes using `edit_finding`, `edit_unknown`, `edit_option`, or `edit_evidence` with the record ID. Send the full current text; omitted triage labels stay unchanged, while `null` clears a label. Use each write result revision for the next write.
6. When the evidence supports a recommendation, send a separate `conclusion` listing its finding IDs. Set `option_id` or `unknown_id`; when recommending more investigation, include the next step and what result would change the answer. Use the returned revision and a new request ID for the conclusion write. Call `case_outline` to check high-level findings, unknowns, and conclusion; to verify citation links, call `case_read` and inspect `finding_evidence` against `evidence`.

Research record shapes:

- `evidence`: `{id, source_ref, source_title?, source_version?, locator?, excerpt?}`
- `findings`: `{id, statement, limitations?, verdict?, confidence?}`
- `unknowns`: `{id, description, why_it_matters?, proposed_investigation?, kind}` where `kind` is `question` or `assumption`
- `citations`: `{finding_id, evidence_id, relationship}`
- `gaps`: `{finding_id, unknown_id}`

Preserve source attribution and uncertainty. Include evidence that could falsify the hypothesis, not only evidence that supports it. Never invent citations or claim a source says more than it does. Return a concise progress summary after each batch, and do not poll indefinitely.

## Safe case updates

- Before a change, read the latest case and use its version as `expected_revision`, with a new UUID as `request_id`.
- If a write may have succeeded but the response was lost, retry the same request ID and payload. On a version conflict, reread, reconcile, and use a new request ID.
- Group related changes into the smallest coherent write. Other supported changes include `option`, `options`, `conclusion`, `frame`, `figure`, `edit_finding`, `edit_unknown`, `edit_option`, and `edit_evidence`.
- A conclusion is a recommendation, not a final decision. Commitments, outcomes, publishing, and closing or archiving are the user's actions in the Decide workspace; offer `decide_open` when relevant. Agent runs are started from the workspace too.
