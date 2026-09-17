'use client'

import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { CvViewerState } from '@/hooks/useCvViewer'
import CvPage from './CvPage'
import CvTextMode from './CvTextMode'
import CvHexMode from './CvHexMode'
import CvHelp from './CvHelp'

const PAGE_MAX_WIDTH = 800

type Props = {
  viewer: CvViewerState
  doc: PDFDocumentProxy
  bytes: Uint8Array
  text: string[]
}

/** Scrollable body: rendered pages, or the cat/xxd modes, plus the CRT scanline overlay. */
export default function CvDocument({ viewer, doc, bytes, text }: Props) {
  const { mode, phosphor, zoom, pages, helpOpen, scrollRef, onScroll, setHelpOpen } = viewer
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // ResizeObserver fires once on observe, so this also does the initial measure.
    const ro = new ResizeObserver(() => setWidth(Math.min(PAGE_MAX_WIDTH, el.clientWidth - 32)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [scrollRef])

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-auto">
        {mode === 'pdf' && (
          <div className="flex flex-col items-center gap-4 px-4 py-4 min-w-fit">
            {Array.from({ length: pages }, (_, i) => (
              <CvPage key={i + 1} doc={doc} pageNumber={i + 1} zoom={zoom} phosphor={phosphor} width={width} />
            ))}
          </div>
        )}
        {mode === 'text' && <CvTextMode pages={text} />}
        {mode === 'hex' && <CvHexMode bytes={bytes} />}
      </div>
      {phosphor && mode === 'pdf' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_3px)]"
        />
      )}
      {helpOpen && <CvHelp onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
