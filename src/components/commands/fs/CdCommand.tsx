import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { FolderOpen, AlertCircle } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const CdCommand: Command = {
  name: 'cd',
  description: 'Change current directory',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">cd [directory]</p>
      <p className="text-terminal mb-2">Arguments:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">directory</span> — Path to change to (absolute or relative)</p>
      </div>
      <p className="text-terminal mb-2">Special paths:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">~</span> — Home directory (/home/user)</p>
        <p><span className="text-white">..</span> — Parent directory</p>
        <p><span className="text-white">.</span> — Current directory</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    // Default to home directory if no argument
    let targetPath = args[0] || '/home/user'

    // Handle ~ for home directory
    if (targetPath === '~' || targetPath.startsWith('~/')) {
      targetPath = targetPath.replace(/^~/, '/home/user')
    }

    const result = fileSystem.cd(targetPath)

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

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <FolderOpen size={14} className="text-terminal" />
          <span className="text-gray-400">Changed to</span>
          <span className="text-white">{result.data}</span>
        </div>
      </div>
    )
  },
}
