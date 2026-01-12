import { useState } from 'react'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { formatToolName } from '../utils'

export function DefaultToolRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="my-2 not-prose">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
      >
        {expanded ? (
          <ChevronDown size={12} className="text-terminal/70" />
        ) : (
          <ChevronRight size={12} className="text-terminal/70" />
        )}
        <Search size={12} className="text-terminal" />
        <span className="text-xs font-mono">{formatToolName(tool.tool)}</span>
        {isActive ? (
          <span className="text-terminal animate-pulse text-xs">...</span>
        ) : (
          <span className="text-terminal/60 text-xs">✓</span>
        )}
      </button>

      {expanded && (
        <div className="mt-2 ml-5 p-2 rounded bg-neutral-800/50 border border-neutral-700 text-xs font-mono overflow-x-auto">
          {tool.input && (
            <div className="mb-2">
              <span className="text-gray-500">Input:</span>
              <pre className="text-gray-400 mt-1 whitespace-pre-wrap">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}
          {tool.result && (
            <div>
              <span className="text-gray-500">Result:</span>
              <pre className="text-gray-400 mt-1 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {tool.result.slice(0, 500)}{tool.result.length > 500 ? '...' : ''}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
