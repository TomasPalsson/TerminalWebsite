import type { Profile } from '@/types/profile'
import { formatMonth, formatPeriod, visible } from '@/services/profile'

/** What kind of thing hangs in the room; drives both the 3D rendering and the info card */
export type ExhibitKind = 'poster' | 'cert' | 'board' | 'shelf' | 'sign' | 'corkboard' | 'duck' | 'window' | 'clock' | 'lava'

export type ExhibitLink = { label: string; href: string }

export type Exhibit = {
  id: string
  kind: ExhibitKind
  title: string
  subtitle?: string
  /** Body lines shown on the info card (and painted onto posters/boards) */
  lines: string[]
  tags?: string[]
  links?: ExhibitLink[]
  /** Optional image for framed pictures (certificates) */
  image?: string
  /** World position of the exhibit's centre */
  position: [number, number, number]
  /** Yaw in radians; 0 faces +z (toward the player at the desk) */
  rotationY: number
  /** Width and height of the face in world units */
  size: [number, number]
}

/** Interior of the room; walls sit just outside these */
export const ROOM = {
  floorY: -0.86,
  ceilingY: 2.1,
  minX: -3.2,
  maxX: 3.2,
  minZ: -0.8,
  maxZ: 5.2,
} as const

/** Footprint of the desk (with a little margin) that the player cannot walk into */
export const DESK_BOUNDS = { minX: -1.4, maxX: 1.4, minZ: -0.75, maxZ: 1.05 } as const

const WALL_GAP = 0.012
const LEFT_X = ROOM.minX + WALL_GAP
const RIGHT_X = ROOM.maxX - WALL_GAP
const BACK_Z = ROOM.minZ + WALL_GAP

const DUCK_TIPS = [
  'Explain the bug to me, line by line. I will not interrupt.',
  'Have you tried turning the terminal off and on again? Type: scene power off',
  'Quack. That is duck for "add a test first".',
  'The room is full of things about Tómas — walk up to them and press E.',
  'Type "scene cam wide" to see the whole desk.',
  'Rubber ducks are the original AI pair programmer.',
]

/** A random tip from the debugging duck */
export const duckTip = (random = Math.random) => DUCK_TIPS[Math.floor(random() * DUCK_TIPS.length)]

/** Things that need no profile data */
const staticExhibits = (name: string, role: string): Exhibit[] => [
  {
    id: 'sign',
    kind: 'sign',
    title: name,
    subtitle: role,
    lines: ['Welcome to the room. Walk around (Explore) or type scene look.'],
    position: [0, 1.45, BACK_Z],
    rotationY: 0,
    size: [2.4, 0.5],
  },
  {
    id: 'window',
    kind: 'window',
    title: 'Kópavogur, Iceland',
    subtitle: 'The view from the office',
    lines: ['Aurora most winter nights. Wind every night.'],
    position: [2.3, 1.05, BACK_Z],
    rotationY: 0,
    size: [1.1, 0.9],
  },
  {
    id: 'duck',
    kind: 'duck',
    title: 'Debugging duck',
    subtitle: 'Senior rubber consultant',
    lines: [],
    position: [-0.34, -0.062, 0.32],
    rotationY: 0.4,
    size: [0.1, 0.1],
  },
  {
    id: 'clock',
    kind: 'clock',
    title: 'Reykjavík time',
    subtitle: 'UTC all year — Iceland skips daylight saving',
    lines: ['Runs on real time. Deadlines run on it too.'],
    position: [-2.3, 1.3, BACK_Z],
    rotationY: 0,
    size: [0.42, 0.42],
  },
  {
    id: 'lava',
    kind: 'lava',
    title: 'Lava lamp',
    subtitle: 'Est. 1996 · still compiling',
    lines: ['Thinking indicator for the whole desk. Wax rises when the build passes.'],
    position: [0.98, -0.062, -0.1],
    rotationY: 0,
    size: [0.12, 0.36],
  },
]

/** "Næsta Skref" → "project-naesta-skref": Icelandic letters get ASCII stand-ins before the slug */
const projectId = (name: string) =>
  'project-' +
  name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const certExhibits = (profile: Profile): Exhibit[] =>
  visible(profile.certifications).slice(0, 2).map((cert, i) => ({
    id: `cert-${i + 1}`,
    kind: 'cert',
    title: cert.name,
    subtitle: `${cert.issuer} · ${formatMonth(cert.issued)}`,
    lines: cert.description ? [cert.description.en] : [],
    links: [{ label: 'Verify credential', href: cert.link }],
    image: cert.badge,
    position: [i === 0 ? -1.25 : 1.25, 0.85, BACK_Z],
    rotationY: 0,
    size: [0.55, 0.55],
  }))

