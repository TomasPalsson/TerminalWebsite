import { describe, it, expect } from 'vitest'
import { parseViewerCommand, phosphorize, hexDump, clampZoom } from './cvViewer'

describe('parseViewerCommand', () => {
  it('parses page numbers with or without the colon', () => {
    expect(parseViewerCommand(':2')).toEqual({ type: 'goto', page: 2 })
    expect(parseViewerCommand('7')).toEqual({ type: 'goto', page: 7 })
  })

  it('parses zoom and clamps it', () => {
    expect(parseViewerCommand(':zoom 150')).toEqual({ type: 'zoom', percent: 150 })
    expect(parseViewerCommand(':z 9999')).toEqual({ type: 'zoom', percent: 300 })
    expect(parseViewerCommand(':zoom')).toEqual({ type: 'unknown', input: 'zoom' })
  })

  it('maps aliases to modes and actions', () => {
    expect(parseViewerCommand(':cat')).toEqual({ type: 'mode', mode: 'text' })
    expect(parseViewerCommand(':xxd')).toEqual({ type: 'mode', mode: 'hex' })
    expect(parseViewerCommand(':pdf')).toEqual({ type: 'mode', mode: 'pdf' })
    expect(parseViewerCommand(':crt')).toEqual({ type: 'phosphor' })
    expect(parseViewerCommand(':w')).toEqual({ type: 'download' })
    expect(parseViewerCommand(':q')).toEqual({ type: 'quit' })
    expect(parseViewerCommand(':help')).toEqual({ type: 'help' })
  })

  it('returns unknown for garbage', () => {
    expect(parseViewerCommand(':frobnicate')).toEqual({ type: 'unknown', input: 'frobnicate' })
  })
})

describe('clampZoom', () => {
  it('keeps zoom inside the allowed range', () => {
    expect(clampZoom(10)).toBe(50)
    expect(clampZoom(125.4)).toBe(125)
    expect(clampZoom(1000)).toBe(300)
  })
})

describe('phosphorize', () => {
  it('turns white to black and black to terminal green', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])
    phosphorize(data)
    expect(Array.from(data.slice(0, 4))).toEqual([0, 0, 0, 255])
    expect(Array.from(data.slice(4, 8))).toEqual([34, 197, 94, 255])
  })
})

describe('hexDump', () => {
  it('formats like xxd with an ascii gutter', () => {
    const bytes = new TextEncoder().encode('%PDF-1.7\n\x00hello world!!')
    const lines = hexDump(bytes)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('00000000: 2550 4446 2d31 2e37 0a00 6865 6c6c 6f20  %PDF-1.7..hello ')
    expect(lines[1]).toBe('00000010: 776f 726c 6421 21                        world!!')
  })

  it('respects the byte limit', () => {
    expect(hexDump(new Uint8Array(1000), 64)).toHaveLength(4)
  })
})
