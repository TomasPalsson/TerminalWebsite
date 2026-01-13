import Loader from '../components/Loader'
import React from 'react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router'
import { Lightbulb, Sparkles, Star, Zap, ArrowRight, Command } from 'lucide-react'

export type SavedIdea = { id: string; idea: string; description: string; savedAt: number }

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
  const navigate = useNavigate()

  const [idea, setIdea] = useState('')
  const [description, setDescription] = useState('')
  const [generatedIdea, setGeneratedIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [favorites, setFavorites] = useState<SavedIdea[]>([])

  const phrases = [
    'Generating...',
    'Crunching numbers...',
    'Summoning ideas...',
    'Brainstorming...',
    'Thinking deeply...',
    'Looking for inspiration...',
    'Searching for the perfect idea...',
    'Consulting the muses...',
    'Connecting the dots...',
    'Exploring new possibilities...',
    'Unlocking creativity...',
    'Mixing up concepts...',
    'Diving into imagination...',
    'Piecing together inspiration...',
    'Letting thoughts wander...',
    'Sparking innovation...',
    'Dreaming up something new...',
    'Synthesizing insights...',
    'Pondering possibilities...',
    'Inventing the unexpected...',
    'Channeling creative energy...',
  ]

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
    const data = await generateIdea(idea, selectedSize)
    const parsed = parseIdeaResponse(data?.idea, data?.description)
    setGeneratedIdea(parsed.idea)
    setDescription(parsed.description)
    setIsGenerating(false)
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
            onClick={() => navigate('/ideas')}
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
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30 flex items-center justify-center mb-4">
              <Lightbulb size={24} className="text-terminal animate-pulse" />
            </div>
            <Loader phrases={phrases} />
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
                      <p className="font-mono text-xs text-gray-500 mt-1">
                        {selectedSize} project
                      </p>
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
                  <ReactMarkdown>{description}</ReactMarkdown>
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

async function generateIdea(idea: string, size: string) {
  const url = 'https://api.tomasp.me/idea-generator'
  const body = {
    idea: 'Project Size: ' + size.toUpperCase() + '\n' + 'Idea: ' + idea,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const rawJson = await response.json().catch(async () => {
      const fallbackText = await response.text()
      try {
        return JSON.parse(fallbackText)
      } catch {
        return { idea: fallbackText }
      }
    })

    if (rawJson?.result) {
      let innerStr = rawJson.result
      if (typeof innerStr === 'string') {
        const fenced = innerStr.match(/```[a-zA-Z]*\n?([\s\S]*?)\n?```/)
        if (fenced?.[1]) innerStr = fenced[1]
      }
      if (typeof innerStr === 'string') {
        try {
          const inner = JSON.parse(innerStr)
          if (inner?.idea || inner?.description) {
            return { idea: inner.idea || 'Idea', description: inner.description || '' }
          }
        } catch {
          // ignore and fall through
        }
        return { idea: innerStr }
      }
    }

    if (rawJson?.idea) {
      return { idea: rawJson.idea, description: rawJson.description }
    }

    if (typeof rawJson === 'string') return { idea: rawJson }

    return { idea: 'IDEA: Failed to generate idea. DESCRIPTION: Empty response.' }
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
