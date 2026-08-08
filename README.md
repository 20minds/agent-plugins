# 20minds Plugin

Connect your AI coding tool to [20minds Decide](https://20minds.ai/decide/). The `20minds` plugin gives your agent two skills:

- **`20minds:decide`**: pose, research, triage, and take decisions in 20minds Decide.
- **`20minds:research`**: run the Airedale research workflow with a falsifiable thesis, evidence discipline, and dependency ordering.

The plugin registers the authenticated 20minds MCP server, so the agent can work with your 20minds workspace after you sign in.

## What is a plugin?

A plugin packages instructions and integrations for an AI coding tool. In this repository, the `20minds` plugin bundles the `decide` and `research` skills and includes the configuration needed to connect them to 20minds Decide.

Installing the plugin gives your agent reusable workflows and tells it how to use the 20minds tools. The plugin itself does not contain your workspace data.

## What is an MCP server?

MCP, the Model Context Protocol, is a standard way for an AI agent to connect to external tools and services. An MCP server exposes those tools to the agent through an authenticated connection.

The 20minds MCP server is available at `https://20minds.ai/mcp`. It provides access to the 20minds Decide workspace and decision-making capabilities. The plugin configures this connection for you; you still need to authenticate before using it.

## Getting started

The quickest setup is to install the plugin from this marketplace in the client you use. The marketplace is hosted at [`20minds/agent-plugins`](https://github.com/20minds/agent-plugins), and the plugin is named `20minds`.

Once installed, sign in when your client asks for access to the 20minds MCP server. In Claude Code, the login command is:

```text
claude mcp login 20minds
```

Then start a new agent session and ask it to use 20minds Decide, for example to help frame a decision or research a thesis. If the server does not appear, restart the client and check its MCP tools or server list.

## Connect to Claude Code (Terminal)

### Plugin (recommended)

Run these commands in Claude Code:

```text
/plugin marketplace add 20minds/agent-plugins
/plugin install 20minds@20minds
```

After installation, authenticate the MCP server:

```text
claude mcp login 20minds
```

Use `/mcp` to confirm that the `20minds` server is connected.

### Manual MCP setup

If you do not want to install the plugin, add the remote server directly:

```text
claude mcp add 20minds --transport http https://20minds.ai/mcp --scope user
claude mcp login 20minds
```

This connects the MCP server but does not install the `decide` and `research` skills.

## Connect to Claude Desktop

### Plugin (recommended)

1. Open Claude Desktop and go to **Code**.
2. Open **Customize** in the sidebar.
3. Next to **Personal plugins**, choose **Add plugin** → **Create plugin** → **Add marketplace**.
4. Enter `20minds/agent-plugins` and submit it.
5. Open the marketplace's **Code** tab and install **20minds**.

Start a new Claude Code session from Claude Desktop and confirm the server from `/mcp`.

### Manual MCP setup

Open **Settings** → **Developer** → **Edit Config**, and add the `20minds` entry inside `mcpServers`:

```json
{
  "mcpServers": {
    "20minds": {
      "command": "npx",
      "args": ["mcp-remote", "https://20minds.ai/mcp"]
    }
  }
}
```

Restart Claude Desktop after saving the file. Manual setup connects the MCP server, but does not install the plugin skills.

## Connect to Codex

### Plugin (recommended)

In a terminal with Codex installed, add this marketplace:

```text
codex plugin marketplace add 20minds/agent-plugins
```

Then open `/plugins`, select the `20minds/agent-plugins` marketplace, and install the `20minds` plugin.

### Manual MCP setup

In the Codex app, go to **Settings** → **MCP Servers** → **Add custom MCP server**. Choose **Streamable HTTP**, use `20minds` as the name, and enter:

```text
https://20minds.ai/mcp
```

Save the server and confirm that it appears in the MCP server list. Manual setup connects the server without installing the plugin skills.

## Connect to OpenCode

Add the remote server to `opencode.json`:

```json
{
  "mcp": {
    "20minds": {
      "type": "remote",
      "url": "https://20minds.ai/mcp",
      "enabled": true
    }
  }
}
```

Restart OpenCode if needed, then check the connection with:

```text
opencode mcp list
```

## Verify the connection

Open a new chat and ask the agent to use 20minds Decide to help with a small decision. The agent should request permission to use the `20minds` MCP server and then show the relevant workspace or decision tools. If the request fails, restart the client and begin a fresh session.

## Validate locally

```text
claude plugin validate .
```
