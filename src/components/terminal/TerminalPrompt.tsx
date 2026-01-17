'use client'

import React, { useState, useEffect } from 'react'
import Cursor from '../Cursor'
import { GitBranch } from 'lucide-react'
import { gitService } from '../../services/git'

interface TerminalPromptProps {
  prompt: string
  text: string
  cursorPos: number
}

export function TerminalPrompt({ prompt, text, cursorPos }: TerminalPromptProps) {
  const liveText = text.replace(/\n$/, '')
  const boundary = liveText.indexOf(' ') === -1 ? liveText.length : liveText.indexOf(' ')

  // Track git branch with React state for reactivity
  const [gitBranch, setGitBranch] = useState<string | null>(null)

  useEffect(() => {
    const updateBranch = () => {
      gitService.initialize()
      const branch = gitService.isInitialized() ? gitService.getCurrentBranch() : null
      setGitBranch(branch)
    }

    updateBranch()
    const interval = setInterval(updateBranch, 300)
    return () => clearInterval(interval)
  }, [])

  const renderSegment = (segment: string, start: number) => {
    if (!segment) return null
    const end = start + segment.length
    if (end <= boundary) {
      return <span className="font-semibold text-terminal">{segment}</span>
    }
    if (start >= boundary) {
      return <span className="text-gray-300">{segment}</span>
    }
    const firstPart = segment.slice(0, boundary - start)
    const secondPart = segment.slice(boundary - start)
    return (
      <>
        <span className="font-semibold text-terminal">{firstPart}</span>
        <span className="text-gray-300">{secondPart}</span>
      </>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-800/50">
      <div className="flex items-start gap-3">
        {/* Prompt indicator with git branch */}
        <div className="flex items-center gap-2 shrink-0">
          {gitBranch && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-terminal/10 border border-terminal/20">
              <GitBranch size={12} className="text-terminal" />
              <span className="text-gray-300 font-mono text-xs">{gitBranch}</span>
            </span>
          )}
          <span className="text-terminal font-mono text-sm">❯</span>
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm whitespace-pre-wrap break-all">
            {renderSegment(liveText.slice(0, cursorPos), 0)}
            <Cursor />
            {renderSegment(liveText.slice(cursorPos), cursorPos)}
          </div>
        </div>
      </div>
    </div>
  )
}
