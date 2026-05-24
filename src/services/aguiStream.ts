// AGUI protocol stream parser + reducer.
//
// Wire format (per .claude/agui-sample.txt captured from the Me Lambda):
//   - SSE comments:   `:` followed by padding, used as keep-alive
//   - Named events:   `event: meta` / `event: done` + a following `data:` line
//   - AGUI events:    bare `data: "<double-encoded-json>"` lines
//   - Event boundary: blank line resets the pending event name
//
// The parser is stateful (chunk buffering + pending event name); the reducer
// is pure.

export type AguiEvent = { type: string; [k: string]: unknown }

export type ChatStreamTool = {
  tool: string
  toolUseId: string
  input: Record<string, unknown>
  result?: string
  status: 'running' | 'success' | 'error'
}

export type ChatStreamDoneCause = 'finished' | 'error' | 'done'

export type ChatStreamState = {
  content: string
  tools: ChatStreamTool[]
  toolIndexById: Record<string, number>
  toolArgsBuffers: Record<string, string>
  doneCause: ChatStreamDoneCause | null
  errorMessage?: string
  sessionId?: string
}

export interface AguiStreamParser {
  push(chunk: string): AguiEvent[]
  flush(): AguiEvent[]
}

export const initialChatStreamState: ChatStreamState = {
  content: '',
  tools: [],
  toolIndexById: {},
  toolArgsBuffers: {},
  doneCause: null,
}

// Decodes an AGUI data payload. The Lambda emits double-encoded JSON
// (`data: "{\"type\":...}"`) so we may need a second JSON.parse pass.
function decodeAguiPayload(payload: string): AguiEvent | null {
  try {
    let data: unknown = JSON.parse(payload)
    if (typeof data === 'string' && data.trimStart().startsWith('{')) {
      data = JSON.parse(data)
    }
    if (
      data !== null &&
      typeof data === 'object' &&
      typeof (data as { type?: unknown }).type === 'string'
    ) {
      return data as AguiEvent
    }
  } catch {
    // malformed → silent skip
  }
  return null
}

export function createAguiParser(): AguiStreamParser {
  let buffer = ''
  let pendingEventName: string | null = null

  function processLine(rawLine: string): AguiEvent | null {
    if (rawLine.trim() === '') {
      // SSE event boundary — clear the named-event context
      pendingEventName = null
      return null
    }
    if (rawLine.startsWith(':')) return null // SSE keep-alive comment
    if (rawLine.startsWith('event:')) {
      pendingEventName = rawLine.slice('event:'.length).trim()
      return null
    }
    if (!rawLine.startsWith('data:')) return null

    const payload = rawLine.slice('data:'.length).trim()

    if (pendingEventName === 'done') return { type: 'STREAM_DONE' }
    if (pendingEventName === 'meta') {
      try {
        const meta = JSON.parse(payload) as { sessionId?: unknown }
        const sessionId =
          typeof meta?.sessionId === 'string' ? meta.sessionId : undefined
        return { type: 'STREAM_META', sessionId }
      } catch {
        return null
      }
    }

    if (!payload || payload === '[DONE]') return null
    return decodeAguiPayload(payload)
  }

  return {
    push(chunk: string): AguiEvent[] {
      buffer += chunk
      const out: AguiEvent[] = []
      while (true) {
        const newlineIdx = buffer.indexOf('\n')
        if (newlineIdx === -1) break
        const line = buffer.slice(0, newlineIdx)
        buffer = buffer.slice(newlineIdx + 1)
        const event = processLine(line)
        if (event) out.push(event)
      }
      return out
    },
    flush(): AguiEvent[] {
      if (buffer.length === 0) return []
      const line = buffer
      buffer = ''
      const event = processLine(line)
      return event ? [event] : []
    },
  }
}

// Inline marker used to position tool cards within the streaming content.
// The ChatMe view splits content on /(::tool::\d+::)/ and renders the indexed
// tool from state.tools at that position.
function toolMarker(index: number): string {
  return `\n::tool::${index}::\n`
}

export function reduceAguiEvent(
  state: ChatStreamState,
  event: AguiEvent,
): ChatStreamState {
  switch (event.type) {
    case 'TEXT_MESSAGE_CONTENT': {
      const delta = typeof event.delta === 'string' ? event.delta : ''
      if (!delta) return state
      return { ...state, content: state.content + delta }
    }

    case 'TOOL_CALL_START': {
      const toolCallId =
        typeof event.toolCallId === 'string' ? event.toolCallId : ''
      const toolCallName =
        typeof event.toolCallName === 'string' ? event.toolCallName : 'unknown'
      if (!toolCallId) return state
      const newTool: ChatStreamTool = {
        tool: toolCallName,
        toolUseId: toolCallId,
        input: {},
        status: 'running',
      }
      const index = state.tools.length
      return {
        ...state,
        tools: [...state.tools, newTool],
        toolIndexById: { ...state.toolIndexById, [toolCallId]: index },
        toolArgsBuffers: { ...state.toolArgsBuffers, [toolCallId]: '' },
        content: state.content + toolMarker(index),
      }
    }

    case 'TOOL_CALL_ARGS': {
      const toolCallId =
        typeof event.toolCallId === 'string' ? event.toolCallId : ''
      const delta = typeof event.delta === 'string' ? event.delta : ''
      if (!toolCallId || !delta) return state
      const prev = state.toolArgsBuffers[toolCallId] ?? ''
      return {
        ...state,
        toolArgsBuffers: {
          ...state.toolArgsBuffers,
          [toolCallId]: prev + delta,
        },
      }
    }

    case 'TOOL_CALL_END': {
      const toolCallId =
        typeof event.toolCallId === 'string' ? event.toolCallId : ''
      const idx = state.toolIndexById[toolCallId]
      if (idx === undefined) return state
      const accumulated = state.toolArgsBuffers[toolCallId] ?? ''
      let input: Record<string, unknown> = state.tools[idx]?.input ?? {}
      if (accumulated) {
        try {
          const parsed: unknown = JSON.parse(accumulated)
          if (parsed && typeof parsed === 'object') {
            input = parsed as Record<string, unknown>
          }
        } catch {
          // leave input as-is on malformed args
        }
      }
      const nextTools = state.tools.map((t, i) =>
        i === idx ? { ...t, input } : t,
      )
      return { ...state, tools: nextTools }
    }

    case 'TOOL_CALL_RESULT': {
      const toolCallId =
        typeof event.toolCallId === 'string' ? event.toolCallId : ''
      const idx = state.toolIndexById[toolCallId]
      if (idx === undefined) return state
      const content =
        typeof event.content === 'string'
          ? event.content
          : event.content !== undefined
            ? JSON.stringify(event.content)
            : ''
      const nextTools = state.tools.map((t, i) =>
        i === idx ? { ...t, result: content, status: 'success' as const } : t,
      )
      return { ...state, tools: nextTools }
    }

    case 'RUN_FINISHED':
      return { ...state, doneCause: 'finished' }

    case 'RUN_ERROR': {
      const message =
        typeof event.message === 'string' ? event.message : 'Unknown error'
      return { ...state, doneCause: 'error', errorMessage: message }
    }

    case 'STREAM_DONE':
      if (state.doneCause === null) return { ...state, doneCause: 'done' }
      return state

    case 'STREAM_META': {
      const sessionId =
        typeof event.sessionId === 'string' ? event.sessionId : undefined
      if (!sessionId) return state
      return { ...state, sessionId }
    }

    // RUN_STARTED, TEXT_MESSAGE_START/END, and any unknown event types are
    // intentional no-ops at the state-reducer level.
    default:
      return state
  }
}
