import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ChatMe from './ChatMe'
import { AGUI_SAMPLE_STREAM } from '../services/__fixtures__/aguiSampleStream'

// Build a Response whose body is a ReadableStream that emits the AGUI bytes
// in a couple of chunks — exercises the parser's boundary-buffering inside
// the React component, not just in isolation.
function makeStreamResponse(text: string): Response {
  const encoder = new TextEncoder()
  const half = Math.floor(text.length / 2)
  const chunks = [text.slice(0, half), text.slice(half)]
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('ChatMe AGUI integration', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => makeStreamResponse(AGUI_SAMPLE_STREAM)),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders assistant text and tool card from an AGUI stream', async () => {
    render(<ChatMe />)

    const textarea = screen.getByPlaceholderText(
      /type a message/i,
    ) as HTMLTextAreaElement
    fireEvent.change(textarea, {
      target: { value: 'what projects have you built?' },
    })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

    // Assistant text from the fixture must appear in the DOM
    await waitFor(
      () => {
        expect(screen.getByText(/Here are the projects\./i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    // Tool card for get_all_projects must render. AllProjectsRenderer shows
    // a "Projects" label + a `(N)` count badge in collapsed mode — the count
    // proves the TOOL_CALL_RESULT content was JSON-parsed by the renderer
    // (one project in the fixture).
    expect(screen.getByText('Projects', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()

    // The raw inline marker must NOT leak into the rendered DOM
    expect(screen.queryByText(/::tool::0::/)).not.toBeInTheDocument()
  })
})
