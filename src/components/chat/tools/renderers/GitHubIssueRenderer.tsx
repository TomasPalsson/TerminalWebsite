import { useState } from 'react'
import { ChevronDown, ChevronRight, Github, ExternalLink, MessageSquare, Tag, CircleDot, CheckCircle2, Circle } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

type Label = {
  name: string
  color?: string
}

type Issue = {
  number: number
  title: string
  state: 'open' | 'closed'
  html_url?: string
  url?: string
  user?: { login: string; avatar_url?: string }
  labels?: Label[]
  comments?: number
  created_at?: string
  updated_at?: string
  body?: string
  repository_url?: string
}

type SearchResult = {
  total_count?: number
  items?: Issue[]
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

function getRepoName(issue: Issue): string | undefined {
  if (issue.repository_url) {
    const match = issue.repository_url.match(/repos\/(.+)$/)
    return match ? match[1] : undefined
  }
  if (issue.html_url) {
    const match = issue.html_url.match(/github\.com\/([^/]+\/[^/]+)/)
    return match ? match[1] : undefined
  }
  return undefined
}

function IssueCard({ issue }: { issue: Issue }) {
  const isOpen = issue.state === 'open'
  const repoName = getRepoName(issue)

  return (
    <a
      href={issue.html_url || issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
        {/* Header with status */}
        <div className="flex items-start gap-2">
          {isOpen ? (
            <CircleDot size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors line-clamp-2">
                {issue.title}
              </span>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal flex-shrink-0 transition-colors" />
            </div>

            {/* Repo and number */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {repoName && <span className="truncate">{repoName}</span>}
              <span>#{issue.number}</span>
            </div>
          </div>
        </div>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 ml-5">
            {issue.labels.slice(0, 4).map((label, idx) => (
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
            {issue.labels.length > 4 && (
              <span className="text-xs text-gray-500">+{issue.labels.length - 4}</span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2 ml-5 text-xs text-gray-500">
          {issue.user && (
            <span className="truncate max-w-[100px]">@{issue.user.login}</span>
          )}
          {issue.created_at && (
            <span>opened {formatDate(issue.created_at)}</span>
          )}
          {(issue.comments ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={10} />
              <span>{issue.comments}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

export function GitHubIssueRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  if (isActive) {
    return <LoadingSkeleton message="Fetching issues..." variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const parsed = safeParse<SearchResult | Issue | Issue[]>(tool.result)
  if (!parsed) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  let issues: Issue[] = []
  let totalCount: number | undefined

  if (Array.isArray(parsed)) {
    issues = parsed
  } else if ('items' in parsed && Array.isArray(parsed.items)) {
    issues = parsed.items
    totalCount = parsed.total_count
  } else if ('number' in parsed && 'title' in parsed) {
    issues = [parsed as Issue]
  }

  if (issues.length === 0) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const openCount = issues.filter(i => i.state === 'open').length
  const closedCount = issues.filter(i => i.state === 'closed').length

  // Collapsed view
  if (!expanded) {
    return (
      <div className="my-2 not-prose">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={12} className="text-terminal/70" />
          <CircleDot size={12} className="text-terminal" />
          <span className="text-xs font-mono">Issues</span>
          <span className="text-terminal/60 text-xs">
            ({issues.length}{totalCount && totalCount > issues.length ? ` of ${totalCount}` : ''})
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
        <CircleDot size={12} className="text-terminal" />
        <span>Issues</span>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-green-500">{openCount} open</span>
          <span className="text-purple-500">{closedCount} closed</span>
        </div>
      </button>

      {/* Results Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4">
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
            {issues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
