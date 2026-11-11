# 20minds plugins

Install **20minds Decide** to open your decision canvas, work with evidence and alternatives, and record decisions and outcomes. The package uses one core `decide` skill for case work and research, plus a Claude Code-only `case` shortcut for opening the workspace pane. It connects to the authenticated MCP server at `https://20minds.ai/mcp`.

## ChatGPT desktop / Codex

Register the marketplace from a terminal:

```sh
codex plugin marketplace add 20minds/agent-plugins
```

Restart ChatGPT desktop, open Plugins in Work or Codex mode, choose **20minds**, and install **20minds Decide**. Complete OAuth, start a new chat, and ask “Open my Decide workspace.” Canvas and extension surfaces depend on the host; tools remain useful in hosts without the UI.

To refresh the catalog after a release:

```sh
codex plugin marketplace upgrade 20minds
```

Reinstall the plugin to pick up changed package files. This release uses plugin ID `20minds`, the core skill `20minds:decide`, the Claude Code-only pane shortcut `20minds:case`, and MCP connection name `decide`. Uninstall the temporary `20minds-decide` package if installed.

## Claude Code

```text
/plugin marketplace add 20minds/agent-plugins
/plugin install 20minds@20minds
```

In Claude Code, `/20minds:case` opens a pane listing your projects and cases; pick one (or pass a case id) to see the case's findings, open unknowns, options and uncited sources (the mod is in `plugins/20minds/claude/`; the `case` skill is listed in Codex too but only works in Claude Code). Authenticate the `decide` MCP connection through the client's MCP controls. The bundled skills and tools work independently of ChatGPT-specific extension surfaces.

## Ownership

This repository owns the distributable manifest, connection configuration, skills, artwork, and marketplace. [20minds/decide](https://github.com/20minds/decide) owns the product, extension frontend, MCP tools, OAuth, database access, and deployment.

The canvas HTML is delivered as an MCP resource by the backend. It is not bundled here. No user data or credentials belong in this repository.

## Maintain and release

Edit `plugins/20minds/plugin.json`, `mcp.json`, and `skills/`. The root manifests use Agent Plugins 1.0. Keep package identity `20minds` and marketplace identity `20minds` consistent.

Claude and Codex client manifests are generated adapters. After changing portable metadata or the endpoint, run:

```sh
node scripts/generate-adapters.mjs
```

Commit the generated files with the source changes. Do not edit them independently. Run `node scripts/check.mjs` before opening a PR; CI checks manifests, asset paths, skills, MCP configuration, and generated adapter consistency.

For a release:

1. Bump the portable manifest's semantic version when package contents change.
2. For changes involving tools or canvas behavior, deploy the corresponding Decide backend and UI first.
3. Regenerate adapters, review package changes, and merge the release PR here.
4. Install in the intended host, complete OAuth, and exercise the affected workflow before announcing availability.

Canvas-only releases require a Decide deployment. Package metadata, skill, or connection changes require a release here. There is no package-copy or synchronization step between the repositories.

See [OpenAI's marketplace documentation](https://developers.openai.com/plugins/build/plugins) for installation and catalog behavior.

## License

See [LICENSE.md](LICENSE.md).

## Updates and migration

Backend deployments deliver canvas changes the next time its resource is loaded. Close and reopen an existing canvas after an update. Skills, icons, and package metadata are cached by the client: refresh the marketplace and reinstall the package to receive those changes. A backend deployment does not refresh installed skills.

Version 0.6.0 restored plugin identity `20minds`. Version 0.8.6 consolidates case management and research in `20minds:decide`; the separate `20minds:case` shortcut only opens the Claude Code pane. Uninstall the temporary `20minds-decide` package, install `20minds`, and authenticate the MCP connection `decide`. Workspace data stays on the same server. No alias for the temporary identity is retained.

## First extension release checklist

Record results in the release PR; do not infer host support from the browser preview.

- Deploy the matching backend commit and compiled UI before publishing this package.
- In a fresh ChatGPT desktop installation/session, register the marketplace and install the plugin. Confirm the name, icon, tools, OAuth consent, successful login, and reconnection.
- Open the workspace from the conversation and sidebar entrypoints. Open a decision, select a card, and verify the next prompt receives the intended context.
- Create a disposable project/decision, edit a card, take and reopen a decision, and record an outcome. Confirm persistence after closing and reopening the canvas.
- Check sign-out and denied access; another account must not see the disposable workspace. Delete the disposable data afterward.
- Exercise the previous released package against the deployed backend to document the upgrade impact. The old identity is unsupported; if its tools fail, tell users to migrate before release announcement.
- Confirm the generated client adapters connects and the bundled skills can use the current tools.
- Publish only after recording host version, backend commit, package version, and results. Install failures and incomplete checks must remain explicit.

### Desktop MCP loading

Version 0.5.2 fixes a confirmed desktop parser error: per-server `extensions.com.openai.auth` in portable `mcp.json` was rejected as an unknown field. The HTTP entry now contains only `type` and `url`. OAuth remains enforced by the server and is discovered through its authentication challenge; no credentials are stored in the package.

The generated Codex manifest explicitly references skills and `.mcp.json`. Portable root files remain authoritative. After publishing, refresh the marketplace, reinstall the plugin, and start a new chat. Complete OAuth if prompted. The presence of skills alone does not establish that the MCP server connected. If tools remain unavailable, inspect the runtime MCP startup error rather than repeatedly reinstalling.

### Authenticate the MCP connection

If skills load but tools are unavailable, check the MCP startup error. `Auth required` during initialize means the package was parsed and the server was reached, but login is still needed. Authenticate the connection named `decide` in the client's MCP controls or run:

```sh
codex mcp login decide
```

Complete the browser consent flow, then start a new chat. Reinstalling the package alone does not complete OAuth. Public plugin search does not list this repository marketplace package; use the configured **20minds** marketplace.
