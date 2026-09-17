import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CvViewer from './CvViewer'

vi.mock('pdfjs-dist', () => {
  const page = {
    getTextContent: async () => ({
      items: [
        { str: 'Tómas Ari', hasEOL: true },
        { str: 'Software Engineer', hasEOL: false },
      ],
    }),
    getViewport: () => ({ width: 595, height: 842 }),
    render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
  }
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: () => ({
      promise: Promise.resolve({ numPages: 2, getPage: async () => page }),
      destroy: vi.fn(),
    }),
  }
})

const PDF_BYTES = new TextEncoder().encode('%PDF-1.7 fake')

/** The `page/pages · zoom%` readout in the status bar (split across text nodes). */
const position = () =>
  screen.getByText((_, el) => el?.tagName === 'SPAN' && /^\d+\/\d+ · \d+%$/.test(el.textContent ?? '')).textContent

describe('CvViewer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(PDF_BYTES, { status: 200 })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const openViewer = async () => {
    render(<CvViewer />)
    await waitFor(() => expect(screen.getByText('~/cv.pdf')).toBeInTheDocument())
  }

  it('fetches the cv from the api and shows download progress while loading', async () => {
    render(<CvViewer />)
    expect(screen.getByText(/curl -O https:\/\/api\.tomasari\.is\/cv/)).toBeInTheDocument()
    expect(screen.getByText(/%$/)).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('https://api.tomasari.is/cv'))
    await waitFor(() => expect(screen.getByText('~/cv.pdf')).toBeInTheDocument())
    expect(screen.queryByText(/curl -O/)).not.toBeInTheDocument()
  })

  it('shows the toolbar and status bar with page count', async () => {
    await openViewer()
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
    expect(position()).toBe('1/2 · 100%')
  })

  it('switches modes with single keys', async () => {
    await openViewer()
    fireEvent.keyDown(window, { key: 'c' })
    expect(screen.getByText(/cat \/mnt\/cv\/cv.pdf/)).toBeInTheDocument()
    expect(screen.getByText('TEXT')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'x' })
    expect(screen.getByText(/xxd \/mnt\/cv\/cv.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/2550 4446/)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 't' })
    expect(screen.getByText('PHOSPHOR')).toBeInTheDocument()
  })

  it('runs : commands and reports unknown ones vim-style', async () => {
    await openViewer()
    fireEvent.keyDown(window, { key: ':' })
    const input = screen.getByLabelText('Viewer command')
    fireEvent.change(input, { target: { value: 'zoom 150' } })
    fireEvent.submit(input.closest('form')!)
    expect(position()).toBe('1/2 · 150%')

    fireEvent.keyDown(window, { key: ':' })
    const again = screen.getByLabelText('Viewer command')
    fireEvent.change(again, { target: { value: 'frobnicate' } })
    fireEvent.submit(again.closest('form')!)
    expect(screen.getByText(/E492: Not an editor command: frobnicate/)).toBeInTheDocument()
  })

  it('toggles the help overlay with ?', async () => {
    await openViewer()
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an error state when the pdf cannot be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404, statusText: 'Not Found' })))
    render(<CvViewer />)
    await waitFor(() => expect(screen.getByText(/cv.pdf: 404 Not Found/)).toBeInTheDocument())
  })
})
