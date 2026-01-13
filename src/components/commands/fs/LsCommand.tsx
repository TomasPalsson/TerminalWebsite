import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { Folder, File, AlertCircle, FolderOpen } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'
import { DirectoryEntry } from '../../../types/filesystem'

/**
 * Format file size for display.
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}

/**
 * Format timestamp for display.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = date.toLocaleString('en', { month: 'short' })
  const day = date.getDate().toString().padStart(2, ' ')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month} ${day} ${hours}:${minutes}`
}

/**
 * Entry row component for long format.
 */
const EntryRowLong = ({ entry }: { entry: DirectoryEntry }) => (
  <div className="flex items-center gap-4 py-1 text-sm">
    <span className="text-gray-600 w-16 text-right font-mono">
      {entry.type === 'directory' ? 'dir' : formatSize(entry.size)}
    </span>
    <span className="text-gray-500 w-28 font-mono">
      {formatDate(entry.modifiedAt)}
    </span>
    <div className="flex items-center gap-2">
      {entry.type === 'directory' ? (
        <Folder size={14} className="text-terminal" />
      ) : (
        <File size={14} className="text-gray-500" />
      )}
      <span className={entry.type === 'directory' ? 'text-terminal' : 'text-gray-300'}>
        {entry.name}
        {entry.type === 'directory' ? '/' : ''}
      </span>
    </div>
  </div>
)

/**
 * Entry component for compact format.
 */
const EntryCompact = ({ entry }: { entry: DirectoryEntry }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900/30">
    {entry.type === 'directory' ? (
      <Folder size={12} className="text-terminal" />
    ) : (
      <File size={12} className="text-gray-500" />
    )}
    <span className={entry.type === 'directory' ? 'text-terminal' : 'text-gray-300'}>
      {entry.name}
      {entry.type === 'directory' ? '/' : ''}
    </span>
  </div>
)

export const LsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">ls [options] [directory]</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">-a</span> — Show hidden files (starting with .)</p>
        <p><span className="text-white">-l</span> — Long format with details</p>
        <p><span className="text-white">-la, -al</span> — Both options combined</p>
      </div>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">ls</span> — List current directory</p>
        <p><span className="text-white">ls -la</span> — List all files with details</p>
        <p><span className="text-white">ls /home</span> — List specific directory</p>
      </div>
    </div>
  ),
  args: ['-a', '-l', '-la', '-al'],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    // Parse arguments
    let showAll = false
    let longFormat = false
    let targetPath: string | undefined

    for (const arg of args) {
      if (arg === '-a') {
        showAll = true
      } else if (arg === '-l') {
        longFormat = true
      } else if (arg === '-la' || arg === '-al') {
        showAll = true
        longFormat = true
      } else if (!arg.startsWith('-')) {
        targetPath = arg
      }
    }

    const result = fileSystem.ls(targetPath, { all: showAll, long: longFormat })

    if (!result.success) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">{result.error}</span>
          </div>
        </div>
      )
    }

    const entries = result.data

    if (entries.length === 0) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <FolderOpen size={14} className="text-gray-500" />
            <span className="text-gray-500">Directory is empty</span>
          </div>
        </div>
      )
    }

    if (longFormat) {
      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
              <FolderOpen size={14} className="text-terminal" />
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                {entries.length} {entries.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="space-y-0.5">
              {entries.map((entry) => (
                <EntryRowLong key={entry.name} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
              <EntryCompact key={entry.name} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    )
  },
}
