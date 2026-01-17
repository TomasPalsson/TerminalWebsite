import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { RefreshCw, AlertCircle, Check, HardDrive } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'
import { gitService } from '../../../services/git'
import { envService } from '../../../services/env'

export const ClearFsCommand: Command = {
  name: 'clearfs',
  description: 'Reset filesystem to default state',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">clearfs [--confirm]</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Resets the mock filesystem and git state to their default values.
        All files, directories, and git history will be deleted.
      </p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">--confirm</span> — Skip confirmation and reset immediately</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    // Check for --confirm flag
    const confirmed = args.includes('--confirm')

    if (!confirmed) {
      // Show warning with storage usage
      const usage = fileSystem.getStorageUsage()
      const usageKB = (usage / 1024).toFixed(2)

      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-medium">Warning: This will reset all data</span>
            </div>
            <div className="space-y-2 text-sm text-gray-400 mb-3">
              <p>This will delete:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>All files and directories you've created</li>
                <li>All git commits, branches, and history</li>
                <li>All staged changes</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <HardDrive size={12} className="text-gray-500" />
              <span className="text-gray-500">Current storage: {usageKB} KB</span>
            </div>
            <p className="text-gray-400 text-sm">
              Run <span className="text-terminal">clearfs --confirm</span> to proceed
            </p>
          </div>
        </div>
      )
    }

    // Perform reset
    gitService.initialize()
    fileSystem.reset()
    gitService.clearState()
    envService.reset()

    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-white font-medium">Filesystem reset complete</span>
          </div>
          <p className="text-gray-500 text-sm ml-6">
            All files, directories, and git state have been restored to defaults
          </p>
        </div>
      </div>
    )
  },
}
