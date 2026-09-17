import * as THREE from 'three'
import type { Exhibit } from './exhibits'

export type Painter = (ctx: CanvasRenderingContext2D, width: number, height: number) => void

const MONO = '"JetBrains Mono", "Courier New", monospace'
const HAND = '"Winky Sans", "Comic Sans MS", cursive'
const GREEN = '#22c55e'

/** Wraps `text` to `maxWidth` using the context's current font */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  })
  if (line) lines.push(line)
  return lines
}

/** Draws wrapped lines from (x, y) and returns the next free y */
function paragraph(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = Infinity) {
  const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines)
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

/** Rounded pill with a label; returns the pill's right edge */
function pill(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, height: number) {
  const padX = height * 0.5
  const width = ctx.measureText(label).width + padX * 2
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, height / 2)
  ctx.fillStyle = 'rgba(34, 197, 94, 0.14)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = GREEN
  ctx.fillText(label, x + padX, y + height * 0.68)
  return x + width
}

/** Terminal-styled project poster: title, tagline, bullets, stack pills */
export const paintPoster =
  (exhibit: Exhibit): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = '#0a0d0b'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)'
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, w - 28, h - 28)

    const pad = w * 0.08
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = GREEN
    ctx.font = `700 ${w * 0.075}px ${MONO}`
    let y = paragraph(ctx, exhibit.title.toUpperCase(), pad, pad + w * 0.075, w - pad * 2, w * 0.09, 2)

    if (exhibit.subtitle) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = `${w * 0.042}px ${MONO}`
      y = paragraph(ctx, exhibit.subtitle, pad, y + w * 0.01, w - pad * 2, w * 0.055, 2)
    }

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pad, y + w * 0.02)
    ctx.lineTo(w - pad, y + w * 0.02)
    ctx.stroke()
    y += w * 0.09

    ctx.fillStyle = '#d1d5db'
    ctx.font = `${w * 0.04}px ${MONO}`
    exhibit.lines.forEach((line) => {
      if (y > h - w * 0.3) return
      ctx.fillStyle = GREEN
      ctx.fillText('›', pad, y)
      ctx.fillStyle = '#d1d5db'
      y = paragraph(ctx, line, pad + w * 0.05, y, w - pad * 2 - w * 0.05, w * 0.052, 4) + w * 0.03
    })

    if (exhibit.tags?.length) {
      ctx.font = `${w * 0.036}px ${MONO}`
      let x = pad
      const py = h - pad - w * 0.075
      exhibit.tags.forEach((tag) => {
        const width = ctx.measureText(tag).width + w * 0.075
        if (x + width > w - pad) return
        x = pill(ctx, tag, x, py, w * 0.075) + w * 0.02
      })
    }
  }

/** Whiteboard with a hand-drawn timeline of jobs and schools */
export const paintBoard =
  (exhibit: Exhibit): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = '#e8ebe6'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#b8bcb5'
    ctx.lineWidth = 10
    ctx.strokeRect(5, 5, w - 10, h - 10)

    const pad = w * 0.06
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#1f2937'
    ctx.font = `700 ${w * 0.055}px ${HAND}`
    ctx.fillText(exhibit.title, pad, pad + w * 0.05)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(pad, pad + w * 0.075)
    ctx.lineTo(pad + ctx.measureText(exhibit.title).width, pad + w * 0.08)
    ctx.stroke()

    // Timeline spine with a dot per entry
    const x0 = pad + w * 0.03
    let y = pad + w * 0.15
    ctx.font = `${w * 0.03}px ${HAND}`
    exhibit.lines.forEach((line, i) => {
      if (y > h - pad) return
      const [when, what] = line.split(' — ')
      ctx.fillStyle = i % 2 ? '#dc2626' : '#2563eb'
      ctx.beginPath()
      ctx.arc(x0, y - w * 0.01, w * 0.011, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#4b5563'
      ctx.fillText(when, x0 + w * 0.04, y)
      ctx.fillStyle = '#111827'
      y = paragraph(ctx, what ?? '', x0 + w * 0.04, y + w * 0.038, w - x0 - pad - w * 0.04, w * 0.038, 2) + w * 0.022
    })
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x0, pad + w * 0.13)
    ctx.lineTo(x0, Math.min(y, h - pad) - w * 0.02)
    ctx.stroke()
  }

