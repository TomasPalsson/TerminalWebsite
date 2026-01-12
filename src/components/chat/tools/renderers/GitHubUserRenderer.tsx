import { useState } from 'react'
import { ChevronDown, ChevronRight, Github, ExternalLink, Users, BookOpen, Calendar } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

type GitHubUser = {
  login: string
  id: number
  profile_url?: string
  html_url?: string
  avatar_url: string
  details?: {
    name?: string
    bio?: string
    company?: string
    location?: string
    public_repos: number
    public_gists: number
    followers: number
    following: number
    created_at: string
    updated_at: string
  }
}

type SearchResult = {
  total_count: number
  incomplete_results?: boolean
  items: GitHubUser[]
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function StatBadge({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-800/50 border border-neutral-700/50">
      <Icon size={12} className="text-terminal/70" />
      <span className="text-xs font-mono text-gray-400">{label}</span>
      <span className="text-xs font-mono text-white">{value}</span>
    </div>
  )
}

function UserCard({ user, compact = false }: { user: GitHubUser; compact?: boolean }) {
  const profileUrl = user.profile_url || user.html_url || `https://github.com/${user.login}`

  if (compact) {
    // Compact card for search results with multiple users
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-terminal/40 hover:bg-neutral-800 transition-all">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-10 h-10 rounded-full border border-terminal/30"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-200 group-hover:text-terminal transition-colors">
                  @{user.login}
                </span>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-terminal transition-colors" />
              </div>
              {user.details?.name && (
                <p className="text-xs text-gray-500">{user.details.name}</p>
              )}
            </div>
            {user.details && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{user.details.public_repos} repos</span>
                <span>{user.details.followers} followers</span>
              </div>
            )}
          </div>
        </div>
      </a>
    )
  }

  // Full card for single user (github_get_me)
  return (
    <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
      </div>

      <div className="relative p-4">
        {/* Profile header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-16 h-16 rounded-full border-2 border-terminal/40"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 border border-terminal/40 flex items-center justify-center">
              <Github size={10} className="text-terminal" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-mono text-white truncate">
                {user.details?.name || user.login}
              </h3>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-terminal transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-sm font-mono text-terminal/70">@{user.login}</p>

            {user.details?.bio && (
              <p className="mt-2 text-xs text-gray-400 line-clamp-2">{user.details.bio}</p>
            )}

            {(user.details?.company || user.details?.location) && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {user.details.company && <span>{user.details.company}</span>}
                {user.details.location && <span>{user.details.location}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {user.details && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-800">
            <StatBadge icon={BookOpen} label="Repos" value={user.details.public_repos} />
            <StatBadge icon={Users} label="Followers" value={user.details.followers} />
            <StatBadge icon={Users} label="Following" value={user.details.following} />
            <StatBadge icon={Calendar} label="Joined" value={formatDate(user.details.created_at)} />
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
    </div>
  )
}

export function GitHubUserRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  if (isActive) {
    return <LoadingSkeleton message="Fetching GitHub users..." variant="card" />
  }

  if (!tool.result) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const parsed = safeParse<SearchResult | GitHubUser>(tool.result)
  if (!parsed) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  // Determine if it's a search result or single user
  let users: GitHubUser[] = []
  let totalCount: number | undefined

  if ('items' in parsed && Array.isArray(parsed.items)) {
    // Search result
    users = parsed.items
    totalCount = parsed.total_count
  } else if ('login' in parsed) {
    // Single user
    users = [parsed]
  }

  if (users.length === 0) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const isSingleUser = users.length === 1 && !totalCount

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
          <span className="text-xs font-mono">
            {isSingleUser ? 'GitHub Profile' : 'GitHub Users'}
          </span>
          <span className="text-terminal/60 text-xs">
            {isSingleUser
              ? `@${users[0].login}`
              : `(${users.length}${totalCount && totalCount > users.length ? ` of ${totalCount}` : ''})`
            }
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
        <span>{isSingleUser ? 'GitHub Profile' : 'GitHub Users'}</span>
        {totalCount && totalCount > users.length && (
          <span className="text-gray-600">{totalCount} total</span>
        )}
      </button>

      {/* Content */}
      {isSingleUser ? (
        <UserCard user={users[0]} />
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
          <div className="absolute top-0 right-0 w-24 h-24">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
          </div>

          <div className="relative p-4">
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-1">
              {users.map((user, idx) => (
                <UserCard key={idx} user={user} compact />
              ))}
            </div>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
        </div>
      )}
    </div>
  )
}
