'use client'

import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { phosphorize } from '@/utils/cvViewer'

type Props = {
  doc: PDFDocumentProxy
  pageNumber: number
  zoom: number
  phosphor: boolean
  width: number
}

/** One PDF page rendered to a canvas, fitted to `width` and scaled by `zoom`. */
export default function CvPage({ doc, pageNumber, zoom, phosphor, width }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0) return
    let task: RenderTask | null = null
    let cancelled = false

    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return
      const base = page.getViewport({ scale: 1 })
      const cssScale = (width / base.width) * (zoom / 100)
      const dpr = window.devicePixelRatio || 1
      const viewport = page.getViewport({ scale: cssScale * dpr })
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`
      task = page.render({ canvas, viewport })
      task.promise
        .then(() => {
          const ctx = canvas.getContext('2d')
          if (cancelled || !phosphor || !ctx) return
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          phosphorize(img.data)
          ctx.putImageData(img, 0, 0)
        })
        .catch(() => {
          /* cancelled renders reject; nothing to do */
        })
    })

    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, pageNumber, zoom, phosphor, width])

  return (
    <div data-page={pageNumber} className="relative">
      <canvas
        ref={canvasRef}
        aria-label={`CV page ${pageNumber}`}
        className={`block border transition ${phosphor ? 'border-terminal/40 shadow-[0_0_24px_rgba(34,197,94,0.25)]' : 'border-neutral-800'}`}
      />
      <span className="absolute top-1 right-2 font-mono text-xs text-terminal/60 select-none">
        {pageNumber}/{doc.numPages}
      </span>
    </div>
  )
}
