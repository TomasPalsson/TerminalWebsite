'use client'

import { useEffect, useState } from 'react'

type Props = { pages: string[] }

/** `cat cv.pdf` — the extracted text typed out like a terminal dump. */
export default function CvTextMode({ pages }: Props) {
  const full = pages.map((p, i) => `--- page ${i + 1} ---\n${p}`).join('\n\n')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= full.length) return
    // Type in bursts so a two-page CV finishes in a few seconds.
    const t = setTimeout(() => setCount((n) => Math.min(full.length, n + 6)), 8)
    return () => clearTimeout(t)
  }, [count, full])

  return (
    <div className="px-4 py-4 font-mono text-sm text-gray-200 max-w-3xl mx-auto">
      <p className="text-terminal mb-3">tomas@portfolio:~$ cat /mnt/cv/cv.pdf</p>
      <pre className="whitespace-pre-wrap break-words">
        {full.slice(0, count)}
        {count < full.length && <span className="animate-cursor text-terminal">▌</span>}
      </pre>
    </div>
  )
}
