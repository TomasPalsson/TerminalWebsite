import { useState } from 'react'
import { ChevronDown, ChevronRight, Github, ExternalLink, Star, GitFork, Eye, Code } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'
import { getTechIcon } from '../icons'

type Repository = {
  name: string
  full_name: string
  owner?: string | { login: string }
  description?: string
  html_url?: string
  url?: string
  language?: string
  stargazers_count?: number
  stars?: number
  forks_count?: number
  forks?: number
  watchers_count?: number
  open_issues_count?: number
  topics?: string[]
  visibility?: string
  private?: boolean
  fork?: boolean
  archived?: boolean
}

type SearchResult = {
  total_count?: number
  items?: Repository[]
}

function normalizeRepo(repo: Repository): Repository {
  return {
    ...repo,
    stargazers_count: repo.stargazers_count ?? repo.stars ?? 0,
    forks_count: repo.forks_count ?? repo.forks ?? 0,
    html_url: repo.html_url ?? repo.url,
    owner: typeof repo.owner === 'string' ? repo.owner : repo.owner?.login,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

function RepoCard({ repo }: { repo: Repository }) {
  const normalized = normalizeRepo(repo)
  const LangIcon = normalized.language ? getTechIcon(normalized.language) : Code

  return (
    <a
      href={normalized.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Github size={14} className="text-terminal flex-shrink-0" />
            <span className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors truncate">
              {normalized.full_name || normalized.name}
            </span>
          </div>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal flex-shrink-0 transition-colors" />
        </div>

        {/* Description */}
        {normalized.description && (
          <p className="mt-2 text-xs text-gray-400 line-clamp-2">
            {normalized.description}
          </p>
        )}

        {/* Stats and language */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {normalized.language && (
            <div className="flex items-center gap-1">
              <LangIcon className="w-3 h-3 text-terminal/70" />
              <span className="text-xs font-mono text-gray-400">{normalized.language}</span>
            </div>
          )}
          {(normalized.stargazers_count ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="text-yellow-500" />
              <span className="text-xs font-mono text-gray-400">{formatNumber(normalized.stargazers_count!)}</span>
            </div>
          )}
          {(normalized.forks_count ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <GitFork size={10} className="text-gray-500" />
              <span className="text-xs font-mono text-gray-400">{formatNumber(normalized.forks_count!)}</span>
            </div>
          )}
          {normalized.archived && (
            <span className="text-xs font-mono text-yellow-500/70 px-1.5 py-0.5 rounded bg-yellow-500/10">Archived</span>
          )}
          {normalized.fork && (
            <span className="text-xs font-mono text-blue-400/70 px-1.5 py-0.5 rounded bg-blue-400/10">Fork</span>
          )}
        </div>

        {/* Topics */}
        {normalized.topics && normalized.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {normalized.topics.slice(0, 5).map((topic, idx) => (
              <span
                key={idx}
                className="text-xs font-mono text-terminal/70 px-1.5 py-0.5 rounded bg-terminal/10"
              >
                {topic}
              </span>
            ))}
            {normalized.topics.length > 5 && (
              <span className="text-xs text-gray-500">+{normalized.topics.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </a>
  )
}

export function GitHubRepoRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  if (isActive) {
    return <LoadingSkeleton message="Searching repositories..." variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  // Parse the result - could be a search result or a single/list of repos
  const parsed = safeParse<SearchResult | Repository | Repository[]>(tool.result)
  if (!parsed) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  let repos: Repository[] = []
  let totalCount: number | undefined

  if (Array.isArray(parsed)) {
    repos = parsed
  } else if ('items' in parsed && Array.isArray(parsed.items)) {
    repos = parsed.items
    totalCount = parsed.total_count
  } else if ('name' in parsed || 'full_name' in parsed) {
    repos = [parsed as Repository]
  }

  if (repos.length === 0) {
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
          <Github size={12} className="text-terminal" />
          <span className="text-xs font-mono">Repositories</span>
          <span className="text-terminal/60 text-xs">
            ({repos.length}{totalCount && totalCount > repos.length ? ` of ${formatNumber(totalCount)}` : ''})
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
        <Github size={12} className="text-terminal" />
        <span>Repositories</span>
        {totalCount && (
          <span className="text-gray-600">{formatNumber(totalCount)} total</span>
        )}
      </button>

      {/* Results Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4">
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
            {repos.map((repo, idx) => (
              <RepoCard key={idx} repo={repo} />
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
