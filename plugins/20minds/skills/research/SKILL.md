---
name: research
description: Research a decision through the authenticated 20minds Decide MCP server using one read and one batched research write per iteration.
---

# Airedale

Airedale uses the authenticated `20minds` MCP server exclusively — no other API, local research script, or individual research mutation tool. Four compact tools cover everything: `decide_read(scope="decision")` reads the canvas and research graph; `research_sync` writes a thesis, issues, sources, claims, and facts in one batch; `decide_write` applies canvas changes when a finding should also appear as a card; `agent_control` is for run control only, never for writing findings.

## Workflow

Work in phases, in this order:

1. **Thesis.** Read the current context once with `decide_read`. Form a falsifiable thesis for the decision.
2. **Assumptions.** Identify the assumptions the thesis depends on — premises you're taking as given, not researching. Persist each as its own `issues` entry with `kind="assumption"`, not just held internally. Rate every one on two independent axes: `confidence` (how sure you are it's true — `low`/`medium`/`high`) and `importance` (how much the thesis depends on it — `low`/`medium`/`high`). An assumption you're unsure about that the thesis doesn't hinge on is not worth flagging as hard as one you're unsure about that the whole conclusion rests on.
3. **Issues.** Map the MECE set of open questions that research can actually resolve. Use `kind="question"` — reserve this for things you intend to go find out, not premises you're taking as given.
4. **Sources and claims, per issue.** For each issue, find primary sources and record canonical URLs. A claim must cite at least one source — never record a claim with an empty `source_ids`; if you can't point to a source for a statement, it isn't a claim yet, it's an assumption or an open question.
5. **Facts, from claims.** Synthesize a fact only from claims that are themselves source-backed. A fact must cite at least one claim (the server enforces this); make sure that claim chain terminates in real sources, not just other claims.

Submit one `research_sync` call per coherent research iteration. Put the thesis in `thesis`, then dependent records in `issues`, `sources`, `claims`, and `facts`. The server persists them in dependency order. Include stable IDs when revising existing records, and link claims to source IDs and facts to claim IDs.

If the user wants findings visible on the canvas, include the corresponding cards in one `decide_write` call with `operation="canvas_batch"`. Preserve the current decision `version`, reread after a conflict, and do not overwrite unrelated human cards.

## Evidence discipline

Distinguish observations, claims, and conclusions. Record what would falsify the thesis, not only confirming evidence. Keep uncertainty and source locations explicit. Do not manufacture citations or imply that a search result is an experiment.

Before reporting completion, use one more `decide_read` call and check that the thesis, issue tree, source links, claims, and facts are present and internally consistent.

Never expose access or refresh tokens. Do not poll indefinitely. Return a concise progress summary after each batch.
