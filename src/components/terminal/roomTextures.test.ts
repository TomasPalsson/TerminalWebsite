import { describe, it, expect, vi } from 'vitest'
import { wrapText, paintPoster, paintBoard, paintSign, paintCorkboard, paintSpine } from './roomTextures'
import { paintClock, reykjavikTime } from './clockTexture'
import type { Exhibit } from './exhibits'

/** 2D context stub with a monospace-ish measureText; records painted text */
const makeCtx = () => {
  const ctx = {
    fillStyle: '' as string | object,
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    texts: [] as string[],
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText(text: string) {
      this.texts.push(text)
    },
  }
  return ctx as unknown as CanvasRenderingContext2D & typeof ctx
}

const exhibit: Exhibit = {
  id: 'project-x',
  kind: 'poster',
  title: 'Terminal Portfolio',
  subtitle: 'tomasari.is',
  lines: ['Personal site with a 3D terminal and a chat agent.'],
  tags: ['React', 'Three.js'],
  links: [
    { label: 'GitHub', href: 'https://github.com/x/y' },
    { label: 'Email', href: 'mailto:me@example.com' },
  ],
  position: [0, 0, 0],
  rotationY: 0,
  size: [0.7, 0.95],
}

describe('wrapText', () => {
  it('wraps on word boundaries by measured width', () => {
    const ctx = makeCtx()
    expect(wrapText(ctx, 'one two three four', 80)).toEqual(['one two', 'three four'])
  })

  it('keeps an over-long single word on its own line', () => {
    const ctx = makeCtx()
    expect(wrapText(ctx, 'supercalifragilistic ok', 40)).toEqual(['supercalifragilistic', 'ok'])
  })
})

describe('painters', () => {
  it('poster paints title, subtitle, bullets and tags', () => {
    const ctx = makeCtx()
    paintPoster(exhibit)(ctx, 512, 695)
    expect(ctx.texts).toContain('TERMINAL PORTFOLIO')
    expect(ctx.texts).toContain('tomasari.is')
    expect(ctx.texts).toContain('React')
    expect(ctx.texts).toContain('Three.js')
    expect(ctx.texts.some((t) => t.startsWith('Personal site'))).toBe(true)
  })

  it('board paints each timeline entry as date + description', () => {
    const ctx = makeCtx()
    paintBoard({ ...exhibit, kind: 'board', lines: ['2023 - 2026 — BSc, RU', 'Dec 2025 - Present — Engineer @ Apró'] })(ctx, 768, 474)
    expect(ctx.texts).toContain('2023 - 2026')
    expect(ctx.texts).toContain('Dec 2025 - Present')
    expect(ctx.texts.some((t) => t.includes('Engineer @ Apró'))).toBe(true)
  })

  it('sign paints the name and role', () => {
    const ctx = makeCtx()
    paintSign({ ...exhibit, kind: 'sign', title: 'Tómas', subtitle: 'Engineer' })(ctx, 1536, 320)
    expect(ctx.texts).toEqual(['Tómas', 'Engineer'])
  })

  it('corkboard paints a card per link without the scheme', () => {
    const ctx = makeCtx()
    paintCorkboard({ ...exhibit, kind: 'corkboard' })(ctx, 768, 624)
    expect(ctx.texts).toContain('GitHub')
    expect(ctx.texts).toContain('github.com/x/y')
    expect(ctx.texts).toContain('me@example.com')
  })

  it('spine paints the label, shortening it to fit', () => {
    const ctx = makeCtx()
    paintSpine('TypeScript', '#333')(ctx, 64, 384)
    expect(ctx.texts).toEqual(['TypeScript'])
    const long = makeCtx()
    paintSpine('Claude API & Agent SDK and quite a few more words than fit', '#333')(long, 64, 384)
    expect(long.texts[0].endsWith('…')).toBe(true)
  })
})

describe('clock', () => {
  it('reads Reykjavík time as UTC', () => {
    expect(reykjavikTime(new Date('2026-07-01T13:45:10Z'))).toEqual({ hours: 13, minutes: 45, seconds: 10 })
  })

  it('paints the face with its badge', () => {
    const ctx = makeCtx()
    paintClock(ctx, 512, 512, new Date('2026-07-01T13:45:10Z'))
    expect(ctx.texts).toEqual(['RVK', 'UTC±0'])
    expect(ctx.arc).toHaveBeenCalled()
  })
})
