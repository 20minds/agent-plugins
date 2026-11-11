---
name: case
description: Open the Decide pane in Claude Code to browse your projects and cases, or open one case by id.
disable-model-invocation: true
---

# Decide pane

Call the `open_case_pane` tool now. If the user gave a case id, pass it as `case_id`; otherwise call it with no arguments. Then reply with one short line saying the pane is open. Do not read or summarize any cases yourself.

If the tool is not available, say that the Decide pane exists only in Claude Code with this plugin's mod loaded (check `/plugin`), and offer to use the `decide` skill to look at cases instead.
