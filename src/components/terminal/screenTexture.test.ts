import { describe, it, expect, vi } from 'vitest'
import { wrapLines, drawScreen, phosphorColor, SCREEN, SCREEN_BG_ON, SCREEN_BG_OFF, createMatrixState, drawMatrixFrame, createDvdState, drawDvdFrame } from './screenTexture'

/** Minimal 2D context stub that records what was painted */
const makeCtx = (charWidth = 10) => {
  const gradient = { addColorStop: vi.fn() }
  const ctx = {
    fillStyle: '' as string | object,
    font: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    fillRects: [] as { x: number; y: number; w: number; h: number; style: string | object }[],
    texts: [] as { text: string; x: number; y: number }[],
    save: vi.fn(),
    restore: vi.fn(),
    measureText: vi.fn(() => ({ width: charWidth })),
    createRadialGradient: vi.fn(() => gradient),
    fillRect(x: number, y: number, w: number, h: number) {
      this.fillRects.push({ x, y, w, h, style: this.fillStyle })
    },
    fillText(text: string, x: number, y: number) {
      this.texts.push({ text, x, y })
    },
  }
  return ctx as unknown as CanvasRenderingContext2D & typeof ctx
}

describe('wrapLines', () => {
  it('leaves short lines alone', () => {
    expect(wrapLines(['abc', ''], 10)).toEqual(['abc', ''])
  })

  it('breaks at the last space inside the width', () => {
    expect(wrapLines(['hello brave new world'], 12)).toEqual(['hello brave', 'new world'])
  })

  it('hard-breaks tokens longer than the width', () => {
    expect(wrapLines(['abcdefghij'], 4)).toEqual(['abcd', 'efgh', 'ij'])
  })

  it('never loops on a zero width', () => {
    expect(wrapLines(['ab'], 0)).toEqual(['a', 'b'])
  })
})

describe('phosphorColor', () => {
  it('brightens the default accent and passes custom colors through', () => {
    expect(phosphorColor('#22c55e')).toBe('#39ff6e')
    expect(phosphorColor('#ff8800')).toBe('#ff8800')
  })
})

describe('drawScreen', () => {
  it('paints the raster, the last rows and a block cursor when powered', () => {
    const ctx = makeCtx(10)
    const lines = Array.from({ length: 40 }, (_, i) => `line ${i}`)
    drawScreen({ ctx, lines, color: '#39ff6e', cursorVisible: true, power: true })

    expect(ctx.fillRects[0]).toMatchObject({ x: 0, y: 0, w: SCREEN.width, h: SCREEN.height, style: SCREEN_BG_ON })
    const maxRows = Math.floor((SCREEN.height - SCREEN.margin * 2) / SCREEN.lineHeight)
    expect(ctx.texts).toHaveLength(maxRows)
    expect(ctx.texts[ctx.texts.length - 1].text).toBe('line 39')
    expect(ctx.texts[0].y).toBe(SCREEN.margin)

    const cursor = ctx.fillRects.find((r) => r.style === '#39ff6e')
    expect(cursor).toBeDefined()
    expect(cursor!.x).toBe(SCREEN.margin + 'line 39'.length * 10 + 2)
  })

  it('draws no cursor when it is blinked off', () => {
    const ctx = makeCtx()
    drawScreen({ ctx, lines: ['$ '], color: '#39ff6e', cursorVisible: false, power: true })
    expect(ctx.fillRects.some((r) => r.style === '#39ff6e')).toBe(false)
  })

  it('paints only dead glass when powered off', () => {
    const ctx = makeCtx()
    drawScreen({ ctx, lines: ['$ hello'], color: '#39ff6e', cursorVisible: true, power: false })
    expect(ctx.fillRects[0].style).toBe(SCREEN_BG_OFF)
    expect(ctx.texts).toHaveLength(0)
  })
})

describe('screensavers', () => {
  it('matrix rain advances every column and recycles heads that fall off', () => {
    const ctx = makeCtx()
    const state = createMatrixState(() => 0.5)
    const before = [...state.heads]
    drawMatrixFrame(ctx, state, '#39ff6e', () => 0.5)
    expect(state.started).toBe(true)
    state.heads.forEach((h, i) => expect(h).toBeGreaterThan(before[i]))
    expect(ctx.fillRects[0].style).toBe('#000')
    state.heads[0] = 10_000
    drawMatrixFrame(ctx, state, '#39ff6e', () => 0.5)
    expect(state.heads[0]).toBeLessThan(0)
  })

  it('dvd logo bounces off the edges and changes hue', () => {
    const ctx = Object.assign(makeCtx(), { strokeStyle: '', lineWidth: 0, textAlign: '', beginPath: vi.fn(), roundRect: vi.fn(), stroke: vi.fn() })
    const state = createDvdState()
    state.x = SCREEN.width - 262
    state.vx = 5
    const hue = state.hue
    drawDvdFrame(ctx, state)
    expect(state.vx).toBe(-5)
    expect(state.hue).not.toBe(hue)
    expect(ctx.texts.map((t) => t.text)).toContain('tomasari.is')
  })
})
