import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, MessageSquare, GitPullRequest, GitMerge, XCircle, Clock } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

type Label = {
  name: string
  color?: string
}

type PullRequest = {
  number: number
  title: string
  state: 'open' | 'closed'
  merged?: boolean
  merged_at?: string
  draft?: boolean
  html_url?: string
  url?: string
  user?: { login: string; avatar_url?: string }
  labels?: Label[]
  comments?: number
  review_comments?: number
  commits?: number
  additions?: number
  deletions?: number
  changed_files?: number
  created_at?: string
  updated_at?: string
  head?: { ref: string; label?: string }
  base?: { ref: string; label?: string }
  body?: string
  repository_url?: string
}

type SearchResult = {
  total_count?: number
  items?: PullRequest[]
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
  } catch {
    return dateStr
  }
}

function getRepoName(pr: PullRequest): string | undefined {
  if (pr.repository_url) {
    const match = pr.repository_url.match(/repos\/(.+)$/)
    return match ? match[1] : undefined
  }
  if (pr.html_url) {
    const match = pr.html_url.match(/github\.com\/([^/]+\/[^/]+)/)
    return match ? match[1] : undefined
  }
  return undefined
}

function PRStatusIcon({ pr }: { pr: PullRequest }) {
  if (pr.merged || pr.merged_at) {
    return <GitMerge size={14} className="text-purple-500 flex-shrink-0" />
  }
  if (pr.state === 'closed') {
    return <XCircle size={14} className="text-red-500 flex-shrink-0" />
  }
  if (pr.draft) {
    return <GitPullRequest size={14} className="text-gray-500 flex-shrink-0" />
  }
  return <GitPullRequest size={14} className="text-green-500 flex-shrink-0" />
}

function PRCard({ pr }: { pr: PullRequest }) {
  const repoName = getRepoName(pr)
  const isMerged = pr.merged || pr.merged_at
  const totalComments = (pr.comments ?? 0) + (pr.review_comments ?? 0)

  return (
    <a
      href={pr.html_url || pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
        {/* Header with status */}
        <div className="flex items-start gap-2">
          <PRStatusIcon pr={pr} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors line-clamp-2">
                {pr.title}
                {pr.draft && <span className="ml-2 text-xs text-gray-500">(Draft)</span>}
              </span>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal flex-shrink-0 transition-colors" />
            </div>

            {/* Repo and number */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {repoName && <span className="truncate">{repoName}</span>}
              <span>#{pr.number}</span>
            </div>
          </div>
        </div>

        {/* Branch info */}
        {pr.head && pr.base && (
          <div className="flex items-center gap-1 mt-2 ml-5 text-xs font-mono">
            <span className="text-terminal/70 truncate max-w-[100px]">{pr.head.ref}</span>
            <span className="text-gray-600">→</span>
            <span className="text-blue-400/70 truncate max-w-[100px]">{pr.base.ref}</span>
          </div>
        )}

        {/* Labels */}
        {pr.labels && pr.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 ml-5">
            {pr.labels.slice(0, 3).map((label, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: label.color ? `#${label.color}20` : 'rgba(34, 197, 94, 0.1)',
                  color: label.color ? `#${label.color}` : 'rgb(34, 197, 94)',
                  borderWidth: 1,
                  borderColor: label.color ? `#${label.color}40` : 'rgba(34, 197, 94, 0.3)',
                }}
              >
                {label.name}
              </span>
            ))}
            {pr.labels.length > 3 && (
              <span className="text-xs text-gray-500">+{pr.labels.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 ml-5 text-xs text-gray-500 flex-wrap">
          {pr.user && (
            <span className="truncate max-w-[100px]">@{pr.user.login}</span>
          )}
          {pr.created_at && (
            <span>opened {formatDate(pr.created_at)}</span>
          )}
          {totalComments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={10} />
              <span>{totalComments}</span>
            </div>
          )}
          {pr.additions !== undefined && pr.deletions !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-green-500">+{pr.additions}</span>
              <span className="text-red-500">-{pr.deletions}</span>
            </div>
          )}
          {pr.changed_files !== undefined && (
            <span>{pr.changed_files} files</span>
          )}
        </div>
      </div>
    </a>
  )
}

export function GitHubPRRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  if (isActive) {
    return <LoadingSkeleton message="Fetching pull requests..." variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const parsed = safeParse<SearchResult | PullRequest | PullRequest[]>(tool.result)
  if (!parsed) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  let prs: PullRequest[] = []
  let totalCount: number | undefined

  if (Array.isArray(parsed)) {
    prs = parsed
  } else if ('items' in parsed && Array.isArray(parsed.items)) {
    prs = parsed.items
    totalCount = parsed.total_count
  } else if ('number' in parsed && 'title' in parsed) {
    prs = [parsed as PullRequest]
  }

  if (prs.length === 0) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const openCount = prs.filter(p => p.state === 'open' && !p.draft).length
  const mergedCount = prs.filter(p => p.merged || p.merged_at).length
  const draftCount = prs.filter(p => p.draft).length

  // Collapsed view
  if (!expanded) {
    return (
      <div className="my-2 not-prose">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={12} className="text-terminal/70" />
          <GitPullRequest size={12} className="text-terminal" />
          <span className="text-xs font-mono">Pull Requests</span>
          <span className="text-terminal/60 text-xs">
            ({prs.length}{totalCount && totalCount > prs.length ? ` of ${totalCount}` : ''})
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
        <GitPullRequest size={12} className="text-terminal" />
        <span>Pull Requests</span>
        <div className="flex items-center gap-2 ml-2">
          {openCount > 0 && <span className="text-green-500">{openCount} open</span>}
          {mergedCount > 0 && <span className="text-purple-500">{mergedCount} merged</span>}
          {draftCount > 0 && <span className="text-gray-500">{draftCount} draft</span>}
        </div>
      </button>

      {/* Results Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4">
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
            {prs.map((pr, idx) => (
              <PRCard key={idx} pr={pr} />
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
