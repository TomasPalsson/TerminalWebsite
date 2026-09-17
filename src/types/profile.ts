// Shared profile contract, served from GET https://api.tomas.im/profile.
// The same JSON also drives PDF CV generation, so this type must tolerate
// fields the website doesn't render.

export type L = {
  en: string
  is?: string
}

export type ShowTarget = 'cv' | 'website'

export type Bullets = {
  en: string[]
  is?: string[]
}

export type Contact = {
  location: L
  phone: string
  email: string
  website: string
  github: string
  linkedin: string
}

export type Experience = {
  company: string
  role: L
  start: string
  end: string | null
  location: L
  product?: string
  link?: string
  bullets: Bullets
  show?: ShowTarget[]
}

export type Project = {
  name: L
  tagline?: L
  stack: string[]
  github?: string
  link?: string
  bullets: Bullets
  features?: string[]
  show?: ShowTarget[]
}

export type Education = {
  school: L
  degree: L
  start: string
  end: string | null
  link?: string
  description?: L
  show?: ShowTarget[]
}

export type Certification = {
  name: string
  issuer: string
  issued: string
  description?: L
  badge: string
  link: string
  show?: ShowTarget[]
}

export type Skill = {
  label: L
  items: L
  show?: ShowTarget[]
}

export type Profile = {
  name: string
  birthday: string
  role: L
  summary: L
  contact: Contact
  experience: Experience[]
  projects: Project[]
  education: Education[]
  certifications: Certification[]
  skills: Skill[]
  references: L
}
