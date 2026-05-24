import { describe, it, expect } from 'vitest'
import {
  createAguiParser,
  initialChatStreamState,
  reduceAguiEvent,
  AguiEvent,
  ChatStreamState,
} from './aguiStream'
import {
  AGUI_SAMPLE_STREAM,
  AGUI_SAMPLE_TOOL_RESULT,
} from './__fixtures__/aguiSampleStream'

// Helper: drive a parser with one or more chunks and collect all emitted events.
function drainParser(chunks: string[]): AguiEvent[] {
  const parser = createAguiParser()
  const out: AguiEvent[] = []
  for (const c of chunks) out.push(...parser.push(c))
  out.push(...parser.flush())
  return out
}

function applyAll(events: AguiEvent[]): ChatStreamState {
  return events.reduce(reduceAguiEvent, initialChatStreamState)
}

describe('createAguiParser', () => {
  // B1: skip blank/comment/event-header lines that don't carry data
  it('B1: yields no events for blank lines, SSE comments, or bare event headers', () => {
    const events = drainParser([': init   \n', '\n', 'event: meta\n', '\n'])
    // event: meta with no following data line should not emit anything
    expect(events).toEqual([])
  })

  // B2: event: done envelope yields a synthetic STREAM_DONE
  it('B2: emits STREAM_DONE for `event: done` + `data: {"done":true}`', () => {
    const events = drainParser(['event: done\ndata: {"done":true}\n\n'])
    expect(events).toEqual([{ type: 'STREAM_DONE' }])
  })

  // B3: event: meta envelope yields a synthetic STREAM_META with sessionId
  it('B3: emits STREAM_META with sessionId for `event: meta` envelope', () => {
    const events = drainParser([
      'event: meta\ndata: {"sessionId":"abc"}\n\n',
    ])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: 'STREAM_META',
      sessionId: 'abc',
    })
  })

  // B4: bare `data: "<double-encoded JSON>"` yields the decoded AGUI event
  it('B4: decodes double-encoded JSON payloads on bare data lines', () => {
    const events = drainParser([
      'data: "{\\"type\\":\\"RUN_STARTED\\",\\"threadId\\":\\"t1\\",\\"runId\\":\\"r1\\"}"\n\n',
    ])
    expect(events).toEqual([
      { type: 'RUN_STARTED', threadId: 't1', runId: 'r1' },
    ])
  })

  // B5: malformed JSON on a data line is silently skipped
  it('B5: skips malformed JSON payloads without throwing', () => {
    expect(() =>
      drainParser(['data: "{not-json\n\n', 'data: garbage\n\n']),
    ).not.toThrow()
    const events = drainParser(['data: "{not-json\n\n', 'data: garbage\n\n'])
    expect(events).toEqual([])
  })

  // B6: a payload split across two chunks reassembles correctly
  it('B6: reassembles a `data:` line split across chunk boundaries', () => {
    const parser = createAguiParser()
    const first = parser.push('data: "{\\"type\\":\\"TE')
    expect(first).toEqual([])
    const second = parser.push(
      'XT_MESSAGE_CONTENT\\",\\"messageId\\":\\"m\\",\\"delta\\":\\"hi\\"}"\n\n',
    )
    expect(second).toEqual([
      {
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm',
        delta: 'hi',
      },
    ])
  })
})

