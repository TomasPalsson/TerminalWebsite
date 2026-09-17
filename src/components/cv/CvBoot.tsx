'use client'

import { useEffect, useState } from 'react'
import { BOOT_LINES } from '@/utils/cvViewer'

type Props = { onDone: () => void }

/** Fake boot log typed out line by line; any key or click skips it. */
export default function CvBoot({ onDone }: Props) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (shown >= BOOT_LINES.length) {
      const t = setTimeout(onDone, 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 200 : 260)
    return () => clearTimeout(t)
  }, [shown, onDone])

  useEffect(() => {
    window.addEventListener('keydown', onDone)
    return () => window.removeEventListener('keydown', onDone)
  }, [onDone])

  return (
    <div
      onClick={onDone}
      className="flex flex-col justify-center h-full px-4 font-mono text-sm sm:text-base text-gray-300 cursor-pointer"
    >
      {BOOT_LINES.slice(0, shown).map((line) => (
        <p key={line} className={line.startsWith('[') ? 'text-terminal' : ''}>
          {line}
        </p>
      ))}
      <span className="animate-cursor text-terminal">_</span>
      <p className="mt-4 text-xs text-gray-500">press any key to skip</p>
    </div>
  )
}
