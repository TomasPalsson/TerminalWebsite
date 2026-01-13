import React from 'react'
import Command from './Command'
import { LogOut } from 'lucide-react'

export const ExitCommand: Command = {
  name: 'exit',
  description: 'Exit the terminal',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400">exit</p>
      <p className="text-gray-500 text-xs mt-2">Returns to the landing page</p>
    </div>
  ),
  args: [],
  run: async () => {
    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <LogOut size={14} className="text-terminal" />
          <span className="text-gray-400">Exiting terminal...</span>
        </div>
      </div>
    )
  },
}
