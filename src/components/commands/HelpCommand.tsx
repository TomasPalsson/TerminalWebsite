import React from 'react'
import { Command } from './Command'
import { commandMap } from './CommandMap'

export const HelpCommand: Command = {
  name: 'help',
  description: 'List all available commands',
  args: [],
  run: async (args: string[]) => {
    if (args.length > 0) {
      const command = commandMap.get(args[0])
      if (command) {
        return (
          <div className="font-mono text-sm leading-relaxed text-gray-300">
            {command.usage || (
              <p className="text-gray-500">No usage information available for this command.</p>
            )}
          </div>
        )
      } else {
        return (
          <div className="font-mono text-sm leading-relaxed">
            <p className="text-red-400">Command not found: {args[0]}</p>
          </div>
        )
      }
    }

    const builtInCommands = [
      { name: 'clear', desc: 'Clear the terminal screen', args: [] },
      ...[...commandMap.keys()].map((cmd) => {
        const command = commandMap.get(cmd)
        return {
          name: cmd,
          args: command?.args || [],
          desc: command?.description || '',
        }
      }),
    ]

    return (
      <div className="font-mono text-sm leading-relaxed">
        <div className="flex items-center gap-2 mb-3 text-terminal">
          <span className="text-terminal">$</span>
          <span>Available commands</span>
        </div>
        <div className="space-y-1 pl-2 border-l border-neutral-800">
          {builtInCommands.map((cmd) => (
            <div key={cmd.name} className="flex items-start gap-3 py-1">
              <span className="font-medium text-terminal min-w-[100px]">{cmd.name}</span>
              <span className="text-gray-500">{cmd.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-gray-500">
            Type <span className="text-terminal">help [command]</span> for details about a specific command.
          </p>
        </div>
      </div>
    )
  },
}
