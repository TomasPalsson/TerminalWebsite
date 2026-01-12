import { useState } from 'react'
import { ChevronDown, ChevronRight, Search, Globe, ExternalLink, Calendar, User } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

type SearchResult = {
  title: string
  url: string
  text: string
  author?: string
  publishedDate?: string
}

function parseSearchResults(resultStr: string): SearchResult[] {
  const results: SearchResult[] = []

  // Split by "Title:" to get individual results
  const parts = resultStr.split(/(?=Title:)/).filter(p => p.trim())

  for (const part of parts) {
    const titleMatch = part.match(/Title:\s*(.+?)(?:\n|Author:|URL:|$)/s)
    const authorMatch = part.match(/Author:\s*(.+?)(?:\n|Published|URL:|$)/s)
    const dateMatch = part.match(/Published Date:\s*(.+?)(?:\n|URL:|$)/s)
    const urlMatch = part.match(/URL:\s*(.+?)(?:\n|Text:|$)/s)
    const textMatch = part.match(/Text:\s*(.+?)(?=Title:|$)/s)

    if (titleMatch && urlMatch) {
      results.push({
        title: titleMatch[1].trim(),
        url: urlMatch[1].trim(),
        text: textMatch ? textMatch[1].trim().slice(0, 200) : '',
        author: authorMatch ? authorMatch[1].trim() : undefined,
        publishedDate: dateMatch ? dateMatch[1].trim() : undefined,
      })
    }
  }

  return results
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function getDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace('www.', '')
  } catch {
    return url
  }
}

function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
        {/* Header with title and link icon */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors line-clamp-2">
            {result.title}
          </h4>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal flex-shrink-0 mt-1 transition-colors" />
        </div>

        {/* URL/Domain */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Globe size={10} className="text-terminal/70" />
          <span className="text-xs font-mono text-terminal/70 truncate">
            {getDomain(result.url)}
          </span>
        </div>

        {/* Meta info */}
        {(result.author || result.publishedDate) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {result.author && (
              <div className="flex items-center gap-1">
                <User size={10} />
                <span className="truncate max-w-[120px]">{result.author}</span>
              </div>
            )}
            {result.publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{formatDate(result.publishedDate)}</span>
              </div>
            )}
          </div>
        )}

        {/* Snippet */}
        {result.text && (
          <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {result.text.replace(/\[.*?\]/g, '').replace(/\n+/g, ' ').trim()}
          </p>
        )}
      </div>
    </a>
  )
}

export function WebSearchRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  // Get search query from input
  const query = tool.input?.query as string | undefined

  if (isActive) {
    return <LoadingSkeleton message={`Searching: "${query?.slice(0, 30)}..."`} variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const results = parseSearchResults(tool.result)

  if (results.length === 0) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  // Collapsed view
  if (!expanded) {
    return (
      <div className="my-2 not-prose">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={12} className="text-terminal/70" />
          <Search size={12} className="text-terminal" />
          <span className="text-xs font-mono">Web Search</span>
          <span className="text-terminal/60 text-xs">({results.length} results)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="my-3 not-prose">
      {/* Header */}
      <button
        onClick={() => setExpanded(false)}
        className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-400 transition-colors mb-3 px-1"
      >
        <ChevronDown size={12} className="text-terminal/70" />
        <Search size={12} className="text-terminal" />
        <span>Web Search</span>
        {query && (
          <span className="text-gray-600 truncate max-w-[200px]">"{query}"</span>
        )}
      </button>

      {/* Results Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4">
          {/* Query header */}
          {query && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-800">
              <Search size={14} className="text-terminal" />
              <span className="text-sm font-mono text-gray-300">"{query}"</span>
              <span className="text-xs text-gray-500 ml-auto">{results.length} results</span>
            </div>
          )}

          {/* Results grid */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
            {results.map((result, idx) => (
              <SearchResultCard key={idx} result={result} index={idx} />
            ))}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
