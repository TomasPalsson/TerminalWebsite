import { useEffect, useState } from 'react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'

export type PdfProgress = { loaded: number; total: number | null; parsing: boolean }

export type PdfState =
  | ({ status: 'loading' } & PdfProgress)
  | { status: 'error'; message: string }
  | { status: 'ready'; doc: PDFDocumentProxy; bytes: Uint8Array; text: string[] }

/** Stream the body so the loader can show real download progress. */
async function readBody(res: Response, onProgress: (loaded: number) => void): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array(await res.arrayBuffer())
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress(loaded)
  }
  const bytes = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return bytes
}

/** Load pdf.js client-side, fetch the document, and pre-extract every page's text. */
export function usePdfDocument(url: string): PdfState {
  const [state, setState] = useState<PdfState>({ status: 'loading', loaded: 0, total: null, parsing: false })

  useEffect(() => {
    let cancelled = false
    let task: PDFDocumentLoadingTask | null = null

    const load = async () => {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const total = Number(res.headers.get('content-length')) || null
      const bytes = await readBody(res, (loaded) => {
        if (!cancelled) setState({ status: 'loading', loaded, total, parsing: false })
      })
      if (cancelled) return
      setState({ status: 'loading', loaded: bytes.length, total: bytes.length, parsing: true })
      // pdf.js transfers the buffer to its worker, so hand it a copy.
      task = pdfjs.getDocument({ data: bytes.slice() })
      const doc = await task.promise
      if (cancelled) return

      const text: string[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        text.push(
          content.items
            .map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : ''))
            .join('')
            .replace(/[ \t]+\n/g, '\n')
            .trim(),
        )
      }
      if (!cancelled) setState({ status: 'ready', doc, bytes, text })
    }

    load().catch((err: unknown) => {
      if (!cancelled) setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
    })

    return () => {
      cancelled = true
      task?.destroy()
    }
  }, [url])

  return state
}
