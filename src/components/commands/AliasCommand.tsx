import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Link, AlertCircle, Check, Trash2, RefreshCw } from 'lucide-react'
import { aliasService } from '../../services/alias'

export const AliasCommand: Command = {
  name: 'alias',
  description: 'Manage command aliases',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">alias [name[=command]] [options]</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">alias</span> — List all aliases</p>
        <p><span className="text-white">alias name=command</span> — Create/update an alias</p>
        <p><span className="text-white">alias -d name</span> — Delete an alias</p>
        <p><span className="text-white">alias --reset</span> — Reset to default aliases</p>
      </div>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">alias gs="git status"</span> — Create alias 'gs' for 'git status'</p>
        <p><span className="text-white">alias ll="ls -l"</span> — Create alias 'll' for 'ls -l'</p>
        <p><span className="text-white">alias -d gs</span> — Remove the 'gs' alias</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    aliasService.initialize()

    // No args - list all aliases
    if (args.length === 0) {
      const aliases = aliasService.getAll()
      const entries = Object.entries(aliases)

      if (entries.length === 0) {
        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <Link size={14} className="text-gray-500" />
              <span className="text-gray-500">No aliases defined</span>
            </div>
          </div>
        )
      }

      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
              <Link size={14} className="text-terminal" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {entries.length} {entries.length === 1 ? 'alias' : 'aliases'}
              </span>
            </div>
            <div className="space-y-1">
              {entries.map(([name, command], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-terminal">{name}</span>
                  <span className="text-gray-600">=</span>
                  <span className="text-gray-300">"{command}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Reset aliases
    if (args[0] === '--reset') {
      aliasService.reset()
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <RefreshCw size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-gray-400">Aliases reset to defaults</span>
          </div>
        </div>
      )
    }

    // Delete alias
    if (args[0] === '-d' && args[1]) {
      const removed = aliasService.remove(args[1])
      if (!removed) {
        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-red-400">Alias not found: {args[1]}</span>
            </div>
          </div>
        )
      }

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <Trash2 size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-gray-400">Removed alias</span>
            <span className="text-white">{args[1]}</span>
          </div>
        </div>
      )
    }

    // Create/update alias: alias name=command or alias name="command with spaces"
    const fullArg = args.join(' ')
    const match = fullArg.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)=(.+)$/)

    if (!match) {
      // Maybe just showing a specific alias?
      const name = args[0]
      const value = aliasService.get(name)
      if (value) {
        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <Link size={14} className="text-terminal" />
              <span className="text-terminal">{name}</span>
              <span className="text-gray-600">=</span>
              <span className="text-gray-300">"{value}"</span>
            </div>
          </div>
        )
      }

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Invalid syntax. Use: alias name=command</span>
          </div>
        </div>
      )
    }

    const [, name, command] = match
    // Remove surrounding quotes if present
    const cleanCommand = command.replace(/^["']|["']$/g, '')

    aliasService.set(name, cleanCommand)

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Link size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-terminal">{name}</span>
          <span className="text-gray-600">=</span>
          <span className="text-gray-300">"{cleanCommand}"</span>
        </div>
      </div>
    )
  },
}
