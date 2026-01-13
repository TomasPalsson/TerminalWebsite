import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { Copy, AlertCircle, Check } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const CpCommand: Command = {
  name: 'cp',
  description: 'Copy files or directories',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">cp &lt;source&gt; &lt;destination&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">Copies a file or directory to a new location.</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">cp file.txt backup.txt</span> — Copy file to new name</p>
        <p><span className="text-white">cp file.txt /home/user/docs/</span> — Copy to directory</p>
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
            <span className="text-red-400">Missing arguments. Usage: cp &lt;source&gt; &lt;destination&gt;</span>
          </div>
        </div>
      )
    }

    const [src, dest] = args

    const result = fileSystem.cp(src, dest)

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

    const srcResolved = fileSystem.resolvePath(src)
    const destResolved = fileSystem.resolvePath(dest)

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Copy size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-gray-400">Copied successfully</span>
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
