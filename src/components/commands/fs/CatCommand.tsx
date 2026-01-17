import React from 'react'
import Command from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { FileText, AlertCircle } from 'lucide-react'
import { fileSystem } from '../../../services/filesystem'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Map file extensions to language names for syntax highlighting
const EXT_TO_LANGUAGE: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  json: 'json',
  md: 'markdown',
  html: 'html',
  css: 'css',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  rs: 'rust',
  go: 'go',
  rb: 'ruby',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
}

function getLanguage(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? EXT_TO_LANGUAGE[ext] || null : null
}

export const CatCommand: Command = {
  name: 'cat',
  description: 'Display file contents',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">cat &lt;filename&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">Displays the contents of a file with syntax highlighting.</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">cat file.txt</span> — Show contents of file.txt</p>
        <p><span className="text-white">cat /home/user/.bashrc</span> — Show .bashrc contents</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _context: KeyPressContextType) => {
    fileSystem.initialize()

    if (!args[0]) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Missing filename. Usage: cat &lt;filename&gt;</span>
          </div>
        </div>
      )
    }

    const result = fileSystem.cat(args[0])

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

    const content = result.data
    const resolvedPath = fileSystem.resolvePath(args[0])
    const language = getLanguage(resolvedPath)

    if (!content) {
      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-800">
              <FileText size={14} className="text-terminal" />
              <span className="text-gray-500 text-xs">{resolvedPath}</span>
            </div>
            <p className="text-gray-500 italic">File is empty</p>
          </div>
        </div>
      )
    }

    return (
      <div className="font-mono text-sm">
        <div className="rounded-lg bg-neutral-900/50 border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-800">
            <FileText size={14} className="text-terminal" />
            <span className="text-gray-500 text-xs">{resolvedPath}</span>
            {language && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-terminal/10 text-terminal border border-terminal/20">
                {language}
              </span>
            )}
          </div>
          {language ? (
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
              }}
              wrapLongLines
            >
              {content}
            </SyntaxHighlighter>
          ) : (
            <pre className="p-4 text-gray-300 whitespace-pre-wrap break-words">{content}</pre>
          )}
        </div>
      </div>
    )
  },
}
