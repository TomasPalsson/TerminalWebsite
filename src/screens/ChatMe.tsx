'use client'

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react'
import { Send, Bot, User, MessageSquare, Zap } from 'lucide-react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { ToolRenderer, ToolCall } from '../components/chat/tools'

export type Msg = {
  role: 'user' | 'assistant'
  content: string
  time_taken: string
  isStreaming?: boolean
  tools?: ToolCall[]
}

const API_ENDPOINT = 'https://4tbqtollh37e7h22fwcwwrj7pa0kwbhe.lambda-url.eu-west-1.on.aws/'

const SUGGESTED_PROMPTS = [
  { label: 'background', prompt: 'Tell me about your background and experience' },
  { label: 'tech stack', prompt: 'What technologies do you work with?' },
  { label: 'projects', prompt: 'What are some interesting projects you\'ve built?' },
  { label: 'contact', prompt: 'How can I get in touch with you?' },
]

export default function ChatMe() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const lastMessageCount = useRef(0)

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        if (messages.length !== lastMessageCount.current) {
          lastMessageCount.current = messages.length
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          })
        } else {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }
    })
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
    setIsTyping(true)
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
                    assistantContent += `\n::tool::${tools.length - 1}::\n`
                    updateAssistant({ content: assistantContent, tools: [...tools] })
                    continue
                  }

                  // Handle tool_end - find tool by name since tools can complete out of order
                  if (parsed.type === 'tool_end') {
                    const toolIndex = tools.findIndex(t => t.tool === parsed.tool && t.status === 'running')
                    if (toolIndex >= 0) {
                      tools[toolIndex] = {
                        ...tools[toolIndex],
                        result: parsed.result,
                        status: parsed.status === 'success' ? 'success' : 'error'
                      }
                      updateAssistant({ tools: [...tools] })
                    }
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
    } finally {
      setIsTyping(false)
    }
  }

  const isEmpty = messages.length === 0
  const messageCount = messages.length

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
            <MessageSquare size={16} className="text-terminal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">chat</span>
              <span className="font-mono text-xs text-gray-600">—</span>
              <span className="font-mono text-xs text-gray-500">ai assistant</span>
            </div>
            <p className="font-mono text-[10px] text-gray-600 mt-0.5">
              Ask me anything about my work and experience
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
            bedrock
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e20 transparent' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Empty State */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-terminal/10 border border-terminal/30 mb-4">
                <Bot size={28} className="text-terminal" />
              </div>
              <h2 className="font-mono text-lg text-white mb-2">AI Chat</h2>
              <p className="font-mono text-sm text-gray-500 text-center max-w-md mb-8">
                Ask me about my background, projects, tech stack, or anything else you'd like to know.
              </p>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => send(item.prompt)}
                    className="px-3 py-1.5 font-mono text-xs rounded-lg border border-neutral-800 text-gray-400 hover:text-terminal hover:border-terminal/50 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {!isEmpty && (
            <div className="space-y-4 pt-2">
              {messages.map(({ role, content, time_taken, isStreaming, tools }, i) => {
                const isUser = role === 'user'
                const activeTool = tools?.find(t => t.status === 'running')

                return (
                  <div key={i} className="group">
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`flex items-center justify-center w-5 h-5 rounded ${
                        isUser
                          ? 'bg-terminal/10 border border-terminal/30'
                          : 'bg-neutral-800 border border-neutral-700'
                      }`}>
                        {isUser
                          ? <User size={12} className="text-terminal" />
                          : <Bot size={12} className="text-gray-400" />
                        }
                      </div>
                      <span className={`font-mono text-xs ${isUser ? 'text-terminal' : 'text-gray-500'}`}>
                        {isUser ? 'you' : 'assistant'}
                      </span>
                      {!isUser && !isStreaming && (
                        <span className="font-mono text-[10px] text-gray-600">
                          {time_taken}
                        </span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`ml-7 font-mono text-sm ${
                      isUser ? 'text-gray-200' : 'text-gray-300'
                    }`}>
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                      ) : (
                        <div>
                          {/* Thinking state */}
                          {isStreaming && !content && !activeTool && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="w-1.5 h-1.5 bg-terminal rounded-full animate-pulse" />
                              <span className="text-xs">thinking...</span>
                            </div>
                          )}

                          {/* Content with inline tools */}
                          {content && (
                            <div className="leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:text-gray-300 prose-headings:text-white prose-headings:font-mono prose-code:text-terminal prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-neutral-800 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-a:text-terminal prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:marker:text-terminal prose-li:text-gray-300">
                              {content.split(/(::tool::\d+::)/).map((part, idx) => {
                                const toolMatch = part.match(/^::tool::(\d+)::$/)
                                if (toolMatch && tools) {
                                  const toolIndex = parseInt(toolMatch[1])
                                  const tool = tools[toolIndex]
                                  if (tool) {
                                    return (
                                      <ToolRenderer
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pt-3 pb-5">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              send()
            }}
          >
            <div className="flex items-end gap-2 p-2 rounded-lg border border-neutral-800 focus-within:border-terminal/50 transition">
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
                placeholder="Type a message..."
                className="flex-1 py-2 px-2 overflow-hidden font-mono text-sm bg-transparent outline-none resize-none placeholder-gray-600 text-white leading-relaxed max-h-32"
                style={{ minHeight: '40px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex items-center justify-center w-9 h-9 text-terminal rounded-lg hover:bg-terminal/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-neutral-800 text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{messageCount} messages</span>
          {isTyping && (
            <span className="flex items-center gap-1.5 text-terminal">
              <Zap size={10} />
              streaming
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">tomasp.me</span>
          <span className="text-terminal">●</span>
        </div>
      </div>
    </div>
  )
}
