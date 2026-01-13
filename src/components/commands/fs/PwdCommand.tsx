import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { FolderOpen } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'

export const PwdCommand: Command = {
  name: 'pwd',
  description: 'Print current working directory',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">pwd</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400">Prints the absolute path of the current working directory.</p>
    </div>
  ),
  args: [],
  run: async (_args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()
    const cwd = fileSystem.getCwd()

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <FolderOpen size={14} className="text-terminal" />
          <span className="text-white">{cwd}</span>
        </div>
      </div>
    )
  },
}