/** Glowing neon name sign; painted bright so bloom picks it up */
export const paintSign =
  (exhibit: Exhibit): Painter =>
  (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#4ade80'
    ctx.shadowBlur = w * 0.02
    ctx.fillStyle = '#c8ffd9'
    ctx.font = `700 ${h * 0.4}px ${MONO}`
    ctx.fillText(exhibit.title, w / 2, h * 0.38)
    ctx.shadowBlur = w * 0.012
    ctx.fillStyle = '#86efac'
    ctx.font = `${h * 0.2}px ${MONO}`
    ctx.fillText(exhibit.subtitle ?? '', w / 2, h * 0.76)
  }

const CARD_COLORS = ['#fde68a', '#fca5a5', '#a5f3fc', '#bbf7d0']

/** What fits on a post-it: "@handle" for GitHub/LinkedIn, otherwise the bare host/path, clipped */
export function shortLink(href: string, max = 20): string {
  const bare = href.replace(/^(https?:\/\/|mailto:)/, '').replace(/^www\./, '').replace(/\/$/, '')
  const gh = bare.match(/^github\.com\/([^/]+)/)
  if (gh) return `@${gh[1]}`
  const li = bare.match(/^linkedin\.com\/in\/([^/]+)/)
  if (li) return `in/${decodeURIComponent(li[1]).split('-')[0]}`
  return bare.length > max ? bare.slice(0, max - 1) + '…' : bare
}

/** Corkboard with a pinned card per contact link */
export const paintCorkboard =
  (exhibit: Exhibit): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = '#8b5e3c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)'
      ctx.fillRect((i * 97) % w, (i * 57) % h, 3, 3)
    }
    ctx.strokeStyle = '#3f2a1a'
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, w - 14, h - 14)

    ctx.textBaseline = 'alphabetic'
    const links = exhibit.links ?? []
    const cardW = w * 0.42
    const cardH = h * 0.34
    links.slice(0, 4).forEach((link, i) => {
      const x = w * 0.06 + (i % 2) * (w * 0.46)
      const y = h * 0.1 + Math.floor(i / 2) * (h * 0.44)
      ctx.save()
      ctx.translate(x + cardW / 2, y + cardH / 2)
      ctx.rotate(((i * 37) % 7 - 3) * 0.03)
      ctx.fillStyle = CARD_COLORS[i % CARD_COLORS.length]
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH)
      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.arc(0, -cardH / 2 + h * 0.03, h * 0.02, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1f2937'
      ctx.font = `700 ${h * 0.075}px ${HAND}`
      ctx.textAlign = 'center'
      ctx.fillText(link.label, 0, h * 0.02)
      ctx.font = `${h * 0.036}px ${MONO}`
      ctx.fillStyle = '#374151'
      ctx.fillText(shortLink(link.href), 0, h * 0.1)
      ctx.restore()
    })
  }

/** Book spine: vertical title on a coloured cloth cover */
export const paintSpine =
  (label: string, color: string): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(0, 0, w, h * 0.03)
    ctx.fillRect(0, h * 0.97, w, h * 0.03)
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f5f5f4'
    ctx.font = `700 ${w * 0.5}px ${MONO}`
    let text = label
    while (ctx.measureText(text).width > h * 0.86 && text.length > 3) text = text.slice(0, -2) + '…'
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }

/** Canvas-backed texture that can be repainted (e.g. once web fonts arrive) */
export class PaintedSurface {
  readonly texture: THREE.CanvasTexture
  private readonly ctx: CanvasRenderingContext2D
  private readonly width: number
  private readonly height: number

  constructor(width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.width = width
    this.height = height
    this.ctx = canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4
  }

  paint(painter: Painter) {
    painter(this.ctx, this.width, this.height)
    this.texture.needsUpdate = true
  }
}

/** Paints onto a fresh canvas and wraps it as an sRGB three texture */
export function makeCanvasTexture(width: number, height: number, paint: Painter): THREE.CanvasTexture {
  const surface = new PaintedSurface(width, height)
  surface.paint(paint)
  return surface.texture
}

/** Calls `onReady` when the document's web fonts have finished loading; returns an unsubscribe */
export function whenFontsReady(onReady: () => void): () => void {
  let live = true
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => {
      if (live) onReady()
    })
  }
  return () => {
    live = false
  }
}
