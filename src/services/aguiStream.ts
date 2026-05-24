// AGUI protocol stream parser + reducer.
// Stubs only — RED phase. Implementation lands in GREEN.

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

const NOT_IMPL = 'NotImplemented'

export function createAguiParser(): AguiStreamParser {
  void 0
  throw new Error(NOT_IMPL)
}

export const initialChatStreamState: ChatStreamState = {
  content: '',
  tools: [],
  toolIndexById: {},
  toolArgsBuffers: {},
  doneCause: null,
}

export function reduceAguiEvent(
  _state: ChatStreamState,
  _event: AguiEvent,
): ChatStreamState {
  throw new Error(NOT_IMPL)
}
