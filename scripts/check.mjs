import assert from 'node:assert/strict'
import { readFileSync, readdirSync, lstatSync, realpathSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const fail = message => { throw new Error(message) }
const contained = (base, path) => {
  const target = realpathSync(resolve(base, path))
  const rel = relative(realpathSync(base), target)
  assert(rel && rel !== '..' && !rel.startsWith('..' + sep) && !rel.startsWith(sep), `Path escapes package: ${path}`)
  return target
}
const marketplace = json('.agents/plugins/marketplace.json')
assert.equal(marketplace.name, '20minds')
const names = new Set()
for (const entry of marketplace.plugins) {
  assert(!names.has(entry.name), `Duplicate plugin: ${entry.name}`)
  names.add(entry.name)
  assert.equal(entry.source.source, 'local')
  assert(entry.source.path.startsWith('./'))
  const folder = contained(root, entry.source.path)
  const plugin = JSON.parse(readFileSync(resolve(folder, 'plugin.json'), 'utf8'))
  assert.equal(plugin.name, entry.name)
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plugin.name) && plugin.name.length <= 64)
  assert(/^\d+\.\d+\.\d+$/.test(plugin.version), 'Use a stable semantic version')
  assert(plugin.description && plugin.author?.name && plugin.license)
  assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json')
  for (const field of ['skills', 'mcpServers', 'apps', 'interface']) assert(!(field in plugin), `Nonportable field: ${field}`)
  const ui = plugin.extensions['com.openai'].interface
  assert(ui.displayName && ui.shortDescription && ui.shortDescription.length <= 30)
  for (const key of ['logo', 'composerIcon']) assert(lstatSync(contained(folder, ui[key])).isFile())
  assert.equal(entry.policy.installation, 'AVAILABLE')
  assert.equal(entry.policy.authentication, 'ON_INSTALL')
  assert(entry.category)
  const mcp = JSON.parse(readFileSync(resolve(folder, 'mcp.json'), 'utf8'))
  assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json')
  assert(Object.keys(mcp.mcpServers).length > 0)
  for (const server of Object.values(mcp.mcpServers)) {
    assert.equal(server.type, 'streamable-http')
    const url = new URL(server.url)
    assert.equal(url.protocol, 'https:')
    assert(!url.username && !url.password && !url.search && !url.hash)
    assert.deepEqual(Object.keys(server).sort(), ['type', 'url'], 'Desktop HTTP configuration accepts only the transport and endpoint; OAuth is discovered from the server challenge')
    assert(!server.headers && !server.env, 'Credentials do not belong in the package')
  }
  for (const skill of readdirSync(resolve(folder, 'skills'))) {
    const text = readFileSync(contained(folder, `skills/${skill}/SKILL.md`), 'utf8')
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
    assert(frontmatter, `Missing frontmatter: ${skill}`)
    assert(frontmatter[1].split(/\r?\n/).includes(`name: ${skill}`))
    assert(/^description: .+/m.test(frontmatter[1]))
  }
  const walk = path => {
    for (const name of readdirSync(path)) {
      const child = resolve(path, name)
      const stat = lstatSync(child)
      assert(!stat.isSymbolicLink(), `Symlink in plugin: ${child}`)
      assert(!['node_modules', '.env', '.git'].includes(name), `Unexpected packaged file: ${child}`)
      if (stat.isDirectory()) walk(child)
    }
  }
  walk(folder)
}
// Compare bytes before/after generation, including untracked release files.
const generated = ['.claude-plugin/marketplace.json', 'plugins/20minds/.claude-plugin/plugin.json', 'plugins/20minds/.mcp.json', 'plugins/20minds/.codex-plugin/plugin.json']
const before = generated.map(path => readFileSync(resolve(root, path), 'utf8'))
const result = spawnSync(process.execPath, [resolve(root, 'scripts/generate-adapters.mjs')], { stdio: 'inherit' })
if (result.status !== 0) fail('Adapter generation failed')
for (const [index, path] of generated.entries()) assert.equal(readFileSync(resolve(root, path), 'utf8'), before[index], `Generated adapter is stale: ${path}; regenerate and commit`)
console.log('Plugin manifests, paths, skills, assets, MCP configuration, and generated adapters are consistent.')
