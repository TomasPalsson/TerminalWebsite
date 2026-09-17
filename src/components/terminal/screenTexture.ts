/**
 * Pure 2D-canvas painter for the CRT screen texture. No three.js here so it can be unit-tested.
 */

export const SCREEN = {
  width: 1024,
  height: 768,
  margin: 40,
  fontSize: 26,
  lineHeight: 38,
  font: '"JetBrains Mono", "Courier New", monospace',
} as const

/** Phosphor palette: raster background when powered, dead glass when off */
export const SCREEN_BG_ON = '#04130b'
export const SCREEN_BG_OFF = '#050705'

/** The site's default accent reads dull on a CRT; nudge it toward phosphor green */
export const phosphorColor = (cssColor: string) => (cssColor === '#22c55e' ? '#39ff6e' : cssColor)

const hexToRgb = (hex: string): [number, number, number] | null => {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')

/** Scales a hex colour toward black (k<1) or white (k>1 mixes toward white by k-1) */
export function shade(hex: string, k: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  if (k <= 1) return rgbToHex(rgb[0] * k, rgb[1] * k, rgb[2] * k)
  const t = Math.min(1, k - 1)
  return rgbToHex(rgb[0] + (255 - rgb[0]) * t, rgb[1] + (255 - rgb[1]) * t, rgb[2] + (255 - rgb[2]) * t)
}

/** Unlit raster tint for the current phosphor colour */
export const screenBackground = (color: string) => shade(color, 0.075)

export type LineKind = 'prompt' | 'output' | 'error' | 'heading'

const ERROR_RE = /not found|nothing called|failed|error|unknown|expected|missing|no such|cannot|invalid|permission denied/i

/** Rough syntax colouring for the buffer: what the shell typed, what went wrong, section headers */
export function classifyLine(text: string): LineKind {
  if (text.startsWith('$ ')) return 'prompt'
  if (ERROR_RE.test(text)) return 'error'
  // "Usage:" style labels, or a lone capitalised word such as a category name
  if (/^[^\s].{0,40}:$/.test(text) || /^[A-Z][A-Za-z]{1,13}$/.test(text)) return 'heading'
  return 'output'
}

/** Ink colour per line kind, derived from the phosphor colour */
export function inkFor(kind: LineKind, color: string): string {
  switch (kind) {
    case 'prompt':
      return shade(color, 1.35)
    case 'error':
      return '#ff7b72'
    case 'heading':
      return shade(color, 1.6)
    default:
      return color
  }
}

export type WrappedRow = { text: string; kind: LineKind }

/** Hard-wraps each line to `cols` characters (breaking at the last space); every row keeps its source line's kind */
export function wrapRows(lines: string[], cols: number): WrappedRow[] {
  const out: WrappedRow[] = []
  const width = Math.max(1, cols)
  lines.forEach((line) => {
    const kind = classifyLine(line)
    let rest = line
    while (rest.length > width) {
      const cut = rest.lastIndexOf(' ', width)
      const at = cut > 0 ? cut : width
      out.push({ text: rest.slice(0, at), kind })
      rest = rest.slice(at).replace(/^ /, '')
    }
    out.push({ text: rest, kind })
  })
  return out
}

/** Hard-wraps each line to `cols` characters, breaking at the last space when there is one */
export const wrapLines = (lines: string[], cols: number): string[] => wrapRows(lines, cols).map((r) => r.text)

export type DrawScreenOptions = {
  ctx: CanvasRenderingContext2D
  lines: string[]
  color: string
  cursorVisible: boolean
  power: boolean
}

/** Paints the terminal buffer (scrolled to the bottom), block cursor, scanlines and vignette */
export function drawScreen({ ctx, lines, color, cursorVisible, power }: DrawScreenOptions) {
  const { width, height, margin, fontSize, lineHeight, font } = SCREEN

  ctx.save()
  ctx.shadowBlur = 0
  ctx.fillStyle = power ? screenBackground(color) : SCREEN_BG_OFF
  ctx.fillRect(0, 0, width, height)

  if (power) {
    ctx.font = `${fontSize}px ${font}`
    ctx.textBaseline = 'top'
    const charWidth = ctx.measureText('M').width || fontSize * 0.6
    const cols = Math.floor((width - margin * 2) / charWidth)
    const maxRows = Math.floor((height - margin * 2) / lineHeight)

    const visible = wrapRows(lines, cols).slice(-maxRows)

    ctx.shadowBlur = 12
    visible.forEach(({ text, kind }, row) => {
      const ink = inkFor(kind, color)
      ctx.fillStyle = ink
      ctx.shadowColor = ink
      if (kind === 'prompt') {
        // Dim prompt glyph, bright command
        ctx.fillStyle = shade(color, 0.7)
        ctx.fillText('$', margin, margin + row * lineHeight)
        ctx.fillStyle = ink
        ctx.fillText(text.slice(1), margin + charWidth, margin + row * lineHeight)
      } else {
        ctx.fillText(text, margin, margin + row * lineHeight)
      }
    })

    ctx.fillStyle = shade(color, 1.35)
    if (cursorVisible && visible.length > 0) {
      const last = visible[visible.length - 1].text
      const x = margin + last.length * charWidth
      const y = margin + (visible.length - 1) * lineHeight
      ctx.fillRect(x + 2, y + 2, charWidth - 2, lineHeight - 8)
    }
    ctx.shadowBlur = 0

    // Scanlines: every third raster row is darkened
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
    for (let y = 0; y < height; y += 3) ctx.fillRect(0, y, width, 1)
  }

  // Vignette so the tube looks curved even though the mesh is flat
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.72)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}


