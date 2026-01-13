import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Variable, AlertCircle, Check, Trash2 } from 'lucide-react'
import { envService } from '../../services/env'

export const ExportCommand: Command = {
  name: 'export',
  description: 'Set environment variables',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">export [NAME=value]</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">export</span> — List all environment variables</p>
        <p><span className="text-white">export NAME=value</span> — Set a variable</p>
        <p><span className="text-white">unset NAME</span> — Remove a variable</p>
      </div>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">export EDITOR=vim</span> — Set EDITOR variable</p>
        <p><span className="text-white">export MY_VAR="hello world"</span> — Set with spaces</p>
        <p><span className="text-white">echo $EDITOR</span> — Use in echo</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    envService.initialize()

    // No args - list all variables
    if (args.length === 0) {
      const vars = envService.getAll()
      const entries = Object.entries(vars).sort(([a], [b]) => a.localeCompare(b))

      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
              <Variable size={14} className="text-terminal" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {entries.length} variables
              </span>
            </div>
            <div className="space-y-1">
              {entries.map(([name, value], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-terminal">{name}</span>
                  <span className="text-gray-600">=</span>
                  <span className="text-gray-300">"{value}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Set variable: export NAME=value
    const fullArg = args.join(' ')
    const match = fullArg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)

    if (!match) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Invalid syntax. Use: export NAME=value</span>
          </div>
        </div>
      )
    }

    const [, name, rawValue] = match
    // Remove surrounding quotes if present
    const value = rawValue.replace(/^["']|["']$/g, '')

    envService.set(name, value)

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Variable size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-terminal">{name}</span>
          <span className="text-gray-600">=</span>
          <span className="text-gray-300">"{value}"</span>
        </div>
      </div>
    )
  },
}

export const UnsetCommand: Command = {
  name: 'unset',
  description: 'Remove environment variables',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">unset NAME</p>
      <p className="text-terminal mb-2">Example:</p>
      <p className="text-gray-400">
        <span className="text-white">unset MY_VAR</span> — Remove MY_VAR
      </p>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    envService.initialize()

    if (!args[0]) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing variable name. Usage: unset NAME</span>
          </div>
        </div>
      )
    }

    const name = args[0]
    const removed = envService.unset(name)

    if (!removed) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <Variable size={14} className="text-gray-500" />
            <span className="text-gray-500">Variable not set: {name}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Trash2 size={14} className="text-terminal" />
          <Check size={14} className="text-terminal" />
          <span className="text-gray-400">Removed</span>
          <span className="text-white">{name}</span>
        </div>
      </div>
    )
  },
}
