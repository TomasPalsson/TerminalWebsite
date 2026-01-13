import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { File, AlertCircle, Check } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const TouchCommand: Command = {
  name: 'touch',
  description: 'Create a file or update timestamp',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">touch &lt;filename&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">Creates an empty file or updates the modification timestamp if the file exists.</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">touch file.txt</span> — Create file.txt in current directory</p>
        <p><span className="text-white">touch /home/user/docs/notes.md</span> — Create with absolute path</p>
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
            <span className="text-red-400">Missing filename. Usage: touch &lt;filename&gt;</span>
          </div>
        </div>
      )
    }

    const result = fileSystem.touch(args[0])

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
          <File size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-gray-400">Created</span>
          <span className="text-white">{resolvedPath}</span>
        </div>
      </div>
    )
  },
}
