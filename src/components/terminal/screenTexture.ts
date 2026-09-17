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

/** Hard-wraps each line to `cols` characters, breaking at the last space when there is one */
export function wrapLines(lines: string[], cols: number): string[] {
  const out: string[] = []
  const width = Math.max(1, cols)
  lines.forEach((line) => {
    let rest = line
    while (rest.length > width) {
      const cut = rest.lastIndexOf(' ', width)
      const at = cut > 0 ? cut : width
      out.push(rest.slice(0, at))
      rest = rest.slice(at).replace(/^ /, '')
    }
    out.push(rest)
  })
  return out
}

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
  ctx.fillStyle = power ? SCREEN_BG_ON : SCREEN_BG_OFF
  ctx.fillRect(0, 0, width, height)

  if (power) {
    ctx.font = `${fontSize}px ${font}`
    ctx.textBaseline = 'top'
    const charWidth = ctx.measureText('M').width || fontSize * 0.6
    const cols = Math.floor((width - margin * 2) / charWidth)
    const maxRows = Math.floor((height - margin * 2) / lineHeight)

    const wrapped = wrapLines(lines, cols)
    const visible = wrapped.slice(-maxRows)

    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 12
    visible.forEach((text, row) => {
      ctx.fillText(text, margin, margin + row * lineHeight)
    })

    if (cursorVisible && visible.length > 0) {
      const last = visible[visible.length - 1]
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
