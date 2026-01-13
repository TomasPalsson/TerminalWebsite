import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { Trash2, AlertCircle, Check } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const RmCommand: Command = {
  name: 'rm',
  description: 'Remove files or directories',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">rm [options] &lt;path&gt;</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">-r</span> — Remove directories recursively</p>
      </div>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">rm file.txt</span> — Remove a file</p>
        <p><span className="text-white">rm -r mydir</span> — Remove directory and contents</p>
      </div>
    </div>
  ),
  args: ['-r'],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    // Parse arguments
    let recursive = false
    let targetPath: string | undefined

    for (const arg of args) {
      if (arg === '-r' || arg === '-rf' || arg === '-fr') {
        recursive = true
      } else if (!arg.startsWith('-')) {
        targetPath = arg
      }
    }

    if (!targetPath) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing path. Usage: rm [-r] &lt;path&gt;</span>
          </div>
        </div>
      )
    }

    const result = fileSystem.rm(targetPath, { recursive })

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

    const resolvedPath = fileSystem.resolvePath(targetPath)

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Trash2 size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-gray-400">Removed</span>
          <span className="text-white">{resolvedPath}</span>
        </div>
      </div>
    )
  },
}

export const RmdirCommand: Command = {
  name: 'rmdir',
  description: 'Remove empty directories',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">rmdir &lt;directory&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">Removes an empty directory. Use rm -r for non-empty directories.</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">rmdir emptydir</span> — Remove empty directory</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    if (!args[0]) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing directory. Usage: rmdir &lt;directory&gt;</span>
          </div>
        </div>
      )
    }

    const result = fileSystem.rmdir(args[0])

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

    const resolvedPath = fileSystem.resolvePath(args[0])

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Trash2 size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-gray-400">Removed</span>
          <span className="text-white">{resolvedPath}</span>
        </div>
      </div>
    )
  },
}
