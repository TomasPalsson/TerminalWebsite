import { useEffect, useRef } from 'react'
import type { CvViewerState } from './useCvViewer'
import { ZOOM_STEP, clampZoom } from '@/utils/cvViewer'

/** less/vim-style single-key bindings for the CV viewer. */
export function useCvKeys(viewer: CvViewerState, enabled: boolean) {
  const lastKey = useRef<{ key: string; at: number }>({ key: '', at: 0 })
  const { page, pages, zoom, scrollRef, goToPage, runAction, setCommandOpen, setHelpOpen } = viewer

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return
      const el = scrollRef.current
      const prev = lastKey.current
      lastKey.current = { key: e.key, at: Date.now() }
      switch (e.key) {
        case 'j': el?.scrollBy({ top: 80 }); break
        case 'k': el?.scrollBy({ top: -80 }); break
        case 'n': case 'ArrowRight': goToPage(page + 1); break
        case 'p': case 'ArrowLeft': goToPage(page - 1); break
        case 'g': if (prev.key === 'g' && Date.now() - prev.at < 600) goToPage(1); break
        case 'G': goToPage(pages); break
        case '+': case '=': runAction({ type: 'zoom', percent: clampZoom(zoom + ZOOM_STEP) }); break
        case '-': runAction({ type: 'zoom', percent: clampZoom(zoom - ZOOM_STEP) }); break
        case '0': runAction({ type: 'zoom', percent: 100 }); break
        case 't': runAction({ type: 'phosphor' }); break
        case 'c': runAction({ type: 'mode', mode: 'text' }); break
        case 'x': runAction({ type: 'mode', mode: 'hex' }); break
        case 'v': runAction({ type: 'mode', mode: 'pdf' }); break
        case 'd': runAction({ type: 'download' }); break
        case '?': runAction({ type: 'help' }); break
        case ':': e.preventDefault(); setHelpOpen(false); setCommandOpen(true); break
        case 'Escape': setHelpOpen(false); setCommandOpen(false); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, page, pages, zoom, scrollRef, goToPage, runAction, setCommandOpen, setHelpOpen])
}