const projectExhibits = (profile: Profile): Exhibit[] =>
  visible(profile.projects).slice(0, 4).map((project, i) => {
    const links: ExhibitLink[] = []
    if (project.link) links.push({ label: 'Open project', href: project.link })
    if (project.github) links.push({ label: 'GitHub', href: project.github })
    return {
      id: projectId(project.name.en),
      kind: 'poster',
      title: project.name.en,
      subtitle: project.tagline?.en,
      lines: project.bullets.en,
      tags: project.stack,
      links,
      position: [LEFT_X, 0.95, 0.35 + i * 0.95],
      rotationY: Math.PI / 2,
      size: [0.7, 0.95],
    }
  })

const timelineExhibit = (profile: Profile): Exhibit => {
  const experience = visible(profile.experience)
  const education = visible(profile.education)
  return {
    id: 'timeline',
    kind: 'board',
    title: 'Experience & education',
    subtitle: profile.contact.location.en,
    lines: [
      ...experience.map((e) => `${formatPeriod(e.start, e.end)} — ${e.role.en} @ ${e.company}`),
      ...education.map((e) => `${formatPeriod(e.start, e.end)} — ${e.degree.en}, ${e.school.en}`),
    ],
    links: experience.filter((e) => e.link).map((e) => ({ label: e.company, href: e.link! })),
    position: [RIGHT_X, 1.0, 1.0],
    rotationY: -Math.PI / 2,
    size: [1.7, 1.05],
  }
}

/**
 * Splits "AWS (Lambda, S3), Terraform, Icelandic (native)" into book titles:
 * bracketed lists of single words become their own books, other brackets are dropped.
 */
export function skillBooks(items: string): string[] {
  const out: string[] = []
  const withExtras = items.replace(/\s*\(([^)]*)\)/g, (_, inner: string) => {
    const parts = inner.split(/,\s*/).map((p) => p.trim()).filter(Boolean)
    if (parts.length > 1 && parts.every((p) => !p.includes(' '))) out.push(...parts)
    return ''
  })
  return [...withExtras.split(/,\s*/).map((p) => p.trim()).filter(Boolean), ...out]
}

const skillsExhibit = (profile: Profile): Exhibit => {
  const skills = visible(profile.skills)
  return {
    id: 'skills',
    kind: 'shelf',
    title: 'Skills shelf',
    subtitle: 'Every book is something I use',
    lines: skills.map((s) => `${s.label.en}: ${s.items.en}`),
    tags: skills.flatMap((s) => skillBooks(s.items.en)),
    position: [RIGHT_X - 0.14, ROOM.floorY + 0.86, 3.0],
    rotationY: -Math.PI / 2,
    size: [1.0, 1.72],
  }
}

const contactExhibit = ({ contact }: Profile): Exhibit => ({
  id: 'contact',
  kind: 'corkboard',
  title: 'Get in touch',
  subtitle: contact.location.en,
  lines: [contact.email, contact.website.replace(/^https?:\/\//, '')],
  links: [
    { label: 'GitHub', href: contact.github },
    { label: 'LinkedIn', href: contact.linkedin },
    { label: 'Email', href: `mailto:${contact.email}` },
    { label: 'Website', href: contact.website },
  ],
  position: [LEFT_X, 1.0, 4.45],
  rotationY: Math.PI / 2,
  size: [0.95, 0.72],
})

/**
 * Lays the profile out around the room:
 * - name sign, window and duck (always)
 * - certificates flanking the monitor on the back wall
 * - project posters along the left wall
 * - experience/education whiteboard and the skills shelf on the right wall
 * - contact corkboard by the door
 */
export function buildExhibits(profile: Profile | null): Exhibit[] {
  const base = staticExhibits(profile?.name ?? 'Tómas Ari Pálsson', profile?.role.en ?? 'Software Engineer')
  if (!profile) return base
  return [
    ...base,
    ...certExhibits(profile),
    ...projectExhibits(profile),
    timelineExhibit(profile),
    skillsExhibit(profile),
    contactExhibit(profile),
  ]
}

/** Unit normal the exhibit faces (where a viewer should stand) */
export const exhibitNormal = (e: Exhibit): [number, number] => [Math.sin(e.rotationY), Math.cos(e.rotationY)]

/** Camera position + target that frames the exhibit from the front */
export function exhibitView(e: Exhibit): { position: [number, number, number]; target: [number, number, number] } {
  const [nx, nz] = exhibitNormal(e)
  const distance = Math.min(2.2, Math.max(0.7, Math.max(...e.size) * 1.4))
  const eyeY = e.kind === 'duck' || e.kind === 'lava' ? e.position[1] + 0.3 : e.position[1] + 0.05
  return {
    position: [e.position[0] + nx * distance, eyeY, e.position[2] + nz * distance],
    target: [e.position[0], e.position[1], e.position[2]],
  }
}
