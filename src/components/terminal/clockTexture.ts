import * as THREE from 'three'

const MONO = '"JetBrains Mono", "Courier New", monospace'

/** Hours, minutes and seconds in Reykjavík (UTC all year) */
export function reykjavikTime(date: Date): { hours: number; minutes: number; seconds: number } {
  return { hours: date.getUTCHours(), minutes: date.getUTCMinutes(), seconds: date.getUTCSeconds() }
}

/** Analog clock face with RVK badge and a red second hand */
export function paintClock(ctx: CanvasRenderingContext2D, w: number, h: number, date: Date) {
  const cx = w / 2
  const cy = h / 2
  const r = w * 0.46
  const { hours, minutes, seconds } = reykjavikTime(date)

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#f3f1ea'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const major = i % 5 === 0
    ctx.strokeStyle = major ? '#1f2937' : '#9ca3af'
    ctx.lineWidth = major ? w * 0.014 : w * 0.005
    ctx.beginPath()
    ctx.moveTo(cx + Math.sin(a) * r * (major ? 0.84 : 0.9), cy - Math.cos(a) * r * (major ? 0.84 : 0.9))
    ctx.lineTo(cx + Math.sin(a) * r * 0.95, cy - Math.cos(a) * r * 0.95)
    ctx.stroke()
  }

  ctx.fillStyle = '#22c55e'
  ctx.font = `700 ${w * 0.07}px ${MONO}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('RVK', cx, cy + r * 0.4)
  ctx.fillStyle = '#6b7280'
  ctx.font = `${w * 0.045}px ${MONO}`
  ctx.fillText('UTC±0', cx, cy + r * 0.55)

  const hand = (angle: number, length: number, width: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - Math.sin(angle) * r * 0.12, cy + Math.cos(angle) * r * 0.12)
    ctx.lineTo(cx + Math.sin(angle) * r * length, cy - Math.cos(angle) * r * length)
    ctx.stroke()
  }
  hand(((hours % 12) + minutes / 60) * (Math.PI / 6), 0.5, w * 0.03, '#111827')
  hand((minutes + seconds / 60) * (Math.PI / 30), 0.74, w * 0.02, '#111827')
  hand(seconds * (Math.PI / 30), 0.8, w * 0.008, '#dc2626')
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.arc(cx, cy, w * 0.02, 0, Math.PI * 2)
  ctx.fill()
}

/** Canvas texture that can be repainted with the current time */
export class ClockSurface {
  readonly texture: THREE.CanvasTexture
  private readonly ctx: CanvasRenderingContext2D
  private readonly size: number

  constructor(size = 512) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    this.size = size
    this.ctx = canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.tick(new Date())
  }

  tick(date: Date) {
    paintClock(this.ctx, this.size, this.size, date)
    this.texture.needsUpdate = true
  }
}
