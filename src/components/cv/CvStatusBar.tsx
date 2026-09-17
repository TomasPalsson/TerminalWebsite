'use client'

import { useState } from 'react'
import type { ViewerMode } from '@/utils/cvViewer'

type Props = {
  mode: ViewerMode
  phosphor: boolean
  page: number
  pages: number
  zoom: number
  message: string | null
  commandOpen: boolean
  onCommand: (input: string) => void
  onCloseCommand: () => void
}

/** Vim-style bottom bar: mode badge, position, and the `:` command line. */
export default function CvStatusBar({
  mode, phosphor, page, pages, zoom, message, commandOpen, onCommand, onCloseCommand,
}: Props) {
  const [input, setInput] = useState('')
  const close = () => {
    setInput('')
    onCloseCommand()
  }

  const label = mode === 'pdf' ? (phosphor ? 'PHOSPHOR' : 'NORMAL') : mode.toUpperCase()

  return (
    <div className="flex items-center h-8 px-2 gap-3 font-mono text-xs sm:text-sm bg-neutral-950 border-t border-terminal/30 select-none">
      <span className="px-2 bg-terminal text-black font-bold">{label}</span>
      {commandOpen ? (
        <form
          className="flex flex-1 items-center"
          onSubmit={(e) => {
            e.preventDefault()
            onCommand(input)
            setInput('')
          }}
        >
          <span className="text-terminal">:</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close()
            }}
            onBlur={close}
            aria-label="Viewer command"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-white outline-none caret-terminal"
          />
        </form>
      ) : (
        <span className="flex-1 truncate text-gray-400">
          {message ?? 'cv.pdf  —  press ? for keys, : for commands'}
        </span>
      )}
      <span className="text-gray-300 whitespace-nowrap">
        {page}/{pages}
        <span className="text-gray-500"> · </span>
        {zoom}%
      </span>
    </div>
  )
}
