import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  GitMerge,
  AlertCircle,
  Check,
  Plus,
  Minus,
  FileText,
  FolderGit2,
} from 'lucide-react'
import { gitService } from '../../../services/git'
import { fileSystem } from '../../../services/filesystem'

/**
 * Format timestamp for display.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Git init subcommand.
 */
function gitInit(): React.ReactNode {
  const result = gitService.init()

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-2">
        <FolderGit2 size={14} className="text-terminal" />
        <Check size={14} className="text-terminal" />
        <span className="text-white font-medium">Initialized empty Git repository</span>
      </div>
      <p className="text-gray-500 text-sm ml-6">
        You can now start tracking files with <span className="text-terminal">git add</span>
      </p>
    </div>
  )
}

/**
 * Git status subcommand.
 */
function gitStatus(): React.ReactNode {
  const result = gitService.status()

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  const { branch, staged, unstaged, untracked } = result.data
  const hasChanges = staged.length > 0 || unstaged.length > 0 || untracked.length > 0

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <GitBranch size={14} className="text-terminal" />
        <span className="text-gray-400">On branch</span>
        <span className="text-terminal font-medium">{branch}</span>
      </div>

      {!hasChanges ? (
        <p className="text-gray-500">Nothing to commit, working tree clean</p>
      ) : (
        <div className="space-y-3">
          {staged.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Changes to be committed:
              </p>
              <div className="space-y-1">
                {staged.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 ml-2">
                    <span className="text-terminal">+</span>
                    <span className={
                      file.status === 'new' ? 'text-green-400' :
                      file.status === 'deleted' ? 'text-red-400' :
                      'text-yellow-400'
                    }>
                      {file.status}:
                    </span>
                    <span className="text-gray-300">{file.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unstaged.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Changes not staged for commit:
              </p>
              <div className="space-y-1">
                {unstaged.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 ml-2">
                    <span className="text-red-400">-</span>
                    <span className="text-red-400">{file.status}:</span>
                    <span className="text-gray-300">{file.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {untracked.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Untracked files:
              </p>
              <div className="space-y-1">
                {untracked.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 ml-2">
                    <span className="text-gray-500">?</span>
                    <span className="text-gray-400">{file.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Git add subcommand.
 */
function gitAdd(args: string[]): React.ReactNode {
  if (!args.length) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">Nothing specified. Usage: git add &lt;file&gt; or git add .</span>
      </div>
    )
  }

  let result
  if (args[0] === '.') {
    result = gitService.addAll()
  } else {
    result = gitService.add(args[0])
  }

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <Plus size={14} className="text-terminal" />
      <Check size={14} className="text-terminal" />
      <span className="text-gray-400">Staged</span>
      <span className="text-white">{args[0] === '.' ? 'all changes' : args[0]}</span>
    </div>
  )
}

/**
 * Git reset subcommand.
 */
function gitReset(args: string[]): React.ReactNode {
  let result
  if (!args.length || args[0] === '.') {
    result = gitService.resetAll()
  } else {
    result = gitService.reset(args[0])
  }

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <Minus size={14} className="text-terminal" />
      <Check size={14} className="text-terminal" />
      <span className="text-gray-400">Unstaged</span>
      <span className="text-white">{!args.length || args[0] === '.' ? 'all changes' : args[0]}</span>
    </div>
  )
}

/**
 * Git commit subcommand.
 */
function gitCommit(args: string[]): React.ReactNode {
  // Parse -m "message" format
  let message = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-m' && args[i + 1]) {
      // Join remaining args as message (handles quotes)
      message = args.slice(i + 1).join(' ')
      // Remove surrounding quotes if present
      if ((message.startsWith('"') && message.endsWith('"')) ||
          (message.startsWith("'") && message.endsWith("'"))) {
        message = message.slice(1, -1)
      }
      break
    }
  }

  if (!message) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">Missing commit message. Usage: git commit -m "message"</span>
      </div>
    )
  }

  const result = gitService.commit(message)

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-2">
        <GitCommitIcon size={14} className="text-terminal" />
        <Check size={14} className="text-terminal" />
        <span className="text-white font-medium">Committed</span>
        <span className="text-terminal font-mono">[{result.data.hash}]</span>
      </div>
      <p className="text-gray-400 ml-6">{message}</p>
    </div>
  )
}

/**
 * Git log subcommand.
 */
function gitLog(args: string[]): React.ReactNode {
  const limit = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : undefined
  const result = gitService.log({ limit })

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <GitCommitIcon size={14} className="text-gray-500" />
        <span className="text-gray-500">No commits yet</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <GitCommitIcon size={14} className="text-terminal" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {result.data.length} {result.data.length === 1 ? 'commit' : 'commits'}
        </span>
      </div>
      <div className="space-y-3">
        {result.data.map((entry, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-terminal font-mono text-sm">{entry.hash}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white">{entry.message}</span>
                {entry.branch && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-terminal/20 text-terminal">
                    {entry.branch}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Git show subcommand.
 */
function gitShow(args: string[]): React.ReactNode {
  if (!args.length) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">Missing commit hash. Usage: git show &lt;hash&gt;</span>
      </div>
    )
  }

  const result = gitService.show(args[0])

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  const commit = result.data
  const fileCount = Object.keys(commit.snapshot).length

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <GitCommitIcon size={14} className="text-terminal" />
        <span className="text-terminal font-mono">{commit.hash}</span>
      </div>
      <div className="space-y-2">
        <p className="text-white">{commit.message}</p>
        <p className="text-xs text-gray-500">{formatDate(commit.timestamp)}</p>
        {commit.parentHash && (
          <p className="text-xs text-gray-600">
            Parent: <span className="text-gray-400 font-mono">{commit.parentHash}</span>
          </p>
        )}
        <div className="mt-3 pt-2 border-t border-neutral-800">
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
            Snapshot ({fileCount} {fileCount === 1 ? 'file' : 'files'}):
          </p>
          <div className="space-y-1">
            {Object.keys(commit.snapshot).map((path, i) => (
              <div key={i} className="flex items-center gap-2 ml-2">
                <FileText size={12} className="text-gray-500" />
                <span className="text-gray-400 text-sm">{path}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Git branch subcommand.
 */
function gitBranch(args: string[]): React.ReactNode {
  // Create new branch
  if (args.length > 0 && !args[0].startsWith('-')) {
    const result = gitService.branch(args[0])

    if (!result.success) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-red-400">{result.error}</span>
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <GitBranch size={14} className="text-terminal" />
        <Check size={14} className="text-terminal" />
        <span className="text-gray-400">Created branch</span>
        <span className="text-white">{args[0]}</span>
      </div>
    )
  }

  // Delete branch
  if (args[0] === '-d' && args[1]) {
    const result = gitService.deleteBranch(args[1])

    if (!result.success) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-red-400">{result.error}</span>
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <GitBranch size={14} className="text-terminal" />
        <Check size={14} className="text-terminal" />
        <span className="text-gray-400">Deleted branch</span>
        <span className="text-white">{args[1]}</span>
      </div>
    )
  }

  // List branches
  const result = gitService.listBranches()

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <GitBranch size={14} className="text-gray-500" />
        <span className="text-gray-500">No branches yet. Create a commit first.</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="space-y-1">
        {result.data.map((branch, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={branch.current ? 'text-terminal' : 'text-gray-600'}>
              {branch.current ? '*' : ' '}
            </span>
            <GitBranch size={12} className={branch.current ? 'text-terminal' : 'text-gray-500'} />
            <span className={branch.current ? 'text-terminal font-medium' : 'text-gray-300'}>
              {branch.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Git checkout subcommand.
 */
function gitCheckout(args: string[]): React.ReactNode {
  if (!args.length) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">Missing branch name. Usage: git checkout &lt;branch&gt;</span>
      </div>
    )
  }

  // Handle -b flag for creating and switching
  if (args[0] === '-b' && args[1]) {
    const createResult = gitService.branch(args[1])
    if (!createResult.success) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-red-400">{createResult.error}</span>
        </div>
      )
    }
    const checkoutResult = gitService.checkout(args[1])
    if (!checkoutResult.success) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-red-400">{checkoutResult.error}</span>
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <GitBranch size={14} className="text-terminal" />
        <Check size={14} className="text-terminal" />
        <span className="text-gray-400">Switched to new branch</span>
        <span className="text-white">{args[1]}</span>
      </div>
    )
  }

  const result = gitService.checkout(args[0])

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <GitBranch size={14} className="text-terminal" />
      <Check size={14} className="text-terminal" />
      <span className="text-gray-400">Switched to branch</span>
      <span className="text-white">{args[0]}</span>
    </div>
  )
}

/**
 * Git merge subcommand.
 */
function gitMerge(args: string[]): React.ReactNode {
  if (!args.length) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">Missing branch name. Usage: git merge &lt;branch&gt;</span>
      </div>
    )
  }

  const result = gitService.merge(args[0])

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <GitMerge size={14} className="text-terminal" />
      <Check size={14} className="text-terminal" />
      <span className="text-gray-400">{result.data.message}</span>
    </div>
  )
}

/**
 * Git diff subcommand.
 */
function gitDiff(args: string[]): React.ReactNode {
  const staged = args.includes('--staged') || args.includes('--cached')
  const result = staged ? gitService.diffStaged() : gitService.diff()

  if (!result.success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-red-400">{result.error}</span>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <FileText size={14} className="text-gray-500" />
        <span className="text-gray-500">No {staged ? 'staged ' : ''}changes</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="space-y-3">
        {result.data.map((entry, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={
                entry.type === 'added' ? 'text-green-400' :
                entry.type === 'removed' ? 'text-red-400' :
                'text-yellow-400'
              }>
                {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : '~'}
              </span>
              <span className="text-white">{entry.path}</span>
              <span className={
                entry.type === 'added' ? 'text-green-400 text-xs' :
                entry.type === 'removed' ? 'text-red-400 text-xs' :
                'text-yellow-400 text-xs'
              }>
                ({entry.type})
              </span>
            </div>
            {entry.type === 'modified' && entry.oldContent !== undefined && entry.newContent !== undefined && (
              <div className="ml-4 text-xs font-mono bg-neutral-950 rounded p-2 overflow-x-auto">
                <div className="text-red-400/70">- {entry.oldContent.split('\n').slice(0, 3).join('\n')}</div>
                <div className="text-green-400/70">+ {entry.newContent.split('\n').slice(0, 3).join('\n')}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Show git help.
 */
function gitHelp(): React.ReactNode {
  return (
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <FolderGit2 size={14} className="text-terminal" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">Git Commands</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-terminal">git init</span>
          <span className="text-gray-500">Initialize repository</span>
          <span className="text-terminal">git status</span>
          <span className="text-gray-500">Show working tree status</span>
          <span className="text-terminal">git add &lt;file&gt;</span>
          <span className="text-gray-500">Stage file for commit</span>
          <span className="text-terminal">git add .</span>
          <span className="text-gray-500">Stage all changes</span>
          <span className="text-terminal">git reset &lt;file&gt;</span>
          <span className="text-gray-500">Unstage file</span>
          <span className="text-terminal">git commit -m "msg"</span>
          <span className="text-gray-500">Commit staged changes</span>
          <span className="text-terminal">git log</span>
          <span className="text-gray-500">Show commit history</span>
          <span className="text-terminal">git show &lt;hash&gt;</span>
          <span className="text-gray-500">Show commit details</span>
          <span className="text-terminal">git branch</span>
          <span className="text-gray-500">List branches</span>
          <span className="text-terminal">git branch &lt;name&gt;</span>
          <span className="text-gray-500">Create branch</span>
          <span className="text-terminal">git checkout &lt;branch&gt;</span>
          <span className="text-gray-500">Switch branches</span>
          <span className="text-terminal">git merge &lt;branch&gt;</span>
          <span className="text-gray-500">Merge branch</span>
          <span className="text-terminal">git diff</span>
          <span className="text-gray-500">Show unstaged changes</span>
        </div>
      </div>
    </div>
  )
}

export const GitCommand: Command = {
  name: 'git',
  description: 'Git version control',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">git &lt;command&gt; [options]</p>
      <p className="text-terminal mb-2">Commands:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">init</span> — Initialize a new repository</p>
        <p><span className="text-white">status</span> — Show working tree status</p>
        <p><span className="text-white">add &lt;file&gt;</span> — Stage changes</p>
        <p><span className="text-white">commit -m "msg"</span> — Commit changes</p>
        <p><span className="text-white">log</span> — Show commit history</p>
        <p><span className="text-white">branch</span> — List or create branches</p>
        <p><span className="text-white">checkout &lt;branch&gt;</span> — Switch branches</p>
        <p><span className="text-white">merge &lt;branch&gt;</span> — Merge branches</p>
        <p><span className="text-white">diff</span> — Show changes</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()
    gitService.initialize()

    if (!args.length) {
      return <div className="font-mono text-sm">{gitHelp()}</div>
    }

    const [subcommand, ...subargs] = args
    let result: React.ReactNode

    switch (subcommand) {
      case 'init':
        result = gitInit()
        break
      case 'status':
        result = gitStatus()
        break
      case 'add':
        result = gitAdd(subargs)
        break
      case 'reset':
        result = gitReset(subargs)
        break
      case 'commit':
        result = gitCommit(subargs)
        break
      case 'log':
        result = gitLog(subargs)
        break
      case 'show':
        result = gitShow(subargs)
        break
      case 'branch':
        result = gitBranch(subargs)
        break
      case 'checkout':
        result = gitCheckout(subargs)
        break
      case 'merge':
        result = gitMerge(subargs)
        break
      case 'diff':
        result = gitDiff(subargs)
        break
      case 'help':
      case '--help':
      case '-h':
        result = gitHelp()
        break
      default:
        result = (
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Unknown git command: {subcommand}</span>
          </div>
        )
    }

    return <div className="font-mono text-sm">{result}</div>
  },
}
