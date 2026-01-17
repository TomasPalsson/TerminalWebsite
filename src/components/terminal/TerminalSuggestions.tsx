'use client'

import React from 'react'

interface TerminalSuggestionsProps {
  suggestions: string[] | null
}

export function TerminalSuggestions({ suggestions }: TerminalSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="mt-3 ml-6">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <span
            key={i}
            className="px-2 py-1 font-mono text-xs rounded bg-neutral-900 border border-neutral-800 text-gray-400"
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  )
}
