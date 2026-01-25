'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lightbulb, Sparkles, Star, Zap, ArrowRight, Command, Copy, Check, ChevronDown, Brain, MessageSquare, Wand2 } from 'lucide-react'
import { markdownComponents } from '../components/MarkdownComponents'

export type SavedIdea = { id: string; idea: string; description: string; savedAt: number }

// Progress message type
interface ProgressMessage {
  stage: string
  message: string
  timestamp: number
}

// Agent pipeline visualization with flowing data
interface AgentPipelineProps {
  currentStage: string
  completedStages: string[]
  messages: ProgressMessage[]
  elapsedTime: number
  selectedSize: string
  agentHistory: string[]
}

function AgentPipeline({ currentStage, completedStages, messages, elapsedTime, selectedSize, agentHistory }: AgentPipelineProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const agents = [
    { id: 'innovator', label: 'Innovator', icon: Brain, color: 'amber', rgb: '245, 158, 11' },
    { id: 'critic', label: 'Critic', icon: MessageSquare, color: 'blue', rgb: '59, 130, 246' },
    { id: 'refiner', label: 'Refiner', icon: Wand2, color: 'terminal', rgb: '34, 197, 94' },
  ]

  // Triangle layout positions (centered in a 280x180 container)
  const positions = {
    innovator: { x: 140, y: 30 },   // top center
    critic: { x: 40, y: 150 },      // bottom left
    refiner: { x: 240, y: 150 },    // bottom right
  }

  // SVG paths for edges (curved bezier lines)
  const edges = [
    { from: 'innovator', to: 'critic', path: 'M140,50 Q90,90 55,130' },
    { from: 'innovator', to: 'refiner', path: 'M140,50 Q190,90 225,130' },
    { from: 'critic', to: 'refiner', path: 'M70,150 Q140,170 210,150' },
  ]

  const getAgentState = (id: string) => {
    if (currentStage === id) return 'active'
    if (completedStages.includes(id)) return 'completed'
    return 'pending'
  }

  const getColorClasses = (color: string, state: string) => {
    if (state === 'pending') {
      return {
        bg: 'bg-neutral-800',
        border: 'border-neutral-700',
        text: 'text-gray-500',
        iconBg: 'bg-neutral-700',
      }
    }
    const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
      terminal: { bg: 'bg-terminal/10', border: 'border-terminal/50', text: 'text-terminal', iconBg: 'bg-terminal/20' },
    }
    return colors[color] || colors.terminal
  }

  // Find the last transition for edge highlighting
  const getActiveEdge = (): { from: string; to: string } | null => {
    if (agentHistory.length < 2) return null
    const lastIndex = agentHistory.length - 1
    const from = agentHistory[lastIndex - 1]
    const to = agentHistory[lastIndex]
    if (from && to && from !== to) {
      return { from, to }
    }
    return null
  }

  const activeEdge = getActiveEdge()

  // Check if an edge matches the active transition (bidirectional)
  const isEdgeActive = (edgeFrom: string, edgeTo: string): boolean => {
    if (!activeEdge) return false
    return (activeEdge.from === edgeFrom && activeEdge.to === edgeTo) ||
           (activeEdge.from === edgeTo && activeEdge.to === edgeFrom)
  }

  // Check if edge has been traversed (either direction)
  const isEdgeTraversed = (edgeFrom: string, edgeTo: string): boolean => {
    for (let i = 1; i < agentHistory.length; i++) {
      const from = agentHistory[i - 1]
      const to = agentHistory[i]
      if ((from === edgeFrom && to === edgeTo) || (from === edgeTo && to === edgeFrom)) {
        return true
      }
    }
    return false
  }

  // Get the direction of particle flow for active edge
  const getParticleDirection = (edgeFrom: string, edgeTo: string): 'forward' | 'reverse' | null => {
    if (!activeEdge) return null
    if (activeEdge.from === edgeFrom && activeEdge.to === edgeTo) return 'forward'
    if (activeEdge.from === edgeTo && activeEdge.to === edgeFrom) return 'reverse'
    return null
  }

  // Get color for the source agent of active edge
  const getActiveEdgeColor = (): string => {
    if (!activeEdge) return '#22c55e'
    const agent = agents.find(a => a.id === activeEdge.from)
    return agent ? `rgb(${agent.rgb})` : '#22c55e'
  }

  return (
    <div className="w-full mb-6">
      {/* Triangular agent layout with SVG connections */}
      <div className="relative w-[280px] h-[180px] mx-auto mb-4">
        {/* SVG layer for connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 180">
          <defs>
            {/* Gradient for active edge glow */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw all three edges */}
          {edges.map((edge) => {
            const isActive = isEdgeActive(edge.from, edge.to)
            const isTraversed = isEdgeTraversed(edge.from, edge.to)
            const direction = getParticleDirection(edge.from, edge.to)

            return (
              <g key={`${edge.from}-${edge.to}`}>
                {/* Base path */}
                <path
                  d={edge.path}
                  fill="none"
                  stroke={isActive ? getActiveEdgeColor() : isTraversed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(64, 64, 64, 0.5)'}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeLinecap="round"
                  filter={isActive ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Animated particles on active edge */}
                {isActive && direction && (
                  <>
                    {[0, 0.33, 0.66].map((delay, i) => (
                      <circle
                        key={i}
                        r={3 - i * 0.5}
                        fill={getActiveEdgeColor()}
                        opacity={0.9 - i * 0.2}
                      >
                        <animateMotion
                          dur="1.2s"
                          repeatCount="indefinite"
                          begin={`${delay}s`}
                          path={edge.path}
                          keyPoints={direction === 'reverse' ? '1;0' : '0;1'}
                          keyTimes="0;1"
                          calcMode="linear"
                        />
                      </circle>
                    ))}
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* Agent nodes */}
        {agents.map((agent) => {
          const state = getAgentState(agent.id)
          const colors = getColorClasses(agent.color, state)
          const Icon = agent.icon
          const isActive = state === 'active'
          const isCompleted = state === 'completed'
          const pos = positions[agent.id as keyof typeof positions]

          return (
            <div
              key={agent.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.x, top: pos.y }}
            >
              <div
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all duration-300
                  ${colors.bg} ${colors.border}
                  ${isActive ? 'shadow-[0_0_12px_rgba(34,197,94,0.15)] scale-110' : ''}
                  ${isCompleted ? 'opacity-90' : ''}
                `}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colors.iconBg} transition-all duration-300`}>
                  <Icon size={18} className={colors.text} />
                </div>
                <span className={`font-mono text-[10px] font-medium ${colors.text}`}>{agent.label}</span>

                {/* Completed checkmark */}
                {isCompleted && (
                  <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold
                    ${agent.color === 'amber' ? 'bg-amber-500 text-black' :
                      agent.color === 'blue' ? 'bg-blue-500 text-black' : 'bg-terminal text-black'}`}
                  >
                    ✓
                  </div>
                )}

                {/* Active indicator - subtle pulse ring */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-lg border-2 animate-pulse opacity-40"
                    style={{ borderColor: `rgb(${agent.rgb})` }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* History trail - show last 5 transitions max */}
      {agentHistory.length > 0 && (() => {
        const maxVisible = 5
        const hasOverflow = agentHistory.length > maxVisible
        const visibleHistory = hasOverflow ? agentHistory.slice(-maxVisible) : agentHistory

        return (
          <div className="flex items-center justify-center gap-1 mb-4 px-4">
            {hasOverflow && (
              <>
                <span className="font-mono text-[10px] text-gray-500">...</span>
                <ArrowRight size={10} className="text-gray-600 shrink-0" />
              </>
            )}
            {visibleHistory.map((agentId, i) => {
              const agent = agents.find(a => a.id === agentId)
              if (!agent) return null
              const colorClass = agent.color === 'amber' ? 'text-amber-400' :
                                 agent.color === 'blue' ? 'text-blue-400' : 'text-terminal'
              const isLast = i === visibleHistory.length - 1
              return (
                <React.Fragment key={`${agentId}-${i}`}>
                  {i > 0 && (
                    <ArrowRight size={10} className="text-gray-600 shrink-0" />
                  )}
                  <span className={`font-mono text-[10px] ${colorClass} ${isLast ? 'font-bold' : 'opacity-70'}`}>
                    {agent.label}
                  </span>
                </React.Fragment>
              )
            })}
          </div>
        )
      })()}

      {/* Terminal-style message log */}
      <div className="mt-6 p-4 rounded-xl bg-neutral-900/95 border border-neutral-800">
        {/* Terminal header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-xs text-gray-500">agent-swarm</span>
          </div>
          <span className="font-mono text-sm text-terminal tabular-nums">
            {Math.floor(elapsedTime / 1000)}.{Math.floor((elapsedTime % 1000) / 100)}s
          </span>
        </div>

        {/* Command line */}
        <div className="font-mono text-sm mb-3">
          <span className="text-terminal">$</span>
          <span className="text-gray-400 ml-2">idea-gen --size={selectedSize.toLowerCase()} --swarm</span>
        </div>

        {/* Message log - only show latest message per stage */}
        <div className="font-mono text-sm space-y-1.5">
          {(() => {
            // Get only the latest message per stage
            const latestByStage = new Map<string, ProgressMessage>()
            const stageOrder: string[] = []
            messages.forEach(msg => {
              if (!latestByStage.has(msg.stage)) {
                stageOrder.push(msg.stage)
              }
              latestByStage.set(msg.stage, msg)
            })

            const stageColors: Record<string, string> = {
              starting: 'text-gray-400',
              innovator: 'text-amber-400',
              critic: 'text-blue-400',
              refiner: 'text-terminal',
              complete: 'text-terminal',
            }

            return stageOrder.map((stage, i) => {
              const msg = latestByStage.get(stage)!
              const isLatest = i === stageOrder.length - 1
              const color = stageColors[stage] || 'text-gray-400'

              return (
                <div
                  key={stage}
                  className={`flex items-start gap-2 ${!isLatest ? 'opacity-50' : ''}`}
                >
                  <span className={color}>&gt;</span>
                  <span className={isLatest ? 'text-white' : 'text-gray-400'}>
                    {msg.message}
                  </span>
                  {!isLatest && <span className="text-terminal ml-auto shrink-0">✓</span>}
                  {isLatest && <span className="animate-pulse text-terminal ml-1">_</span>}
                </div>
              )
            })
          })()}

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-terminal">&gt;</span>
              <span>Initializing swarm...</span>
              <span className="animate-pulse text-terminal">_</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Stage indicator bar */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {['innovator', 'critic', 'refiner'].map((stage) => {
                const isActive = currentStage === stage
                const isCompleted = completedStages.includes(stage)
                return (
                  <div
                    key={stage}
                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-terminal' :
                      isActive ? 'bg-terminal/50 animate-pulse' :
                      'bg-neutral-700'
                    }`}
                  />
                )
              })}
            </div>
            <span className="font-mono text-xs text-gray-500">
              {currentStage === 'complete' ? 'Complete' :
               currentStage ? `${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} active` :
               'Starting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


const PROJECT_SIZES = [
  { value: 'XS', label: 'XS', description: 'Quick experiment', icon: Zap },
  { value: 'Small', label: 'S', description: 'Weekend project', icon: Zap },
  { value: 'Medium', label: 'M', description: 'Side project', icon: Command },
  { value: 'Large', label: 'L', description: 'Full product', icon: Sparkles },
]

const EXAMPLE_PROMPTS = [
  'AI productivity tool',
  'Developer workflow',
  'Social platform',
  'Education app',
]

export default function IdeaGenerator() {
  const router = useRouter()

  const [idea, setIdea] = useState('')
  const [description, setDescription] = useState('')
  const [generatedIdea, setGeneratedIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [favorites, setFavorites] = useState<SavedIdea[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [progressMessages, setProgressMessages] = useState<ProgressMessage[]>([])
  const [currentStage, setCurrentStage] = useState<string>('')
  const [completedStages, setCompletedStages] = useState<string[]>([])
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Derive agent history from messages (more reliable than tracking separately)
  const agentHistory = React.useMemo(() => {
    const validAgents = ['innovator', 'critic', 'refiner']
    const history: string[] = []
    let lastAgent = ''
    for (const msg of progressMessages) {
      if (validAgents.includes(msg.stage) && msg.stage !== lastAgent) {
        history.push(msg.stage)
        lastAgent = msg.stage
      }
    }
    return history
  }, [progressMessages])

  const [selectedSize, setSelectedSize] = useState('Small')

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('idea-favorites')
      if (raw) {
        const parsed = JSON.parse(raw) as SavedIdea[]
        setFavorites(parsed)
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('idea-favorites', JSON.stringify(favorites))
  }, [favorites])

  // Timer for generation
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGenerating) {
      setElapsedTime(0)
      const startTime = Date.now()
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  const isFavorited = React.useMemo(() => {
    if (!generatedIdea || !description) return false
    return favorites.some(
      (item) =>
        item.idea.trim() === generatedIdea.trim() &&
        item.description.trim() === description.trim()
    )
  }, [favorites, generatedIdea, description])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgressMessages([])
    setCurrentStage('')
    setCompletedStages([])
    const startTime = Date.now()

    const onProgress = (stage: string, message: string) => {
      // Mark previous stage as completed when transitioning
      setCurrentStage(prev => {
        if (prev && prev !== stage && prev !== 'starting' && prev !== 'complete') {
          setCompletedStages(completed => {
            if (!completed.includes(prev)) {
              return [...completed, prev]
            }
            return completed
          })
        }
        return stage
      })
      // Add ALL messages with timestamp
      setProgressMessages(prev => [...prev, { stage, message, timestamp: Date.now() }])
    }

    const data = await generateIdea(idea, selectedSize, onProgress)
    const parsed = parseIdeaResponse(data?.idea, data?.description)
    setGeneratedIdea(parsed.idea)
    setDescription(parsed.description)
    setLastGenerationTime(Date.now() - startTime)
    setIsGenerating(false)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const tenths = Math.floor((ms % 1000) / 100)
    return `${seconds}.${tenths}s`
  }

  const handleCopyMarkdown = async () => {
    const markdown = `# ${generatedIdea}\n\n${description}`
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveFavorite = () => {
    if (!generatedIdea || !description) return

    if (isFavorited) {
      setFavorites((prev) =>
        prev.filter(
          (item) =>
            !(
              item.idea.trim() === generatedIdea.trim() &&
              item.description.trim() === description.trim()
            )
        )
      )
      return
    }

    const id = crypto.randomUUID()
    const next: SavedIdea = {
      id,
      idea: generatedIdea,
      description,
      savedAt: Date.now(),
    }
    setFavorites((prev) => {
      const exists = prev.some(
        (item) =>
          item.idea.trim() === generatedIdea.trim() &&
          item.description.trim() === description.trim()
      )
      const list = exists ? prev : [next, ...prev]
      return list.slice(0, 20)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && idea.trim()) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
            <Lightbulb size={16} className="text-terminal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">idea generator</span>
              <span className="font-mono text-xs text-gray-600">—</span>
              <span className="font-mono text-xs text-gray-500">ai-powered</span>
            </div>
            <p className="font-mono text-[10px] text-gray-600 mt-0.5">
              Get project inspiration tailored to your interests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-neutral-800 text-gray-400 hover:text-terminal hover:border-terminal/50 transition"
            onClick={() => router.push('/ideas')}
          >
            <Star size={12} />
            Saved
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-terminal/20 text-terminal text-[10px]">
                {favorites.length}
              </span>
            )}
          </button>
          <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
            bedrock
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl px-4 mx-auto py-8">
        {/* Input Section */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />

          <div className="relative p-6 rounded-xl bg-neutral-900/95 border border-terminal/30 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
            {/* Input */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-terminal font-mono text-lg">$</span>
              <input
                type="text"
                placeholder="Describe your project idea..."
                autoFocus
                className="flex-1 px-2 py-2 font-mono text-base text-white placeholder-gray-500 bg-transparent outline-none"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Example prompts */}
            {!idea && (
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-mono text-gray-600">Try:</span>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setIdea(prompt)}
                    className="px-2.5 py-1 font-mono text-xs rounded-full border border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/40 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-5">
              <p className="text-xs font-mono text-gray-500 mb-2">Project scope</p>
              <div className="grid grid-cols-4 gap-2">
                {PROJECT_SIZES.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedSize(value)}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition ${
                      selectedSize === value
                        ? 'border-terminal bg-terminal/10 text-terminal'
                        : 'border-neutral-700 text-gray-400 hover:border-neutral-600 hover:text-gray-300'
                    }`}
                  >
                    <Icon size={16} className={selectedSize === value ? 'text-terminal' : ''} />
                    <span className="font-mono text-sm font-medium">{label}</span>
                    <span className="font-mono text-[10px] text-gray-500">{description}</span>
                    {selectedSize === value && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-terminal rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!idea.trim() || isGenerating}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm rounded-lg transition ${
                idea.trim() && !isGenerating
                  ? 'bg-terminal text-black hover:bg-terminal/90 active:scale-[0.99]'
                  : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Idea
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* How it works toggle */}
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2 font-mono text-xs text-gray-500 hover:text-terminal transition"
            >
              <span>How it works</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showHowItWorks ? 'rotate-180' : ''}`}
              />
            </button>

            {/* How it works content */}
            {showHowItWorks && (
              <div className="mt-3 p-4 rounded-lg bg-black/50 border border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="font-mono text-xs text-gray-500 mb-4">
                  <span className="text-terminal">$</span> cat architecture.md
                </div>

                {/* Agent Flow Visualization */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-1">
                      <Brain size={20} className="text-amber-400" />
                    </div>
                    <span className="font-mono text-[10px] text-amber-400">Innovator</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="w-6 h-px bg-gray-700" />
                    <ArrowRight size={12} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-1">
                      <MessageSquare size={20} className="text-blue-400" />
                    </div>
                    <span className="font-mono text-[10px] text-blue-400">Critic</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="w-6 h-px bg-gray-700" />
                    <ArrowRight size={12} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-terminal/10 border border-terminal/30 flex items-center justify-center mb-1">
                      <Wand2 size={20} className="text-terminal" />
                    </div>
                    <span className="font-mono text-[10px] text-terminal">Refiner</span>
                  </div>
                </div>

                {/* Agent Descriptions */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex gap-3">
                    <span className="text-amber-400 shrink-0">01</span>
                    <div>
                      <span className="text-white">Innovator</span>
                      <span className="text-gray-500"> — Generates wild, unexpected concepts using SCAMPER techniques and cross-domain inspiration</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 shrink-0">02</span>
                    <div>
                      <span className="text-white">Critic</span>
                      <span className="text-gray-500"> — Evaluates feasibility, identifies unique elements, and enhances with "yes, and..." approach</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-terminal shrink-0">03</span>
                    <div>
                      <span className="text-white">Refiner</span>
                      <span className="text-gray-500"> — Polishes output with size-appropriate formatting and actionable next steps</span>
                    </div>
                  </div>
                </div>

                {/* Swarm Explanation */}
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="font-mono text-xs text-gray-500 mb-3">
                    <span className="text-terminal">swarm</span> behavior
                  </div>
                  <div className="font-mono text-xs text-gray-500 space-y-1.5">
                    <p>
                      Agents dynamically <span className="text-white">hand off</span> to each other based on the task state.
                      Unlike fixed pipelines, swarm agents can loop back when needed:
                    </p>
                    <div className="mt-2 pl-3 border-l border-neutral-700 space-y-1">
                      <p><span className="text-blue-400">Critic</span> → <span className="text-amber-400">Innovator</span> <span className="text-gray-600">if more ideas needed</span></p>
                      <p><span className="text-terminal">Refiner</span> → <span className="text-blue-400">Critic</span> <span className="text-gray-600">if lacking substance</span></p>
                    </div>
                    <p className="mt-2">
                      This creates <span className="text-white">emergent collaboration</span> — quality over fixed steps.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <p className="font-mono text-[10px] text-gray-600">
                    Powered by Strands orchestrator on Bedrock AgentCore
                  </p>
                  <a
                    href="https://strandsagents.com/latest/documentation/docs/user-guide/concepts/multi-agent/swarm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-terminal/60 hover:text-terminal transition"
                  >
                    docs →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-8 w-full max-w-2xl mx-auto animate-in fade-in duration-500">
            <AgentPipeline
              currentStage={currentStage}
              completedStages={completedStages}
              messages={progressMessages}
              elapsedTime={elapsedTime}
              selectedSize={selectedSize}
              agentHistory={agentHistory}
            />
          </div>
        )}

        {/* Result */}
        {!isGenerating && generatedIdea && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-50" />

              <div className="relative p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-terminal/10 border border-terminal/30 shrink-0">
                      <Lightbulb size={20} className="text-terminal" />
                    </div>
                    <div>
                      <h2 className="font-mono text-xl font-medium text-white">
                        {generatedIdea}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-mono text-xs text-gray-500">
                          {selectedSize} project
                        </span>
                        {lastGenerationTime && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="font-mono text-xs text-terminal/70">
                              {formatTime(lastGenerationTime)}
                            </span>
                          </>
                        )}
                        {agentHistory.length > 0 && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1">
                              {agentHistory.map((agentId, i) => {
                                const colorClass = agentId === 'innovator' ? 'text-amber-400' :
                                                   agentId === 'critic' ? 'text-blue-400' : 'text-terminal'
                                const label = agentId.charAt(0).toUpperCase()
                                return (
                                  <React.Fragment key={`result-${agentId}-${i}`}>
                                    {i > 0 && <span className="text-gray-600 text-[10px]">→</span>}
                                    <span className={`font-mono text-xs ${colorClass}`} title={agentId}>
                                      {label}
                                    </span>
                                  </React.Fragment>
                                )
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFavorite}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-lg border transition shrink-0 ${
                      isFavorited
                        ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                        : 'border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/50'
                    }`}
                  >
                    <Star size={12} fill={isFavorited ? 'currentColor' : 'none'} />
                    {isFavorited ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Description */}
                <div className="font-mono text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-white prose-headings:font-mono prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-0 prose-code:text-terminal prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {description}
                  </ReactMarkdown>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
                  >
                    <Sparkles size={12} />
                    Regenerate
                  </button>
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-neutral-700 text-gray-400 hover:text-white hover:border-neutral-600 transition"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy Markdown'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && !generatedIdea && (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <Lightbulb size={28} className="text-gray-600" />
            </div>
            <p className="font-mono text-sm text-gray-500 max-w-xs">
              Enter a topic or keyword above and let AI generate creative project ideas for you
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

async function generateIdea(
  idea: string,
  size: string,
  onProgress?: (stage: string, message: string) => void
) {
  // Use streaming Lambda Function URL to avoid API Gateway timeout
  const url = 'https://x4nhq3ax2xcsgmn47hxwpy4psu0btwnk.lambda-url.eu-west-1.on.aws/'
  const body = {
    idea: idea,
    size: size.toLowerCase(),
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    // Read SSE stream and extract the result event
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    const resultHolder: { idea?: string; description?: string } = {}
    const processedMessages = new Set<string>()

    // Helper to parse SSE lines from buffer
    const parseLines = (text: string) => {
      const lines = text.split('\n')
      let eventType = ''
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (eventType === 'progress' && data.message && onProgress) {
              // Dedupe using message content as key
              const msgKey = `${data.stage}:${data.message}`
              if (!processedMessages.has(msgKey)) {
                processedMessages.add(msgKey)
                onProgress(data.stage || 'unknown', data.message)
              }
            } else if (eventType === 'result' && (data.idea || data.description)) {
              resultHolder.idea = data.idea
              resultHolder.description = data.description
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // Parse events as they arrive for progress updates
      parseLines(buffer)
    }

    // Final parse to ensure we got everything
    parseLines(buffer)

    if (resultHolder.idea) {
      return { idea: resultHolder.idea, description: resultHolder.description || '' }
    }

    return { idea: 'Failed to generate idea', description: 'No response received from the server.' }
  } catch (error) {
    console.error('Error generating idea:', error)
    return { idea: 'IDEA: Failed to generate idea. DESCRIPTION: Failed to generate idea.' }
  }
}

function parseIdeaResponse(rawIdea: string | undefined, rawDescription?: string) {
  if (rawDescription) {
    return {
      idea: (rawIdea || 'Idea').trim() || 'Idea',
      description: rawDescription.trim() || 'No description available',
    }
  }

  if (!rawIdea) {
    return { idea: 'Failed to parse idea.', description: 'No content returned.' }
  }
  // Trim outer quotes if the API wraps the string
  const cleanedFences = rawIdea.trim().replace(/```[a-zA-Z]*\n?([\s\S]*?)\n?```/, '$1')
  const cleaned = cleanedFences.replace(/^"+|"+$/g, '')
  const match = cleaned.match(/IDEA:\s*(.*?)\s*DESCRIPTION:\s*([\s\S]*)/i)
  if (match) {
    const [, idea, description] = match
    return {
      idea: idea.trim() || 'No idea available',
      description: description.trim() || 'No description available',
    }
  }
  // Fallback: treat entire string as the description if it doesn't match the pattern
  return {
    idea: 'Idea',
    description: cleaned,
  }
}
