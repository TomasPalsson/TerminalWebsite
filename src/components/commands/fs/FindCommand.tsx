import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { Search, AlertCircle, FileText, Folder } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const FindCommand: Command = {
  name: 'find',
  description: 'Search for files and directories by name pattern',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">find [path] -name &lt;pattern&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Recursively searches for files and directories matching the pattern.
        Supports * wildcard for matching any characters.
      </p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">find . -name "*.txt"</span> — Find all .txt files</p>
        <p><span className="text-white">find /home -name "readme*"</span> — Find files starting with "readme"</p>
        <p><span className="text-white">find . -name "*test*"</span> — Find files containing "test"</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    // Parse arguments
    let startPath = '.'
    let pattern = ''

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) {
        pattern = args[i + 1].replace(/^["']|["']$/g, '') // Remove quotes
        i++
      } else if (!args[i].startsWith('-')) {
        startPath = args[i]
      }
    }

    if (!pattern) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing pattern. Usage: find [path] -name &lt;pattern&gt;</span>
          </div>
        </div>
      )
    }

    const result = fileSystem.find(startPath, pattern)

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

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
            <Search size={14} className="text-terminal" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {result.data.length} {result.data.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="space-y-1">
            {result.data.map((path, i) => {
              const isDir = fileSystem.isDirectory(path)
              return (
                <div key={i} className="flex items-center gap-2">
                  {isDir ? (
                    <Folder size={12} className="text-terminal" />
                  ) : (
                    <FileText size={12} className="text-gray-500" />
                  )}
                  <span className={isDir ? 'text-terminal' : 'text-gray-300'}>{path}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  },
}
