import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { MoveRight, AlertCircle, Check } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const MvCommand: Command = {
  name: 'mv',
  description: 'Move or rename files and directories',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">mv &lt;source&gt; &lt;destination&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">Moves or renames a file or directory.</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">mv old.txt new.txt</span> — Rename file</p>
        <p><span className="text-white">mv file.txt /home/user/docs/</span> — Move to directory</p>
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
            <span className="text-red-400">Missing arguments. Usage: mv &lt;source&gt; &lt;destination&gt;</span>
          </div>
        </div>
      )
    }

    const [src, dest] = args

    const srcResolved = fileSystem.resolvePath(src)
    const result = fileSystem.mv(src, dest)

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

    const destResolved = fileSystem.resolvePath(dest)

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <MoveRight size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-gray-400">Moved successfully</span>
          </div>
          <div className="text-sm text-gray-500 ml-6">
            <span className="text-gray-300">{srcResolved}</span>
            <span className="mx-2">→</span>
            <span className="text-white">{destResolved}</span>
          </div>
        </div>
      </div>
    )
  },
}
