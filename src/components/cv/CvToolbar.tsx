'use client'

import { ChevronLeft, ChevronRight, Minus, Plus, Download, Tv, FileText, Binary, Eye } from 'lucide-react'
import type { CvViewerState } from '@/hooks/useCvViewer'
import { ZOOM_STEP, clampZoom } from '@/utils/cvViewer'

const base =
  'inline-flex items-center gap-1 px-2 py-1 font-mono text-xs sm:text-sm transition rounded-sm hover:bg-terminal hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-terminal'
const btn = `${base} text-terminal`
const toggle = (on: boolean) => `${base} ${on ? 'bg-terminal text-black' : 'text-terminal'}`

type Props = { viewer: CvViewerState }

/** Click targets for every key binding, so touch users get the same toys. */
export default function CvToolbar({ viewer }: Props) {
  const { mode, phosphor, zoom, page, pages, goToPage, runAction } = viewer
  const zoomBy = (delta: number) => runAction({ type: 'zoom', percent: clampZoom(zoom + delta) })

  return (
    <header className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-terminal/30 bg-neutral-950 font-mono text-sm">
      <span className="px-2 text-terminal">~/cv.pdf</span>
      <div className="flex-1" />
      <button className={btn} onClick={() => goToPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={14} /></button>
      <button className={btn} onClick={() => goToPage(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight size={14} /></button>
      <button className={btn} onClick={() => zoomBy(-ZOOM_STEP)} aria-label="Zoom out"><Minus size={14} /></button>
      <button className={btn} onClick={() => zoomBy(ZOOM_STEP)} aria-label="Zoom in"><Plus size={14} /></button>
      <button className={toggle(phosphor && mode === 'pdf')} onClick={() => runAction({ type: 'phosphor' })} title="phosphor mode (t)">
        <Tv size={14} /><span className="hidden sm:inline">crt</span>
      </button>
      <button className={toggle(mode === 'text')} onClick={() => runAction({ type: 'mode', mode: 'text' })} title="cat mode (c)">
        <FileText size={14} /><span className="hidden sm:inline">cat</span>
      </button>
      <button className={toggle(mode === 'hex')} onClick={() => runAction({ type: 'mode', mode: 'hex' })} title="hex mode (x)">
        <Binary size={14} /><span className="hidden sm:inline">xxd</span>
      </button>
      {mode !== 'pdf' && (
        <button className={btn} onClick={() => runAction({ type: 'mode', mode: 'pdf' })} title="back to pdf (v)">
          <Eye size={14} /><span className="hidden sm:inline">pdf</span>
        </button>
      )}
      <button className={btn} onClick={() => runAction({ type: 'download' })} title="download (d)">
        <Download size={14} /><span className="hidden sm:inline">save</span>
      </button>
    </header>
  )
}
