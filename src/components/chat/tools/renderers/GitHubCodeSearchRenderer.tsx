import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Code, FileCode, Github } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'
import { getTechIcon } from '../icons'

type CodeResult = {
  name: string
  path: string
  sha?: string
  html_url?: string
  url?: string
  repository?: {
    full_name: string
    html_url?: string
  }
  text_matches?: Array<{
    fragment: string
    matches?: Array<{ text: string; indices: number[] }>
  }>
}

type SearchResult = {
  total_count?: number
  items?: CodeResult[]
}

function getLanguageFromPath(path: string): string | undefined {
  const ext = path.split('.').pop()?.toLowerCase()
  const extMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    kt: 'Kotlin',
    swift: 'Swift',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    php: 'PHP',
    dart: 'Dart',
    vue: 'Vue',
    svelte: 'Svelte',
    md: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Shell',
  }
  return ext ? extMap[ext] : undefined
}

function CodeResultCard({ result }: { result: CodeResult }) {
  const language = getLanguageFromPath(result.path)
  const LangIcon = language ? getTechIcon(language) : FileCode

  return (
    <a
      href={result.html_url || result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
        {/* File header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <LangIcon className="w-4 h-4 text-terminal/70 flex-shrink-0" />
            <span className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors truncate">
              {result.name}
            </span>
          </div>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal flex-shrink-0 transition-colors" />
        </div>

        {/* Path */}
        <div className="mt-1 text-xs font-mono text-gray-500 truncate">
          {result.path}
        </div>

        {/* Repository */}
        {result.repository && (
          <div className="flex items-center gap-1.5 mt-2">
            <Github size={10} className="text-gray-500" />
            <span className="text-xs font-mono text-terminal/70">{result.repository.full_name}</span>
          </div>
        )}

        {/* Code snippet */}
        {result.text_matches && result.text_matches.length > 0 && (
          <div className="mt-2 p-2 rounded bg-neutral-900/80 border border-neutral-700/30 overflow-x-auto">
            <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap">
              {result.text_matches[0].fragment.slice(0, 200)}
              {result.text_matches[0].fragment.length > 200 && '...'}
            </pre>
          </div>
        )}
      </div>
    </a>
  )
}

export function GitHubCodeSearchRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)
  const query = tool.input?.query as string | undefined

  if (isActive) {
    return <LoadingSkeleton message="Searching code..." variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const parsed = safeParse<SearchResult | CodeResult[]>(tool.result)
  if (!parsed) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  let results: CodeResult[] = []
  let totalCount: number | undefined

  if (Array.isArray(parsed)) {
    results = parsed
  } else if ('items' in parsed && Array.isArray(parsed.items)) {
    results = parsed.items
    totalCount = parsed.total_count
  }

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
          <Code size={12} className="text-terminal" />
          <span className="text-xs font-mono">Code Search</span>
          <span className="text-terminal/60 text-xs">
            ({results.length}{totalCount && totalCount > results.length ? ` of ${totalCount.toLocaleString()}` : ''} results)
          </span>
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
        <Code size={12} className="text-terminal" />
        <span>Code Search</span>
        {query && <span className="text-gray-600 truncate max-w-[200px]">"{query}"</span>}
      </button>

      {/* Results Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4">
          {/* Query header */}
          {query && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-800">
              <Code size={14} className="text-terminal" />
              <span className="text-sm font-mono text-gray-300 truncate">"{query}"</span>
              {totalCount && (
                <span className="text-xs text-gray-500 ml-auto">{totalCount.toLocaleString()} results</span>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
            {results.map((result, idx) => (
              <CodeResultCard key={idx} result={result} />
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
