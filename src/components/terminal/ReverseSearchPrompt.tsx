'use client'

import React from 'react'
import Cursor from '../Cursor'
import { Search } from 'lucide-react'

interface ReverseSearchPromptProps {
  query: string
  matchedCommand: string | null
}

export function ReverseSearchPrompt({ query, matchedCommand }: ReverseSearchPromptProps) {
  return (
    <div className="mt-4 pt-4 border-t border-neutral-800/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-terminal/10 border border-terminal/30">
          <Search size={12} className="text-terminal" />
          <span className="font-mono text-xs text-terminal">search</span>
        </div>
        <div className="font-mono text-sm">
          <span className="text-gray-500">{query}</span>
          <Cursor />
        </div>
      </div>
      {matchedCommand && (
        <div className="mt-2 ml-[72px] font-mono text-sm text-gray-400">
          <span className="text-gray-600">→</span> {matchedCommand}
        </div>
      )}
    </div>
  )
}
