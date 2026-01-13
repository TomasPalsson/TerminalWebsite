import React, { useRef, useEffect, useState, useContext } from 'react'
import TerminalHandler from '../components/TerminalHandler'
import { KeyPressProvider, KeyPressContext } from '../context/KeypressedContext'
import { Terminal as TerminalIcon, Folder, GitBranch } from 'lucide-react'
import { fileSystem } from '../services/filesystem'
import { gitService } from '../services/git'
import { VimEditor } from '../components/commands/vim/VimEditor'

/**
 * Inner terminal content that has access to KeyPressContext
 */
function TerminalContent() {
  const context = useContext(KeyPressContext)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [gitBranch, setGitBranch] = useState<string | null>(null)
  const [cwd, setCwd] = useState('/home/user')

  // Initialize services and update state
  useEffect(() => {
    fileSystem.initialize()
    gitService.initialize()

    // Update cwd
    setCwd(fileSystem.getCwd())

    // Update git branch
    if (gitService.isInitialized()) {
      setGitBranch(gitService.getCurrentBranch())
    }

    // Set up interval to check for changes
    const interval = setInterval(() => {
      setCwd(fileSystem.getCwd())
      if (gitService.isInitialized()) {
        setGitBranch(gitService.getCurrentBranch())
      } else {
        setGitBranch(null)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // If vim editor is active, show it as fullscreen overlay
  if (context?.vimEditor) {
    return (
      <div className="flex flex-col h-[calc(100vh-40px)] bg-black">
        {/* Vim Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/95 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
              <TerminalIcon size={16} className="text-terminal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">vim</span>
                <span className="font-mono text-xs text-gray-600">—</span>
                <span className="font-mono text-xs text-gray-500">
                  {context.vimEditor.filename || '[No Name]'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
              vim
            </span>
          </div>
        </div>

        {/* Vim Editor */}
        <div className="flex-1 min-h-0">
          <VimEditor
            filename={context.vimEditor.filename}
            initialContent={context.vimEditor.initialContent}
            onSave={context.vimEditor.onSave}
            onClose={() => context.setVimEditor(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] bg-black">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
            <TerminalIcon size={16} className="text-terminal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">terminal</span>
              <span className="font-mono text-xs text-gray-600">—</span>
              <span className="font-mono text-xs text-gray-500">bash</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1.5">
                <Folder size={12} className="text-terminal" />
                <span className="font-mono text-xs text-gray-500">{cwd}</span>
              </div>
              {gitBranch && (
                <div className="flex items-center gap-1.5">
                  <GitBranch size={12} className="text-terminal" />
                  <span className="font-mono text-xs text-gray-500">{gitBranch}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
            zsh
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e20 transparent' }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-6 pb-4 border-b border-neutral-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-terminal font-mono text-sm">●</span>
              <span className="font-mono text-sm text-gray-400">Welcome to the terminal</span>
            </div>
            <p className="font-mono text-xs text-gray-600 pl-4">
              Type <span className="text-terminal">help</span> to see available commands
            </p>
          </div>

          {/* Terminal Content */}
          <TerminalHandler />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-900/80 border-t border-neutral-800 text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">INSERT</span>
          <span className="text-gray-600">UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">tomasp.me</span>
          <span className="text-terminal">●</span>
        </div>
      </div>
    </div>
  )
}

export function Terminal() {
  return (
    <KeyPressProvider>
      <TerminalContent />
    </KeyPressProvider>
  )
}
