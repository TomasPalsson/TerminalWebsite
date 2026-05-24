// Verbatim-shortened AGUI stream sample captured from the Me agent Lambda.
// Used by aguiStream.test.ts to exercise the parser end-to-end against bytes
// the real backend actually emits (double-encoded JSON, SSE comment padding,
// and the `event: meta` / `event: done` envelope events).

const PAD = ' '.repeat(800) // matches the real keep-alive padding shape

export const AGUI_SAMPLE_STREAM = [
  `: init${PAD}`,
  '',
  'event: meta',
  'data: {"sessionId":"be78c480ea6949c7b1cf1762b28fdb805"}',
  '',
  'data: "{\\"type\\":\\"RUN_STARTED\\",\\"threadId\\":\\"be78c480ea6949c7b1cf1762b28fdb805\\",\\"runId\\":\\"02caccc4145f4e0e925063d580901e4c\\"}"',
  '',
  'data: "{\\"type\\": \\"TOOL_CALL_START\\", \\"toolCallId\\": \\"tool_1\\", \\"toolCallName\\": \\"get_all_projects\\"}"',
  '',
  'data: "{\\"type\\": \\"TOOL_CALL_END\\", \\"toolCallId\\": \\"tool_1\\"}"',
  '',
  'data: "{\\"type\\": \\"TOOL_CALL_RESULT\\", \\"toolCallId\\": \\"tool_1\\", \\"content\\": \\"{\\\\\\"canvas_app\\\\\\": {\\\\\\"name\\\\\\": \\\\\\"Canvas App\\\\\\"}}\\", \\"role\\": \\"tool\\"}"',
  '',
  'data: "{\\"type\\":\\"TEXT_MESSAGE_START\\",\\"messageId\\":\\"msg_1\\",\\"role\\":\\"assistant\\"}"',
  '',
  'data: "{\\"type\\":\\"TEXT_MESSAGE_CONTENT\\",\\"messageId\\":\\"msg_1\\",\\"delta\\":\\"Here are the\\"}"',
  '',
  'data: "{\\"type\\":\\"TEXT_MESSAGE_CONTENT\\",\\"messageId\\":\\"msg_1\\",\\"delta\\":\\" projects.\\"}"',
  '',
  'data: "{\\"type\\":\\"TEXT_MESSAGE_END\\",\\"messageId\\":\\"msg_1\\"}"',
  '',
  'data: "{\\"type\\":\\"RUN_FINISHED\\",\\"threadId\\":\\"be78c480ea6949c7b1cf1762b28fdb805\\",\\"runId\\":\\"02caccc4145f4e0e925063d580901e4c\\"}"',
  '',
  '',
  'event: done',
  'data: {"done":true}',
  '',
  '',
].join('\n')

// Expected decoded TOOL_CALL_RESULT.content from the fixture above
export const AGUI_SAMPLE_TOOL_RESULT = '{"canvas_app": {"name": "Canvas App"}}'