/* ---------- Screensavers ---------- */

const MATRIX_GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEFXYZ<>/\\=+*#'
const MATRIX_CELL = 22

export type MatrixState = { heads: number[]; speeds: number[]; started: boolean }

export const createMatrixState = (random = Math.random): MatrixState => {
  const cols = Math.ceil(SCREEN.width / MATRIX_CELL)
  return {
    heads: Array.from({ length: cols }, () => -random() * 40),
    speeds: Array.from({ length: cols }, () => 0.4 + random() * 0.9),
    started: false,
  }
}

/** One frame of digital rain: fade the previous frame, then advance every column head */
export function drawMatrixFrame(ctx: CanvasRenderingContext2D, state: MatrixState, color: string, random = Math.random) {
  const { width, height } = SCREEN
  if (!state.started) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    state.started = true
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.fillRect(0, 0, width, height)
  ctx.font = `${MATRIX_CELL - 2}px ${SCREEN.font}`
  ctx.textBaseline = 'top'
  state.heads.forEach((head, col) => {
    const y = Math.floor(head) * MATRIX_CELL
    if (y >= 0 && y < height) {
      const glyph = MATRIX_GLYPHS[Math.floor(random() * MATRIX_GLYPHS.length)]
      ctx.fillStyle = '#eafff0'
      ctx.fillText(glyph, col * MATRIX_CELL, y)
      ctx.fillStyle = color
      ctx.fillText(MATRIX_GLYPHS[Math.floor(random() * MATRIX_GLYPHS.length)], col * MATRIX_CELL, y - MATRIX_CELL)
    }
    state.heads[col] = head + state.speeds[col]
    if (y > height + random() * 600) {
      state.heads[col] = -random() * 20
      state.speeds[col] = 0.4 + random() * 0.9
    }
  })
}

export type DvdState = { x: number; y: number; vx: number; vy: number; hue: number }

const DVD_W = 260
const DVD_H = 120

export const createDvdState = (): DvdState => ({ x: 120, y: 200, vx: 3.2, vy: 2.4, hue: 140 })

/** Bouncing logo; changes colour on every wall hit like the real thing */
export function drawDvdFrame(ctx: CanvasRenderingContext2D, state: DvdState, label = 'tomasari.is') {
  const { width, height } = SCREEN
  state.x += state.vx
  state.y += state.vy
  let bounced = false
  if (state.x <= 0 || state.x + DVD_W >= width) {
    state.vx *= -1
    state.x = Math.max(0, Math.min(width - DVD_W, state.x))
    bounced = true
  }
  if (state.y <= 0 || state.y + DVD_H >= height) {
    state.vy *= -1
    state.y = Math.max(0, Math.min(height - DVD_H, state.y))
    bounced = true
  }
  if (bounced) state.hue = (state.hue + 67) % 360

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  const color = `hsl(${state.hue} 90% 60%)`
  ctx.strokeStyle = color
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(state.x + 3, state.y + 3, DVD_W - 6, DVD_H - 6, 24)
  ctx.stroke()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 40px ${SCREEN.font}`
  ctx.fillText(label, state.x + DVD_W / 2, state.y + DVD_H / 2 - 12)
  ctx.font = `18px ${SCREEN.font}`
  ctx.fillText('· TERMINAL ·', state.x + DVD_W / 2, state.y + DVD_H / 2 + 28)
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  for (let y = 0; y < height; y += 3) ctx.fillRect(0, y, width, 1)
}
