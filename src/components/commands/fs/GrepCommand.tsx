import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { Search, AlertCircle, FileText } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const GrepCommand: Command = {
  name: 'grep',
  description: 'Search for text patterns in files',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">grep &lt;pattern&gt; &lt;file|directory&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Searches for lines containing the pattern in files.
        If a directory is specified, searches recursively.
      </p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">grep "hello" file.txt</span> — Search in a single file</p>
        <p><span className="text-white">grep "TODO" .</span> — Search recursively in current directory</p>
        <p><span className="text-white">grep "error" /home/user/logs</span> — Search in logs directory</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    if (args.length < 2) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing arguments. Usage: grep &lt;pattern&gt; &lt;file&gt;</span>
          </div>
        </div>
      )
    }

    // Pattern might be quoted
    let pattern = args[0].replace(/^["']|["']$/g, '')
    const path = args[1]

    const result = fileSystem.grep(pattern, path)

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

    if (result.data.length === 0) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <Search size={14} className="text-gray-500" />
            <span className="text-gray-500">No matches found for "{pattern}"</span>
          </div>
        </div>
      )
    }

    // Group results by file
    const groupedResults: Record<string, { line: number; content: string }[]> = {}
    for (const match of result.data) {
      if (!groupedResults[match.path]) {
        groupedResults[match.path] = []
      }
      groupedResults[match.path].push({ line: match.line, content: match.content })
    }

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
            <Search size={14} className="text-terminal" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {result.data.length} {result.data.length === 1 ? 'match' : 'matches'} in{' '}
              {Object.keys(groupedResults).length} {Object.keys(groupedResults).length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(groupedResults).map(([filePath, matches], i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={12} className="text-terminal" />
                  <span className="text-terminal">{filePath}</span>
                </div>
                <div className="space-y-1 ml-4">
                  {matches.map((match, j) => (
                    <div key={j} className="flex gap-2">
                      <span className="text-gray-600 shrink-0">{match.line}:</span>
                      <span className="text-gray-300">
                        {highlightMatch(match.content, pattern)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

/**
 * Highlight matching text in the content.
 */
function highlightMatch(content: string, pattern: string): React.ReactNode {
  const lowerContent = content.toLowerCase()
  const lowerPattern = pattern.toLowerCase()
  const index = lowerContent.indexOf(lowerPattern)

  if (index === -1) {
    return content
  }

  const before = content.slice(0, index)
  const match = content.slice(index, index + pattern.length)
  const after = content.slice(index + pattern.length)

  return (
    <>
      {before}
      <span className="bg-terminal/30 text-terminal">{match}</span>
      {after}
    </>
  )
}
