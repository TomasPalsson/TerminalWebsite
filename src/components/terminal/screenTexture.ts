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
