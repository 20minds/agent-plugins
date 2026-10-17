import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../', import.meta.url))
const folder = 'plugins/20minds'
const plugin = JSON.parse(readFileSync(resolve(root, folder, 'plugin.json'), 'utf8'))
const mcp = JSON.parse(readFileSync(resolve(root, folder, 'mcp.json'), 'utf8'))
const write = (path, value) => writeFileSync(resolve(root, path), JSON.stringify(value, null, 2) + '\n')
mkdirSync(resolve(root, '.claude-plugin'), { recursive: true })
mkdirSync(resolve(root, folder, '.claude-plugin'), { recursive: true })
write('.claude-plugin/marketplace.json', { name: '20minds', owner: plugin.author, plugins: [{ name: plugin.name, source: './' + folder, description: plugin.description, license: plugin.license }] })
write(folder + '/.claude-plugin/plugin.json', { name: plugin.name, version: plugin.version, description: plugin.description, author: plugin.author, homepage: plugin.extensions['com.openai'].interface.websiteURL, repository: plugin.repository, license: plugin.license, mcpServers: './.mcp.json' })
write(folder + '/.mcp.json', { mcpServers: Object.fromEntries(Object.entries(mcp.mcpServers).map(([name, server]) => [name, { type: 'http', url: server.url }])) })

// Older desktop runtimes load the explicit Codex manifest and MCP path.
mkdirSync(resolve(root, folder, '.codex-plugin'), { recursive: true })
write(folder + '/.codex-plugin/plugin.json', { name: plugin.name, version: plugin.version, description: plugin.description, author: plugin.author, homepage: plugin.extensions['com.openai'].interface.websiteURL, repository: plugin.repository, license: plugin.license, skills: './skills/', mcpServers: './.mcp.json', interface: plugin.extensions['com.openai'].interface })
