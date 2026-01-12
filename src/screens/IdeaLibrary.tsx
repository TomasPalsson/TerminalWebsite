import React from 'react'
import ReactMarkdown from 'react-markdown'
import { SavedIdea } from './IdeaGenerator'
import { useNavigate } from 'react-router'
import { Star, Lightbulb, Trash2, ArrowLeft, Clock, Sparkles, ChevronRight } from 'lucide-react'

export default function IdeaLibrary() {
  const navigate = useNavigate()
  const [ideas, setIdeas] = React.useState<SavedIdea[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('idea-favorites')
      if (raw) {
        const parsed = JSON.parse(raw) as SavedIdea[]
        setIdeas(parsed)
        if (parsed.length) setSelectedId(parsed[0].id)
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  const handleRemove = (id: string) => {
    setIsDeleting(id)
    setTimeout(() => {
      const next = ideas.filter((i) => i.id !== id)
      setIdeas(next)
      localStorage.setItem('idea-favorites', JSON.stringify(next))
      if (selectedId === id) {
        setSelectedId(next.length ? next[0].id : null)
      }
      setIsDeleting(null)
    }, 200)
  }

  const selected = ideas.find((i) => i.id === selectedId) || null

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full max-w-6xl px-4 pt-6 mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-mono text-sm text-terminal">
              <Star size={14} />
              Saved Ideas
            </h1>
            <p className="font-mono text-xs text-gray-600 mt-0.5">
              {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} saved
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-gray-400 hover:text-terminal hover:border-terminal/50 transition"
            onClick={() => navigate('/idea-generator')}
          >
            <ArrowLeft size={12} />
            Back to generator
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl px-4 mx-auto mt-6 pb-8">
        {ideas.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute -inset-4 bg-terminal/5 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                <Star size={32} className="text-gray-600" />
              </div>
            </div>
            <h2 className="font-mono text-lg text-white mb-2">No saved ideas yet</h2>
            <p className="font-mono text-sm text-gray-500 text-center max-w-sm mb-6">
              Generate some project ideas and save the ones you like to build your collection
            </p>
            <button
              onClick={() => navigate('/idea-generator')}
              className="flex items-center gap-2 px-4 py-2.5 font-mono text-sm rounded-lg bg-terminal text-black hover:bg-terminal/90 transition"
            >
              <Sparkles size={16} />
              Generate Ideas
            </button>
          </div>
        ) : (
          /* Two Panel Layout */
          <div className="flex gap-4 h-[calc(100vh-140px)]">
            {/* Sidebar */}
            <div className="w-72 shrink-0">
              <div className="relative h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-30" />
                <div className="relative h-full p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <Lightbulb size={14} className="text-gray-500" />
                    <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                      Your Ideas
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                    {ideas.map((item) => (
                      <button
                        key={item.id}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                          isDeleting === item.id
                            ? 'opacity-0 scale-95'
                            : item.id === selectedId
                              ? 'border-terminal/50 bg-terminal/10'
                              : 'border-transparent hover:border-neutral-700 hover:bg-neutral-800/50'
                        }`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-mono text-sm font-medium line-clamp-2 transition ${
                                item.id === selectedId ? 'text-terminal' : 'text-white'
                              }`}
                            >
                              {item.idea}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock size={10} className="text-gray-600" />
                              <span className="font-mono text-[10px] text-gray-600">
                                {formatDate(item.savedAt)}
                              </span>
                            </div>
                          </div>
                          {item.id === selectedId && (
                            <ChevronRight size={14} className="text-terminal shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 min-w-0">
              {selected ? (
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-30" />
                  <div className="relative h-full p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30 shrink-0">
                          <Lightbulb size={24} className="text-terminal" />
                        </div>
                        <div>
                          <h2 className="font-mono text-2xl font-medium text-white leading-tight">
                            {selected.idea}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800">
                              <Clock size={12} className="text-gray-500" />
                              <span className="font-mono text-xs text-gray-400">
                                Saved {new Date(selected.savedAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(selected.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition shrink-0"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent mb-6" />

                    {/* Description */}
                    <div className="font-mono text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-3 prose-headings:text-white prose-headings:font-mono prose-headings:mt-6 prose-headings:mb-3 prose-ul:my-3 prose-li:my-1 prose-code:text-terminal prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-strong:text-white prose-hr:border-neutral-700">
                      <ReactMarkdown>{selected.description}</ReactMarkdown>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-neutral-800">
                      <button
                        onClick={() => navigate('/idea-generator')}
                        className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
                      >
                        <Sparkles size={12} />
                        Generate more ideas
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center rounded-xl bg-neutral-900/50 border border-neutral-800">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-3">
                      <Lightbulb size={20} className="text-gray-600" />
                    </div>
                    <p className="font-mono text-sm text-gray-500">
                      Select an idea to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
