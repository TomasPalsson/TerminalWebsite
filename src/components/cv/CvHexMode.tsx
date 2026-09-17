'use client'

import { useMemo } from 'react'
import { hexDump } from '@/utils/cvViewer'

type Props = { bytes: Uint8Array }

/** `xxd cv.pdf | head` — the first bytes of the file, because why not. */
export default function CvHexMode({ bytes }: Props) {
  const lines = useMemo(() => hexDump(bytes, 1024), [bytes])

  return (
    <div className="px-4 py-4 font-mono text-xs sm:text-sm text-gray-300 overflow-x-auto">
      <p className="text-terminal mb-3">tomas@portfolio:~$ xxd /mnt/cv/cv.pdf | head -n 64</p>
      <pre>
        {lines.map((line) => (
          <div key={line.slice(0, 8)}>
            <span className="text-gray-500">{line.slice(0, 9)}</span>
            <span className="text-terminal">{line.slice(9, 50)}</span>
            <span className="text-gray-200">{line.slice(50)}</span>
          </div>
        ))}
      </pre>
      <p className="mt-3 text-gray-500">
        {bytes.length.toLocaleString()} bytes total — showing 1,024
      </p>
    </div>
  )
}
