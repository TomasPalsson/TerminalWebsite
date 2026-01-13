import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { MessageSquare, FileOutput, AlertCircle, Check } from 'lucide-react'
import { fileSystem } from '../../services/filesystem'

/**
 * Parse echo arguments to extract text and detect redirection.
 * Handles quoted strings and > / >> operators.
 */
function parseEchoArgs(args: string[]): {
  text: string
  redirectType: 'none' | 'overwrite' | 'append'
  filename: string | null
} {
  const fullArg = args.join(' ')

  // Check for append operator >>
  const appendMatch = fullArg.match(/^(.*)>>\s*(\S+)\s*$/)
  if (appendMatch) {
    const text = parseText(appendMatch[1].trim())
    return { text, redirectType: 'append', filename: appendMatch[2] }
  }

  // Check for overwrite operator >
  const overwriteMatch = fullArg.match(/^(.*)>\s*(\S+)\s*$/)
  if (overwriteMatch) {
    const text = parseText(overwriteMatch[1].trim())
    return { text, redirectType: 'overwrite', filename: overwriteMatch[2] }
  }

  // No redirection
  return { text: parseText(fullArg), redirectType: 'none', filename: null }
}

/**
 * Parse text, removing surrounding quotes if present.
 */
function parseText(text: string): string {
  // Remove surrounding double quotes
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1)
  }
  // Remove surrounding single quotes
  if (text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1)
  }
  return text
}

export const EchoCommand: Command = {
  name: 'echo',
  description: 'Print text to the terminal or write to a file',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">echo [text] [&gt; or &gt;&gt; filename]</p>
      <p className="text-terminal mb-2">Redirection:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">&gt;</span> — Overwrite file with text</p>
        <p><span className="text-white">&gt;&gt;</span> — Append text to file</p>
      </div>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">echo Hello, World!</span> — Print to terminal</p>
        <p><span className="text-white">echo "Hello" &gt; file.txt</span> — Write to file</p>
        <p><span className="text-white">echo "More text" &gt;&gt; file.txt</span> — Append to file</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    if (!args || args.length === 0) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">No text provided</p>
          <p className="text-gray-500 mt-1">
            Example: <span className="text-terminal">echo Hello, World!</span>
          </p>
        </div>
      )
    }

    const parsed = parseEchoArgs(args)

    // Handle file redirection
    if (parsed.redirectType !== 'none' && parsed.filename) {
      fileSystem.initialize()

      let result
      if (parsed.redirectType === 'overwrite') {
        result = fileSystem.writeFile(parsed.filename, parsed.text + '\n')
      } else {
        result = fileSystem.appendFile(parsed.filename, parsed.text + '\n')
      }

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

      const resolvedPath = fileSystem.resolvePath(parsed.filename)
      const action = parsed.redirectType === 'overwrite' ? 'Written to' : 'Appended to'

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <FileOutput size={14} className="text-terminal" />
            <Check size={14} className="text-terminal" />
            <span className="text-gray-400">{action}</span>
            <span className="text-white">{resolvedPath}</span>
          </div>
        </div>
      )
    }

    // Normal echo - print to terminal
    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-start gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <MessageSquare size={14} className="text-terminal mt-0.5" />
          <span className="text-gray-200">{parsed.text}</span>
        </div>
      </div>
    )
  }
}
