import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ViewerAction, ViewerMode } from '@/utils/cvViewer'

export const CV_DOWNLOAD_NAME = 'Tomas_Ari_Palsson_CV.pdf'

/** The API serves the pdf inline and cross-origin, so save the bytes we already have. */
function downloadCv(bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([bytes.slice()], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = CV_DOWNLOAD_NAME
  a.click()
  URL.revokeObjectURL(url)
}

/** The page whose top edge sits closest to the scroll container's top. */
function nearestPage(el: HTMLElement): number {
  const top = el.getBoundingClientRect().top
  let best = 1
  let bestDist = Infinity
  el.querySelectorAll<HTMLElement>('[data-page]').forEach((node) => {
    const dist = Math.abs(node.getBoundingClientRect().top - top)
    if (dist < bestDist) {
      bestDist = dist
      best = Number(node.dataset.page)
    }
  })
  return best
}

export type CvViewerState = ReturnType<typeof useCvViewer>

/** All viewer state plus the single `runAction` dispatcher keys, buttons and `:` commands share. */
export function useCvViewer(pages: number, bytes?: Uint8Array) {
  const router = useRouter()
  const [mode, setMode] = useState<ViewerMode>('pdf')
  const [phosphor, setPhosphor] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [page, setPage] = useState(1)
  const [commandOpen, setCommandOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2500)
    return () => clearTimeout(t)
  }, [message])

  const goToPage = useCallback((n: number) => {
    if (pages === 0) return
    const target = Math.min(pages, Math.max(1, n))
    setMode('pdf')
    scrollRef.current
      ?.querySelector<HTMLElement>(`[data-page="${target}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [pages])

  const runAction = useCallback((action: ViewerAction) => {
    switch (action.type) {
      case 'goto': goToPage(action.page); break
      case 'zoom': setZoom(action.percent); setMode('pdf'); break
      case 'mode': setMode(action.mode); break
      case 'phosphor': setPhosphor((p) => !p); setMode('pdf'); break
      case 'download':
        if (bytes) { downloadCv(bytes); setMessage(`"${CV_DOWNLOAD_NAME}" written`) }
        break
      case 'help': setHelpOpen((h) => !h); break
      case 'quit': router.push('/'); break
      case 'unknown': setMessage(`E492: Not an editor command: ${action.input}`); break
    }
  }, [goToPage, router, bytes])

  const onScroll = useCallback(() => {
    if (scrollRef.current) setPage(nearestPage(scrollRef.current))
  }, [])

  return {
    mode, phosphor, zoom, page, pages, commandOpen, helpOpen, message, scrollRef,
    goToPage, runAction, onScroll, setCommandOpen, setHelpOpen,
  }
}
