import React from 'react'
import { Command } from './Command'
import { commandMap } from './CommandMap'
import { HelpCircle, Terminal, ChevronRight, AlertCircle } from 'lucide-react'

// Group commands by category
const commandCategories: Record<string, string[]> = {
  'System': ['clear', 'exit', 'echo', 'color', 'alias', 'export', 'unset'],
  'Info': ['help', 'ip', 'weather'],
  'Portfolio': ['projects', 'school', 'cv'],
  'Tools': ['calc', 'curl', 'shorten'],
  'Filesystem': ['pwd', 'cd', 'ls', 'touch', 'cat', 'mkdir', 'rm', 'cp', 'mv', 'find', 'grep', 'clearfs'],
  'Git': ['git'],
  'Editors': ['vim'],
}

export const HelpCommand: Command = {
  name: 'help',
  description: 'List all available commands',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">help [command]</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">help</span> — List all commands</p>
        <p><span className="text-white">help projects</span> — Show projects command usage</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[]) => {
    // Show specific command help
    if (args.length > 0) {
      const command = commandMap.get(args[0])
      if (command) {
        return (
          <div className="font-mono text-sm">
            <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-neutral-800">
                <div className="p-2 rounded-lg bg-terminal/10 border border-terminal/30">
                  <Terminal size={14} className="text-terminal" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{command.name}</h3>
                  <p className="text-xs text-gray-500">{command.description}</p>
                </div>
              </div>
              <div className="text-gray-300">
                {command.usage || (
                  <p className="text-gray-500 italic">No detailed usage available</p>
                )}
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Command not found: <span className="text-white">{args[0]}</span></span>
          </div>
        </div>
      )
    }

    // Build command list with descriptions
    const allCommands = new Map<string, { desc: string }>()
    allCommands.set('clear', { desc: 'Clear the terminal screen' })

    for (const [name, cmd] of commandMap) {
      allCommands.set(name, { desc: cmd.description })
    }

    // Get categorized commands
    const categorizedCommands = Object.entries(commandCategories).map(([category, commands]) => ({
      category,
      commands: commands
        .filter(name => allCommands.has(name))
        .map(name => ({
          name,
          desc: allCommands.get(name)?.desc || '',
        })),
    }))

    return (
      <div className="font-mono text-sm">
        <div className="grid gap-4">
          {categorizedCommands.map(({ category, commands }) => (
            <div key={category} className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={14} className="text-terminal" />
                <h3 className="text-xs text-gray-500 uppercase tracking-wide">{category}</h3>
              </div>
              <div className="space-y-2">
                {commands.map((cmd) => (
                  <div
                    key={cmd.name}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight size={12} className="text-gray-600 group-hover:text-terminal transition" />
                      <span className="text-terminal font-medium">{cmd.name}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{cmd.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 px-4 py-3 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
          <p className="text-gray-500 text-xs">
            Type <span className="text-terminal">help [command]</span> for detailed usage information
          </p>
        </div>
      </div>
    )
  },
}
