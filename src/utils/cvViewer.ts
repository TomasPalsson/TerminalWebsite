export const CV_URL = 'https://api.tomasari.is/cv'

export type ViewerMode = 'pdf' | 'text' | 'hex'

export type ViewerAction =
  | { type: 'goto'; page: number }
  | { type: 'zoom'; percent: number }
  | { type: 'mode'; mode: ViewerMode }
  | { type: 'phosphor' }
  | { type: 'download' }
  | { type: 'help' }
  | { type: 'quit' }
  | { type: 'unknown'; input: string }

export const ZOOM_MIN = 50
export const ZOOM_MAX = 300
export const ZOOM_STEP = 25

export const clampZoom = (percent: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(percent)))

/** Parse a vim-style `:` command (leading colon optional). */
export function parseViewerCommand(raw: string): ViewerAction {
  const input = raw.trim().replace(/^:/, '')
  const [cmd, arg] = input.split(/\s+/)
  if (/^\d+$/.test(cmd)) return { type: 'goto', page: Number(cmd) }
  switch (cmd) {
    case 'z':
    case 'zoom':
      if (arg && /^\d+$/.test(arg)) return { type: 'zoom', percent: clampZoom(Number(arg)) }
      return { type: 'unknown', input }
    case 'pdf':
    case 'text':
    case 'hex':
      return { type: 'mode', mode: cmd }
    case 'cat':
      return { type: 'mode', mode: 'text' }
    case 'xxd':
    case 'hexdump':
      return { type: 'mode', mode: 'hex' }
    case 'phosphor':
    case 'crt':
      return { type: 'phosphor' }
    case 'w':
    case 'download':
    case 'save':
      return { type: 'download' }
    case 'h':
    case 'help':
      return { type: 'help' }
    case 'q':
    case 'quit':
    case 'exit':
      return { type: 'quit' }
    default:
      return { type: 'unknown', input }
  }
}

// Terminal green #22c55e, scaled by inverted luminance so ink glows on black.
const PHOSPHOR = [34, 197, 94] as const

/** Remap RGBA pixels in place to green-on-black CRT phosphor. */
export function phosphorize(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
    const glow = 1 - lum
    data[i] = PHOSPHOR[0] * glow
    data[i + 1] = PHOSPHOR[1] * glow
    data[i + 2] = PHOSPHOR[2] * glow
    data[i + 3] = 255
  }
}

/** Format bytes like `xxd`: offset, 16 hex bytes in pairs, ASCII gutter. */
export function hexDump(bytes: Uint8Array, limit = 512): string[] {
  const lines: string[] = []
  const end = Math.min(bytes.length, limit)
  for (let offset = 0; offset < end; offset += 16) {
    const row = bytes.subarray(offset, Math.min(offset + 16, end))
    const hex: string[] = []
    for (let i = 0; i < 16; i += 2) {
      const a = row[i] === undefined ? '  ' : row[i].toString(16).padStart(2, '0')
      const b = row[i + 1] === undefined ? '  ' : row[i + 1].toString(16).padStart(2, '0')
      hex.push(a + b)
    }
    const ascii = Array.from(row, (b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.')).join('')
    lines.push(`${offset.toString(16).padStart(8, '0')}: ${hex.join(' ')}  ${ascii}`)
  }
  return lines
}
