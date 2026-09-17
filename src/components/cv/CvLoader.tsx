'use client'

import type { PdfProgress } from '@/hooks/usePdfDocument'
import { CV_URL } from '@/utils/cvViewer'

const BAR_WIDTH = 24

const kb = (n: number) => `${(n / 1024).toFixed(1)} kB`

/** curl-style download bar driven by the real fetch, then a one-liner while pdf.js parses. */
export default function CvLoader({ loaded, total, parsing }: PdfProgress) {
  const ratio = total ? Math.min(1, loaded / total) : 0
  const filled = Math.round(ratio * BAR_WIDTH)
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
  const size = total ? `${kb(loaded)} / ${kb(total)}` : kb(loaded)

  return (
    <div className="flex flex-col justify-center h-full px-4 font-mono text-sm sm:text-base text-gray-300">
      <p><span className="text-terminal">tomas@portfolio:~$</span> curl -O {CV_URL}</p>
      <p className="mt-1 tabular-nums">
        <span className="text-gray-500">[</span>
        <span className="text-terminal">{bar}</span>
        <span className="text-gray-500">]</span>
        <span className="ml-2">{Math.round(ratio * 100).toString().padStart(3)}%</span>
        <span className="ml-3 text-gray-500">{size}</span>
      </p>
      {parsing && (
        <p className="mt-3">
          <span className="text-terminal">tomas@portfolio:~$</span> less cv.pdf
          <span className="animate-cursor text-terminal">_</span>
        </p>
      )}
    </div>
  )
}
