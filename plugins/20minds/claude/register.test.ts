import { expect, test } from 'claude-code/testing'

type Hook = (...args: unknown[]) => unknown
const text = (value: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(value) }], isError: false })

async function run(args: string, on: (event: string, hook: Hook) => void, $: any, mcp: { connect: unknown; call?: unknown }) {
  const logged: string[] = []
  const opened: unknown[] = []
  const calls: unknown[][] = []
  on('ui.open', (...a) => { opened.push(a[1] ?? a[0]); return { value: undefined } })
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.log', (...a) => { logged.push(((a[1] ?? a[0]) as { text: string }).text); return { value: undefined } })
  on('mcp.connect', () => ({ value: mcp.connect }))
  on('mcp.call', (...a) => { calls.push(a); return { value: typeof mcp.call === 'function' ? mcp.call(a) : mcp.call } })
  const answer = await $.tool.call({ tool: 'mcp__20minds__open_case_pane', ...(args ? { case_id: args } : {}) })
  return { answer, logged, opened, calls }
}

test('/20minds:case opens the pane and reads the project list from the plugin server', async ($, on) => {
  let n = 0
  const { answer, logged, opened, calls } = await run('', on, $, {
    connect: { isConnected: true },
    call: () => (n++ === 0 ? text({ projects: [{ id: 'p1', name: 'Yarn AI' }] }) : text({ result: [{ id: 'c1', title: 'Pricing' }] })),
  })
  expect(answer.result).toBe('Opened the Decide pane.')
  expect(JSON.stringify(opened)).toContain('decide-case')
  expect(logged).toEqual([])
  expect(calls.length).toBe(2) // case_projects, then case_list for the one project
})

test('/20minds:case reports why the server is unavailable, such as not being signed in', async ($, on) => {
  const { answer, logged } = await run('', on, $, {
    connect: { isConnected: false, reason: 'auth', message: 'The MCP server needs you to sign in; run /mcp to authenticate.' },
  })
  expect(answer.result).toBe('Opened the Decide pane.')
  expect(logged[0]).toContain('Could not read from the "decide" MCP server')
  expect(logged[0]).toContain('run /mcp to authenticate')
})

test('/20minds:case shows a tool error instead of failing silently', async ($, on) => {
  const { logged } = await run('missing-case', on, $, {
    connect: { isConnected: true },
    call: { content: [{ type: 'text', text: 'Case not found' }], isError: true },
  })
  expect(logged[0]).toContain('Case not found')
})

// The host validates element props when it draws, so draw the real tree on both surfaces.
test('the case view draws as lanes of cards on the terminal and the desktop', async ($, on) => {
  const outline = {
    case: { id: 'c1', title: 'Beachhead', question: 'Which segment first?', status: 'open', version: 3 },
    conclusion: { id: 'k1', answer: 'Start with formulators', confidence: 'medium' },
    findings: [{ statement: 'Cycle time falls 30%', verdict: 'supported', confidence: 'uncertain' }],
    open_unknowns: [{ description: 'Will pilots convert?', status: 'open' }],
    options: [{ description: 'Coatings', strength: 'strongest' }],
    uncited_sources: [{ source_ref: 'https://example.com', source_title: 'Analyst note' }],
  }
  on('ui.open', () => ({ value: undefined }))
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('mcp.connect', () => ({ value: { isConnected: true } }))
  on('mcp.call', () => ({ value: text(outline) }))
  await $.tool.call({ tool: 'mcp__20minds__open_case_pane', case_id: 'c1' })
  for (const surface of ['terminal', 'desktop']) {
    const tree = JSON.stringify(await ($ as any).ui.render({ component: 'Pane', requestId: 'decide-case', surface, props: {} }))
    for (const lane of ['Conclusion', 'Options (1)', 'Unknowns (1)', 'Findings (1)', 'Sources not yet cited (1)'])
      expect(tree).toContain(lane)
    expect(tree).toContain('supported · uncertain')
    const at = (lane: string) => tree.indexOf(lane)
    expect([at('Findings'), at('Sources not yet cited'), at('Unknowns'), at('Options'), at('Conclusion')]).toEqual(
      [at('Findings'), at('Sources not yet cited'), at('Unknowns'), at('Options'), at('Conclusion')].sort((a, b) => a - b))
  }
})
