'use client'

import { useEffect, useState } from 'react'

/** Status lines "generated" while the profile JSON loads. The last one repeats. */
const LINES = [
  'Fetching profile data…',
  'Reading experience…',
  'Indexing projects…',
  'Compiling certifications…',
  'Formatting output…',
]

const CHAR_DELAY_MS = 28
const LINE_PAUSE_MS = 350

/** AI-style streaming placeholder shown while the profile loads. */
export function ProfileLoader() {
  const [done, setDone] = useState<string[]>([])
  const [lineIndex, setLineIndex] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const line = LINES[Math.min(lineIndex, LINES.length - 1)]
    let charIndex = 0
    let pauseTimer: ReturnType<typeof setTimeout> | undefined

    const typeInterval = setInterval(() => {
      charIndex += 1
      setTyped(line.slice(0, charIndex))
      if (charIndex < line.length) return

      clearInterval(typeInterval)
      pauseTimer = setTimeout(() => {
        setDone((prev) => [...prev, line])
        setTyped('')
        setLineIndex((prev) => prev + 1)
      }, LINE_PAUSE_MS)
    }, CHAR_DELAY_MS)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(pauseTimer)
    }
  }, [lineIndex])

  return (
    <div className="font-mono text-sm space-y-1" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-terminal">
        <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
        generating profile
      </p>
      {done.map((line, i) => (
        <p key={i} className="text-gray-600">
          {line}
        </p>
      ))}
      <p className="text-gray-300">
        {typed}
        <span className="text-terminal animate-cursor">▍</span>
      </p>
    </div>
  )
}