describe('reduceAguiEvent', () => {
  // B7: text deltas concatenate into state.content
  it('B7: concatenates TEXT_MESSAGE_CONTENT deltas into content', () => {
    const state = applyAll([
      { type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant' },
      { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'Hello' },
      { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: ' world' },
      { type: 'TEXT_MESSAGE_END', messageId: 'm1' },
    ])
    expect(state.content).toBe('Hello world')
    expect(state.tools).toEqual([])
  })

  // B8: TOOL_CALL_START creates running tool + inserts marker
  it('B8: appends a running tool and inserts inline marker on TOOL_CALL_START', () => {
    const state = applyAll([
      {
        type: 'TOOL_CALL_START',
        toolCallId: 'tc1',
        toolCallName: 'get_all_projects',
      },
    ])
    expect(state.tools).toHaveLength(1)
    expect(state.tools[0]).toMatchObject({
      tool: 'get_all_projects',
      toolUseId: 'tc1',
      status: 'running',
      input: {},
    })
    expect(state.content).toContain('::tool::0::')
    expect(state.toolIndexById['tc1']).toBe(0)
  })

  // B9: accumulated TOOL_CALL_ARGS deltas are JSON-parsed on TOOL_CALL_END
  it('B9: parses accumulated TOOL_CALL_ARGS into tool.input on END', () => {
    const state = applyAll([
      {
        type: 'TOOL_CALL_START',
        toolCallId: 'tc1',
        toolCallName: 'foo',
      },
      { type: 'TOOL_CALL_ARGS', toolCallId: 'tc1', delta: '{"k":' },
      { type: 'TOOL_CALL_ARGS', toolCallId: 'tc1', delta: ' 1}' },
      { type: 'TOOL_CALL_END', toolCallId: 'tc1' },
    ])
    expect(state.tools[0].input).toEqual({ k: 1 })
    // tool stays 'running' until TOOL_CALL_RESULT arrives
    expect(state.tools[0].status).toBe('running')
  })

  // B10: TOOL_CALL_END without args leaves input as {} and does not crash
  it('B10: TOOL_CALL_END with no prior args keeps input={}', () => {
    const state = applyAll([
      {
        type: 'TOOL_CALL_START',
        toolCallId: 'tc1',
        toolCallName: 'noargs',
      },
      { type: 'TOOL_CALL_END', toolCallId: 'tc1' },
    ])
    expect(state.tools[0].input).toEqual({})
    expect(state.tools[0].status).toBe('running')
  })

  // B11: TOOL_CALL_RESULT updates tool to success with result content
  it('B11: TOOL_CALL_RESULT sets tool.result and status=success', () => {
    const state = applyAll([
      {
        type: 'TOOL_CALL_START',
        toolCallId: 'tc1',
        toolCallName: 'foo',
      },
      { type: 'TOOL_CALL_END', toolCallId: 'tc1' },
      {
        type: 'TOOL_CALL_RESULT',
        toolCallId: 'tc1',
        content: 'the result',
        role: 'tool',
      },
    ])
    expect(state.tools[0].result).toBe('the result')
    expect(state.tools[0].status).toBe('success')
  })

  // B12: TOOL_CALL_START mid-stream inserts marker at current text position
  it('B12: inserts tool marker at current content position when started mid-text', () => {
    const state = applyAll([
      { type: 'TEXT_MESSAGE_START', messageId: 'm1', role: 'assistant' },
      { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'before ' },
      {
        type: 'TOOL_CALL_START',
        toolCallId: 'tc1',
        toolCallName: 'inline',
      },
      { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'after' },
    ])
    const beforeIdx = state.content.indexOf('before')
    const markerIdx = state.content.indexOf('::tool::0::')
    const afterIdx = state.content.indexOf('after')
    expect(beforeIdx).toBeGreaterThanOrEqual(0)
    expect(markerIdx).toBeGreaterThan(beforeIdx)
    expect(afterIdx).toBeGreaterThan(markerIdx)
  })

  // B13: RUN_FINISHED sets doneCause='finished'
  it('B13: RUN_FINISHED sets doneCause=finished', () => {
    const state = applyAll([{ type: 'RUN_FINISHED' }])
    expect(state.doneCause).toBe('finished')
  })

  // B14: RUN_ERROR captures errorMessage and sets doneCause='error'
  it('B14: RUN_ERROR sets doneCause=error and captures errorMessage', () => {
    const state = applyAll([
      { type: 'RUN_ERROR', message: 'boom', code: 'E500' },
    ])
    expect(state.doneCause).toBe('error')
    expect(state.errorMessage).toBe('boom')
  })

  // B15: STREAM_DONE transitions doneCause when nothing more authoritative has fired
  it('B15: STREAM_DONE sets doneCause=done (only if not already finished/error)', () => {
    const a = applyAll([{ type: 'STREAM_DONE' }])
    expect(a.doneCause).toBe('done')

    const b = applyAll([
      { type: 'RUN_FINISHED' },
      { type: 'STREAM_DONE' },
    ])
    expect(b.doneCause).toBe('finished')

    const c = applyAll([
      { type: 'RUN_ERROR', message: 'x' },
      { type: 'STREAM_DONE' },
    ])
    expect(c.doneCause).toBe('error')
  })

  // B16: defensive — TEXT_MESSAGE_CONTENT before START still appends (no crash)
  it('B16: tolerates TEXT_MESSAGE_CONTENT without preceding START', () => {
    const state = applyAll([
      { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: 'orphan' },
    ])
    expect(state.content).toBe('orphan')
  })

  // B17: TOOL_CALL_RESULT for unknown toolCallId is silently ignored
  it('B17: TOOL_CALL_RESULT for unknown toolCallId leaves state unchanged', () => {
    const state = applyAll([
      {
        type: 'TOOL_CALL_RESULT',
        toolCallId: 'never_started',
        content: 'x',
      },
    ])
    expect(state.tools).toEqual([])
    expect(state.content).toBe('')
  })

  // STREAM_META carries sessionId onto state
  it('STREAM_META event records sessionId on state', () => {
    const state = applyAll([{ type: 'STREAM_META', sessionId: 'abc' }])
    expect(state.sessionId).toBe('abc')
  })
})

describe('end-to-end fixture replay', () => {
  // B18: full sample stream produces expected state
  it('B18: replays captured AGUI sample into the final expected state', () => {
    const parser = createAguiParser()
    const events = [...parser.push(AGUI_SAMPLE_STREAM), ...parser.flush()]

    // Sanity: at least the major event types were parsed
    const types = events.map((e) => e.type)
    expect(types).toContain('RUN_STARTED')
    expect(types).toContain('TOOL_CALL_START')
    expect(types).toContain('TOOL_CALL_END')
    expect(types).toContain('TOOL_CALL_RESULT')
    expect(types).toContain('TEXT_MESSAGE_START')
    expect(types).toContain('TEXT_MESSAGE_CONTENT')
    expect(types).toContain('TEXT_MESSAGE_END')
    expect(types).toContain('RUN_FINISHED')
    expect(types).toContain('STREAM_DONE')

    const finalState = events.reduce(reduceAguiEvent, initialChatStreamState)

    expect(finalState.sessionId).toBe('be78c480ea6949c7b1cf1762b28fdb805')
    expect(finalState.doneCause).toBe('finished')
    expect(finalState.tools).toHaveLength(1)
    expect(finalState.tools[0]).toMatchObject({
      tool: 'get_all_projects',
      toolUseId: 'tool_1',
      status: 'success',
      input: {},
      result: AGUI_SAMPLE_TOOL_RESULT,
    })
    expect(finalState.content).toContain('Here are the projects.')
    expect(finalState.content).toContain('::tool::0::')
    // Tool marker came before the text in this fixture (tool runs first)
    expect(
      finalState.content.indexOf('::tool::0::'),
    ).toBeLessThan(finalState.content.indexOf('Here are'))
  })
})
