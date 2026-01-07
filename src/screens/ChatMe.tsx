'use client'

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react'
import { Send, Bot, User, Sparkles, Search, ChevronDown, ChevronRight } from 'lucide-react'
import React from 'react'
import ReactMarkdown from 'react-markdown'

type ToolCall = {
  tool: string
  input?: Record<string, unknown>
  result?: string
  status?: 'running' | 'success' | 'error'
}

export type Msg = {
  role: 'user' | 'assistant'
  content: string
  time_taken: string
  isStreaming?: boolean
  tools?: ToolCall[]
}

const API_ENDPOINT = 'https://4tbqtollh37e7h22fwcwwrj7pa0kwbhe.lambda-url.eu-west-1.on.aws/'

const SUGGESTED_PROMPTS = [
  { label: 'Your background', prompt: 'Tell me about your background and experience' },
  { label: 'Tech stack', prompt: 'What technologies do you work with?' },
  { label: 'Projects', prompt: 'What are some interesting projects you\'ve built?' },
  { label: 'Contact', prompt: 'How can I get in touch with you?' },
]

// Format tool name for display
const formatToolName = (tool: string) => {
  // Remove common prefixes/suffixes
  let name = tool.replace(/_exa$/, '').replace(/^exa_/, '')
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Collapsible tool component
function ToolIndicator({ tool, isActive }: { tool: ToolCall; isActive: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="my-2 not-prose">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
      >
        {expanded ? (
          <ChevronDown size={12} className="text-terminal/70" />
        ) : (
          <ChevronRight size={12} className="text-terminal/70" />
        )}
        <Search size={12} className="text-terminal" />
        <span className="text-xs font-mono">{formatToolName(tool.tool)}</span>
        {isActive ? (
          <span className="text-terminal animate-pulse text-xs">...</span>
        ) : (
          <span className="text-terminal/60 text-xs">✓</span>
        )}
      </button>

      {expanded && (
        <div className="mt-2 ml-5 p-2 rounded bg-neutral-800/50 border border-neutral-700 text-xs font-mono overflow-x-auto">
          {tool.input && (
            <div className="mb-2">
              <span className="text-gray-500">Input:</span>
              <pre className="text-gray-400 mt-1 whitespace-pre-wrap">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}
          {tool.result && (
            <div>
              <span className="text-gray-500">Result:</span>
              <pre className="text-gray-400 mt-1 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {tool.result.slice(0, 500)}{tool.result.length > 500 ? '...' : ''}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ChatMe() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const lastMessageCount = useRef(0)

  useEffect(() => {
    if (messages.length !== lastMessageCount.current) {
      lastMessageCount.current = messages.length
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    } else {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
      })
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { role: 'user', content: text, time_taken: '0s' }])

  const send = async (text?: string) => {
    const msg = text ?? input.trim()
    if (!msg) return
    setInput('')
    pushUser(msg)
    try {
      if (!sessionRef.current) {
        sessionRef.current = crypto.randomUUID()
      }
      const start = performance.now()
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: msg, session: sessionRef.current }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let assistantContent = ''
      let buffer = ''
      let firstChunkTime: number | null = null
      let tools: ToolCall[] = []
      let currentToolIndex = -1

      // Add placeholder assistant message
      setMessages((m) => [...m, {
        role: 'assistant',
        content: '',
        time_taken: '...',
        isStreaming: true,
        tools: []
      }])

      const updateAssistant = (updates: Partial<Msg>) => {
        setMessages((m) => {
          const next = [...m]
          const idx = next.findIndex((msg, i) => msg.role === 'assistant' && i === next.length - 1)
          if (idx !== -1) {
            next[idx] = { ...next[idx], ...updates }
          }
          return next
        })
      }

      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: !done })

          // Process line by line
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            // Check for SSE events
            if (trimmed === 'event: done') {
              done = true
              continue
            }
            if (trimmed === 'event: meta') {
              continue
            }

            // Process data chunks
            if (trimmed.startsWith('data:')) {
              const rawData = trimmed.slice(5).trim()
              if (!rawData || rawData === '[DONE]') continue

              // Data comes as a quoted JSON string - use JSON.parse to properly decode it
              let data: string
              try {
                // First parse: decode the outer string wrapper
                data = JSON.parse(rawData)
              } catch {
                // Not a quoted string, use as-is
                data = rawData
              }

              // Now check if the decoded data is a JSON object
              if (typeof data === 'string' && data.startsWith('{')) {
                try {
                  const parsed = JSON.parse(data)

                  // Skip session ID
                  if (parsed.sessionId) continue

                  // Handle done
                  if (parsed.done) {
                    done = true
                    continue
                  }

                  // Handle tool_start
                  if (parsed.type === 'tool_start') {
                    const newTool: ToolCall = {
                      tool: parsed.tool,
                      input: parsed.input,
                      status: 'running'
                    }
                    tools = [...tools, newTool]
                    currentToolIndex = tools.length - 1
                    assistantContent += `\n::tool::${tools.length - 1}::\n`
                    updateAssistant({ content: assistantContent, tools: [...tools] })
                    continue
                  }

                  // Handle tool_end
                  if (parsed.type === 'tool_end') {
                    if (currentToolIndex >= 0 && currentToolIndex < tools.length) {
                      tools[currentToolIndex] = {
                        ...tools[currentToolIndex],
                        result: parsed.result,
                        status: parsed.status === 'success' ? 'success' : 'error'
                      }
                      updateAssistant({ tools: [...tools] })
                    }
                    currentToolIndex = -1
                    continue
                  }

                  // Some other JSON object, skip it
                  continue
                } catch {
                  // Not valid JSON, treat as text
                }
              }

              // Regular text content
              if (typeof data !== 'string' || !data) continue

              if (firstChunkTime === null) {
                firstChunkTime = performance.now()
              }
              assistantContent += data
              updateAssistant({ content: assistantContent })
            }
          }
        }
      }

      const elapsed = firstChunkTime !== null
        ? ((firstChunkTime - start) / 1000).toFixed(2)
        : '0.00'

      updateAssistant({
        time_taken: `${elapsed}s`,
        isStreaming: false
      })
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { role: 'assistant', content: 'Error talking to the model', time_taken: '0s' }])
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full max-w-4xl px-4 pt-6 mx-auto">
        <h1 className="flex items-center gap-2 font-mono text-sm text-terminal">
          <Sparkles size={14} />
          AI Chat
        </h1>
        <p className="font-mono text-xs text-gray-600 mt-0.5">LLM responses may be imperfect.</p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl px-4 mx-auto mt-6 overflow-y-auto scrollbar-hide pb-36"
      >
        {!isEmpty && (
          <div className="space-y-4 pt-2">
            {messages.map(({ role, content, time_taken, isStreaming, tools }, i) => {
              const isUser = role === 'user'
              const activeTool = tools?.find(t => t.status === 'running')

              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex items-start pt-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
                        <Bot size={16} className="text-terminal" />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[80%] sm:max-w-[70%]`}>
                    <div
                      className={`px-4 py-3 rounded-lg font-mono text-sm ${
                        isUser
                          ? 'bg-terminal/10 border border-terminal/40 text-terminal'
                          : 'bg-neutral-900 border border-neutral-800 text-gray-100'
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                      ) : (
                        <div>
                          {/* Thinking state */}
                          {isStreaming && !content && !activeTool && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="w-2 h-2 bg-terminal rounded-full animate-pulse" />
                              <span>Thinking...</span>
                            </div>
                          )}

                          {/* Content with inline tools */}
                          {content && (
                            <div className="leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-headings:font-mono prose-code:text-terminal prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-a:text-terminal prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:marker:text-terminal">
                              {content.split(/(::tool::\d+::)/).map((part, idx) => {
                                const toolMatch = part.match(/^::tool::(\d+)::$/)
                                if (toolMatch && tools) {
                                  const toolIndex = parseInt(toolMatch[1])
                                  const tool = tools[toolIndex]
                                  if (tool) {
                                    return (
                                      <ToolIndicator
                                        key={idx}
                                        tool={tool}
                                        isActive={tool.status === 'running'}
                                      />
                                    )
                                  }
                                }
                                if (!part.trim()) return null
                                return (
                                  <ReactMarkdown
                                    key={idx}
                                    components={{
                                      a: ({ href, children }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer">
                                          {children}
                                        </a>
                                      ),
                                      img: ({ src, alt }) => {
                                        if (!src) return null
                                        return <img src={src} alt={alt || ''} />
                                      },
                                    }}
                                  >
                                    {part}
                                  </ReactMarkdown>
                                )
                              })}
                              {isStreaming && <span className="animate-cursor text-terminal">_</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {!isUser && !isStreaming && (
                      <div className="flex items-center gap-3 mt-1.5 ml-1">
                        <span className="text-xs font-mono text-gray-600">
                          {time_taken}
                        </span>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex items-start pt-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/40">
                        <User size={16} className="text-terminal" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6">
        {isEmpty && (
          <div className="flex justify-center px-4 mb-3">
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
              {SUGGESTED_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => send(item.prompt)}
                  className="px-3 py-1.5 font-mono text-xs rounded-full border border-terminal/30 text-gray-400 hover:text-terminal hover:border-terminal/50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            send()
          }}
          className="flex justify-center px-4"
        >
          <div className="w-full max-w-3xl">
            <div className="flex items-end gap-2 p-2 rounded-xl bg-neutral-900/95 backdrop-blur-sm border border-terminal/40 shadow-[0_0_30px_rgba(34,197,94,0.06)]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="Type your message..."
                className="flex-1 py-2.5 px-3 overflow-hidden font-mono text-sm bg-transparent outline-none resize-none placeholder-gray-600 text-white leading-relaxed max-h-32"
                style={{ minHeight: '44px' }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center w-10 h-10 text-terminal rounded-lg hover:bg-terminal/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center font-mono text-xs text-gray-600">
              Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-gray-400">Enter</kbd> to send
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
