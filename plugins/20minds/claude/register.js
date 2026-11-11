// Reads cases through this plugin's own MCP server (`decide` in ../.mcp.json), which Claude Code
// has already signed in to, so this mod never sees a token.
// $.mcp.connect takes the server's name in the plugin manifest; $.mcp.call matches the full tool name
// (mcp__plugin_20minds_decide__case_projects), so it needs the plugin-qualified name.
const SERVER = 'decide'
const TOOLS = 'plugin_20minds_decide'
const PANE = 'decide-case'

let caseId = null   // null shows the project and case list
let detail = null
let projects = null // [{ id, name, cases: [{ id, title }] }]
let problem = null

// $.mcp.connect waits for the server and says why it is not available (for example, not signed in).
// $.mcp.call returns MCP content blocks; the tools put their JSON in the text block.
async function call($, tool, args = {}) {
  const link = await $.mcp.connect(SERVER)
  if (!link.isConnected) throw new Error(link.message)
  const result = await $.mcp.call(TOOLS, tool, args)
  const text = result.content.filter(block => block.type === 'text').map(block => block.text).join('')
  if (result.isError) throw new Error(text)
  const data = JSON.parse(text)
  return data.result ?? data
}

async function load($) {
  problem = null
  try {
    if (caseId) {
      detail = await call($, 'case_outline', { case_id: caseId })
    } else {
      const { projects: list } = await call($, 'case_projects')
      projects = await Promise.all(list.map(async project => ({
        ...project, cases: await call($, 'case_list', { project_id: project.id }),
      })))
    }
  } catch (error) {
    problem = `Could not read from the "${SERVER}" MCP server: ${error?.message ?? error}`
    await $.ui.log(problem)
  }
  $.ui.invalidate('ui.render')
}

// Mod command names cannot contain a colon, so there is no mod command. /20minds:case is a plugin
// skill (claude/skills/case) that calls this tool.
async function openPane($, id) {
  caseId = (id || '').trim() || null
  detail = null
  await $.ui.open({ id: PANE, title: 'Decide', focus: true, closeOnEscape: true })
  await load($)
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'open_case_pane',
      description: 'Open the Decide pane in Claude Code: the user\'s projects and cases, or one case when a case id is given.',
      inputSchema: { type: 'object', properties: { case_id: { type: 'string', description: 'Optional case id' } } },
    })
    return next(e)
  })

  on('tool.call', { tool: 'mcp__20minds__open_case_pane' }, async ($, e) => {
    await openPane($, e.case_id)
    return { result: 'Opened the Decide pane.' }
  })

  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== PANE) return next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    const open = id => { caseId = id; detail = null; return load($) }
    const clip = (text, n = 220) => text.length > n ? text.slice(0, n - 1) + '…' : text

    // The web board's lanes, in its order and colors: a bordered lane of bordered cards,
    // each card a statement with a dim line of labels beneath it.
    const card = ({ text, chips }) => Box({ borderStyle: 'round', borderDimColor: true, paddingX: 1, flexDirection: 'column', children: [
      Text({ children: [clip(text)] }),
      ...(chips.length ? [Text({ dimColor: true, children: [chips.join(' · ')] })] : []),
    ] })
    const lane = (title, color, cards) => cards.length ? Box({
      borderStyle: 'round', borderColor: color, paddingX: 1, flexDirection: 'column', rowGap: 0, flexGrow: 1,
      children: [Text({ bold: true, color, children: [`${title} (${cards.length})`] }), ...cards.map(card)],
    }) : null
    const chips = (...values) => values.filter(Boolean).map(value => value.replace(/_/g, ' '))

    let body
    if (problem) body = [Text({ children: [problem] })]
    else if (caseId && !detail) body = [Text({ children: ['Loading…'] })]
    else if (caseId) body = [
      Box({ flexDirection: 'column', children: [
        Text({ bold: true, children: [detail.case.title] }),
        Text({ dimColor: true, children: [detail.case.question] }),
      ] }),
      // Left to right as on the web board: the evidence, what is unknown, the options, then the conclusion.
      Box({ flexDirection: 'row', flexWrap: 'wrap', columnGap: 1, rowGap: 1, children: [
        lane('Findings', 'green', detail.findings.map(item => ({ text: item.statement, chips: chips(item.verdict, item.confidence) }))),
        lane('Sources not yet cited', 'gray', detail.uncited_sources.map(source => ({ text: source.source_title || source.source_ref, chips: [] }))),
        lane('Unknowns', 'yellow', detail.open_unknowns.map(item => ({ text: item.description, chips: chips(item.status) }))),
        lane('Options', 'magenta', detail.options.map(item => ({ text: item.description, chips: chips(item.strength) }))),
        lane('Conclusion', 'blue', detail.conclusion ? [{ text: detail.conclusion.answer, chips: chips(detail.conclusion.confidence) }] : []),
      ].filter(Boolean) }),
    ]
    else if (!projects) body = [Text({ children: ['Loading…'] })]
    else if (!projects.length) body = [Text({ children: ['No projects yet. Create one at https://20minds.ai/decide/'] })]
    else body = projects.map(project => Box({ borderStyle: 'round', borderColor: 'gray', paddingX: 1, flexDirection: 'column', children: [
      Text({ bold: true, children: [project.name] }),
      ...(project.cases.length ? project.cases.map(item => Button({
        key: 'case-' + item.id, label: item.title, plain: true, onPress: () => open(item.id),
      })) : [Text({ dimColor: true, children: ['No cases'] })]),
    ] }))

    return Box({ flexDirection: 'column', rowGap: 1, children: [
      ...body,
      Box({ flexDirection: 'row', columnGap: 2, children: [
        ...(caseId ? [Button({ key: 'back', label: 'All cases', hotkey: 'b', onPress: () => open(null) })] : []),
        Button({ key: 'refresh', label: 'Refresh', hotkey: 'r', onPress: () => load($) }),
      ] }),
    ] })
  })
}
