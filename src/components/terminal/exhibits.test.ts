import { describe, it, expect } from 'vitest'
import { buildExhibits, duckTip, exhibitNormal, exhibitView, skillBooks, ROOM, DESK_BOUNDS } from './exhibits'
import type { Profile } from '@/types/profile'

const profile: Profile = {
  name: 'Tómas Ari Pálsson',
  birthday: '2004-12-22',
  role: { en: 'Software Engineer · AI & Cloud' },
  summary: { en: '' },
  contact: {
    location: { en: 'Kópavogur, Iceland' },
    phone: '',
    email: 'tomas@p5.is',
    website: 'https://tomasari.is',
    github: 'https://github.com/TomasPalsson',
    linkedin: 'https://linkedin.com/in/x',
  },
  experience: [
    { company: 'Apró', role: { en: 'Software Engineer' }, start: '2025-12', end: null, location: { en: 'Reykjavík' }, link: 'https://apro.is', bullets: { en: ['a'] } },
    { company: 'Hidden', role: { en: 'Nope' }, start: '2020', end: '2021', location: { en: '' }, bullets: { en: [] }, show: ['cv'] },
  ],
  projects: [
    { name: { en: 'Næsta Skref' }, tagline: { en: 'BSc final project' }, stack: ['Python'], link: 'https://ai.naestaskref.is', bullets: { en: ['x'] } },
    { name: { en: 'Terminal Portfolio' }, stack: ['React'], github: 'https://github.com/x/y', bullets: { en: ['y'] } },
  ],
  education: [{ school: { en: 'Reykjavík University' }, degree: { en: 'BSc Software Engineering' }, start: '2023', end: '2026' }],
  certifications: [
    { name: 'Claude Certified Architect – Professional', issuer: 'Anthropic', issued: '2026-08', badge: '/pro.png', link: 'https://verify/1' },
    { name: 'Claude Certified Architect – Foundations', issuer: 'Anthropic', issued: '2026-07', badge: '/found.png', link: 'https://verify/2' },
  ],
  skills: [
    { label: { en: 'Cloud' }, items: { en: 'AWS (Lambda, S3), Terraform' } },
    { label: { en: 'Spoken' }, items: { en: 'Icelandic (native), English (fluent, 7 years in the UK)' } },
  ],
  references: { en: '' },
}

describe('skillBooks', () => {
  it('expands bracketed lists of single words into their own books', () => {
    expect(skillBooks('AWS (Lambda, S3), Terraform')).toEqual(['AWS', 'Terraform', 'Lambda', 'S3'])
  })

  it('drops brackets that are prose', () => {
    expect(skillBooks('Icelandic (native), English (fluent, 7 years in the UK)')).toEqual(['Icelandic', 'English'])
  })
})

describe('buildExhibits', () => {
  it('always includes the sign, window, duck, clock and lava lamp', () => {
    const ids = buildExhibits(null).map((e) => e.id)
    expect(ids).toEqual(['sign', 'window', 'duck', 'clock', 'lava'])
  })

  it('falls back to a default name without a profile', () => {
    expect(buildExhibits(null).find((e) => e.id === 'sign')?.title).toBe('Tómas Ari Pálsson')
  })

  it('hangs the profile around the room', () => {
    const exhibits = buildExhibits(profile)
    const ids = exhibits.map((e) => e.id)
    expect(ids).toContain('cert-1')
    expect(ids).toContain('cert-2')
    expect(ids).toContain('project-naesta-skref')
    expect(ids).toContain('project-terminal-portfolio')
    expect(ids).toContain('timeline')
    expect(ids).toContain('skills')
    expect(ids).toContain('contact')
  })

  it('respects show targets', () => {
    const timeline = buildExhibits(profile).find((e) => e.id === 'timeline')!
    expect(timeline.lines.join('\n')).not.toContain('Hidden')
    expect(timeline.lines[0]).toBe('Dec 2025 - Present — Software Engineer @ Apró')
    expect(timeline.links).toEqual([{ label: 'Apró', href: 'https://apro.is' }])
  })

  it('links projects to their site or repo', () => {
    const exhibits = buildExhibits(profile)
    expect(exhibits.find((e) => e.id === 'project-naesta-skref')?.links).toEqual([{ label: 'Open project', href: 'https://ai.naestaskref.is' }])
    expect(exhibits.find((e) => e.id === 'project-terminal-portfolio')?.links).toEqual([{ label: 'GitHub', href: 'https://github.com/x/y' }])
  })

  it('places posters on the left wall facing into the room and certs on the back wall', () => {
    const exhibits = buildExhibits(profile)
    const poster = exhibits.find((e) => e.id === 'project-naesta-skref')!
    expect(poster.position[0]).toBeCloseTo(ROOM.minX, 1)
    expect(exhibitNormal(poster)[0]).toBeCloseTo(1)
    const cert = exhibits.find((e) => e.id === 'cert-1')!
    expect(cert.position[2]).toBeCloseTo(ROOM.minZ, 1)
    expect(cert.image).toBe('/pro.png')
  })

  it('keeps every exhibit inside the room and off the walkable desk area unless it sits on the desk', () => {
    buildExhibits(profile).forEach((e) => {
      expect(e.position[0]).toBeGreaterThanOrEqual(ROOM.minX)
      expect(e.position[0]).toBeLessThanOrEqual(ROOM.maxX)
      expect(e.position[2]).toBeGreaterThanOrEqual(ROOM.minZ)
      expect(e.position[2]).toBeLessThanOrEqual(ROOM.maxZ)
    })
    const duck = buildExhibits(profile).find((e) => e.id === 'duck')!
    expect(duck.position[0]).toBeGreaterThan(DESK_BOUNDS.minX)
  })
})

describe('exhibitView', () => {
  it('stands in front of the face, looking at it', () => {
    const poster = buildExhibits(profile).find((e) => e.id === 'project-naesta-skref')!
    const view = exhibitView(poster)
    expect(view.position[0]).toBeGreaterThan(poster.position[0])
    expect(view.target).toEqual(poster.position)
  })

  it('looks down at desk residents', () => {
    const duck = buildExhibits(null).find((e) => e.id === 'duck')!
    expect(exhibitView(duck).position[1]).toBeGreaterThan(duck.position[1])
  })
})

describe('duckTip', () => {
  it('picks deterministically from the tip list', () => {
    expect(duckTip(() => 0)).toContain('Explain the bug')
    expect(duckTip(() => 0.999)).toContain('pair programmer')
  })
})
